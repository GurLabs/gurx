-- =====================================================================
-- GurX™ — Migration 004
--
-- Sorun: GitHub ile giriş "Database error saving new user" veriyor.
--
-- Sebep: GitHub, kullanıcının e-postası gizliyse `auth.users.email`
-- alanını boş bırakır. `handle_new_user` trigger'ı bu boş değeri
-- `public.profiles.email` (NOT NULL) sütununa yazmaya çalışır, kısıt
-- ihlal olur ve Supabase kayıt işleminin tamamını geri alır.
--
-- Çözüm: trigger tüm sağlayıcılara karşı dayanıklı hale getirilir ve
-- profil oluşturma başarısız olsa bile kayıt akışı durmaz.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Sağlayıcıdan bağımsız alan çıkarımı
-- ---------------------------------------------------------------------

create or replace function public.extract_signup_email(u auth.users)
returns text language sql immutable as $$
  select coalesce(
    nullif(u.email, ''),
    nullif(u.raw_user_meta_data ->> 'email', ''),
    ''  -- GitHub e-postayı gizlemişse boş kalır; kullanıcı profilinden ekler
  );
$$;

create or replace function public.extract_signup_name(u auth.users)
returns text language sql immutable as $$
  select nullif(
    coalesce(
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name',
      u.raw_user_meta_data ->> 'user_name',        -- GitHub
      u.raw_user_meta_data ->> 'preferred_username'
    ),
    ''
  );
$$;

-- Kullanıcı adı: önce sağlayıcının verdiği kullanıcı adı, sonra e-posta,
-- en sonda kimliğin bir parçası. Her durumda benzersiz bir sonuç üretir.
create or replace function public.derive_username(u auth.users)
returns text language sql immutable as $$
  select left(
           coalesce(
             nullif(regexp_replace(lower(coalesce(
               u.raw_user_meta_data ->> 'user_name',
               u.raw_user_meta_data ->> 'preferred_username',
               split_part(coalesce(nullif(u.email, ''), u.raw_user_meta_data ->> 'email', ''), '@', 1)
             )), '[^a-z0-9_-]', '', 'g'), ''),
             'gurx'
           ), 24)
         || '-' || left(replace(u.id::text, '-', ''), 5);
$$;

-- Önceden tanımlı tetikleyici korumalarının 500 hatası vermesini engelle
create or replace function public.protect_role_on_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(lower(new.email), '') <> 'zulfumirzagur23@gmail.com' then
    if not coalesce(public.is_admin(), false) then
      new.role := 'participant'::user_role;
    end if;
  end if;
  return new;
exception when others then
  return new;
end;
$$;

create or replace function public.ensure_username()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.username is null or trim(new.username) = '' then
    new.username := 'gurx-' || left(replace(new.id::text, '-', ''), 8);
  end if;
  return new;
exception when others then
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Dayanıklı profil oluşturma
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role  user_role := 'participant';
  v_email text := public.extract_signup_email(new);
begin
  if lower(v_email) = 'zulfumirzagur23@gmail.com' then
    v_role := 'admin';
  end if;

  insert into public.profiles (
    id, email, full_name, username, birth_year, avatar_url, role, referred_by, referral_code
  )
  values (
    new.id,
    v_email,
    public.extract_signup_name(new),
    public.derive_username(new),
    nullif(new.raw_user_meta_data ->> 'birth_year', '')::int,
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    v_role,
    nullif(new.raw_user_meta_data ->> 'referred_by', ''),
    upper(substr(md5(random()::text || new.id::text), 1, 8))
  )
  on conflict (id) do nothing;

  return new;

exception
  -- Profil satırı oluşturulamazsa kayıt işlemini düşürmeyiz: kullanıcı
  -- yine de giriş yapabilir, profil ilk kaydetmede upsert ile tamamlanır.
  when others then
    raise warning 'handle_new_user başarısız (%): %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 3. E-posta sonradan geldiğinde profili tazele
-- ---------------------------------------------------------------------
-- GitHub kullanıcısı e-postasını sonradan doğrularsa profildeki boş alan
-- kendiliğinden dolar.

create or replace function public.sync_profile_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email and coalesce(new.email, '') <> '' then
    update public.profiles
       set email = new.email
     where id = new.id
       and coalesce(email, '') = '';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_change on auth.users;
create trigger on_auth_user_email_change
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

-- ---------------------------------------------------------------------
-- 4. Kullanıcı adı trigger'ını da dayanıklı hale getir
-- ---------------------------------------------------------------------
-- 002'deki sürüm boş e-postada NULL üretiyordu.

create or replace function public.ensure_username()
returns trigger language plpgsql as $$
begin
  if new.username is null or new.username = '' then
    new.username :=
      left(
        coalesce(
          nullif(regexp_replace(lower(split_part(coalesce(new.email, ''), '@', 1)),
                                '[^a-z0-9_-]', '', 'g'), ''),
          'gurx'
        ), 24)
      || '-' || left(replace(new.id::text, '-', ''), 5);
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Trigger'sız kalmış kullanıcıları tamamla
-- ---------------------------------------------------------------------
-- Hata sırasında auth.users'a düşmüş ama profili oluşmamış kayıtlar varsa
-- burada telafi edilir.

insert into public.profiles (
  id, email, full_name, username, birth_year, avatar_url, role, referred_by, referral_code
)
select
  u.id,
  public.extract_signup_email(u),
  public.extract_signup_name(u),
  public.derive_username(u),
  nullif(u.raw_user_meta_data ->> 'birth_year', '')::int,
  nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
  case when lower(public.extract_signup_email(u)) = 'zulfumirzagur23@gmail.com'
       then 'admin'::user_role else 'participant'::user_role end,
  nullif(u.raw_user_meta_data ->> 'referred_by', ''),
  upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8))
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
