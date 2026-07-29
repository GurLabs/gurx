-- =====================================================================
-- GurX™ Design Awards — Supabase şeması
-- GurLabs Foundation™
--
-- Kurulum: Supabase Dashboard → SQL Editor → bu dosyanın tamamını çalıştırın.
-- Ardından Authentication → Providers → Google sağlayıcısını etkinleştirin.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. Roller ve profiller
-- ---------------------------------------------------------------------

do $$ begin
  create type user_role as enum ('participant', 'staff', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  full_name     text,
  birth_year    int,
  avatar_url    text,
  role          user_role not null default 'participant',
  country       text,
  portfolio_url text,
  github_url    text,
  linkedin_url  text,
  referral_code text unique,
  referred_by   text,
  created_at    timestamptz not null default now()
);

create or replace function public.extract_signup_email(u auth.users)
returns text language sql immutable as $$
  select coalesce(
    nullif(u.email, ''),
    nullif(u.raw_user_meta_data ->> 'email', ''),
    ''
  );
$$;

create or replace function public.extract_signup_name(u auth.users)
returns text language sql immutable as $$
  select nullif(
    coalesce(
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name',
      u.raw_user_meta_data ->> 'user_name',
      u.raw_user_meta_data ->> 'preferred_username'
    ),
    ''
  );
$$;

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

-- Yeni kullanıcı kaydolduğunda profili otomatik oluştur.
-- Kurucu admin e-postası doğrudan admin rolü alır.
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
    upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8))
  )
  on conflict (id) do nothing;

  return new;

exception
  when others then
    raise warning 'handle_new_user başarısız (%): %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Şema kurulmadan önce kaydolmuş kullanıcılar için geriye dönük profil oluştur.
-- Tetikleyici yalnızca yeni kayıtlarda çalıştığı için bu adım gereklidir.
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

-- Kurucu admin, profili daha önce oluşmuş olsa bile admin rolünü alır.
update public.profiles
   set role = 'admin'
 where lower(email) = 'zulfumirzagur23@gmail.com'
   and role <> 'admin';

-- Rol kontrolleri. SECURITY DEFINER olmaları RLS özyinelemesini önler.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff', 'admin'));
$$;

-- ---------------------------------------------------------------------
-- 2. Yarışmalar
-- ---------------------------------------------------------------------

do $$ begin
  create type competition_status as enum
    ('upcoming', 'registration_open', 'topic_revealed', 'in_progress', 'voting', 'completed');
exception when duplicate_object then null; end $$;

create table if not exists public.competitions (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  title                  text not null,
  subtitle               text,
  category               text not null default 'Vibe Coding · UI/UX',
  event_code             text not null default 'GYD',
  status                 competition_status not null default 'upcoming',
  cover_image            text,
  registration_opens_at  timestamptz,
  registration_closes_at timestamptz,
  topic_reveal_at        timestamptz,
  topic                  text,
  submission_deadline_at timestamptz,
  voting_opens_at        timestamptz,
  voting_closes_at       timestamptz,
  results_at             timestamptz,
  min_age                int not null default 15,
  max_age                int not null default 21,
  created_at             timestamptz not null default now()
);

-- Konu, açıklanma saatinden önce hiç kimseye gönderilmez.
create or replace function public.topic_is_public(c public.competitions)
returns boolean language sql stable as $$
  select c.topic_reveal_at is not null and now() >= c.topic_reveal_at;
$$;

-- ---------------------------------------------------------------------
-- 3. Başvurular
-- ---------------------------------------------------------------------

do $$ begin
  create type application_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.applications (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles (id) on delete cascade,
  competition_id       uuid not null references public.competitions (id) on delete cascade,
  full_name            text not null,
  email                text not null,
  birth_year           int not null,
  guardian_consent     boolean not null default false,
  reference_design_url text not null,
  reference_type       text not null default 'portfolio',
  portfolio_url        text,
  participant_no       int,
  status               application_status not null default 'pending',
  note                 text,
  created_at           timestamptz not null default now(),
  unique (user_id, competition_id)
);

-- Yaş kuralı ve veli izni veritabanı seviyesinde de zorunlu.
create or replace function public.enforce_application_rules()
returns trigger language plpgsql as $$
declare
  c public.competitions;
  v_age int;
begin
  select * into c from public.competitions where id = new.competition_id;
  v_age := extract(year from now())::int - new.birth_year;

  if v_age > c.max_age then
    raise exception 'Katılımcı % yaşında; üst yaş sınırı %.', v_age, c.max_age;
  end if;
  if v_age < c.min_age then
    raise exception 'Katılımcı % yaşında; alt yaş sınırı %.', v_age, c.min_age;
  end if;
  if v_age <= c.min_age and new.guardian_consent is not true then
    raise exception '% yaş ve altı için veli izni onayı zorunludur.', c.min_age;
  end if;

  -- Sıralı, benzersiz katılımcı numarası (sertifika kodundaki 0001 bölümü).
  if new.participant_no is null then
    select coalesce(max(participant_no), 0) + 1
      into new.participant_no
      from public.applications
      where competition_id = new.competition_id;
  end if;

  return new;
end;
$$;

drop trigger if exists applications_rules on public.applications;
create trigger applications_rules
  before insert on public.applications
  for each row execute function public.enforce_application_rules();

-- ---------------------------------------------------------------------
-- 4. Teslimler
-- ---------------------------------------------------------------------

create table if not exists public.submissions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  competition_id      uuid not null references public.competitions (id) on delete cascade,
  title               text not null,
  description         text,
  live_url            text not null,
  repo_url            text,
  hero_screenshot_url text not null,
  seo_notes           text,
  security_notes      text,
  is_published        boolean not null default true,
  submitted_at        timestamptz not null default now(),
  unique (user_id, competition_id)
);

-- Teslim yalnızca konu açıklandıktan sonra ve süre dolmadan önce kabul edilir.
create or replace function public.enforce_submission_window()
returns trigger language plpgsql as $$
declare
  c public.competitions;
  approved boolean;
begin
  select * into c from public.competitions where id = new.competition_id;

  select exists (
    select 1 from public.applications a
    where a.user_id = new.user_id
      and a.competition_id = new.competition_id
      and a.status = 'approved'
  ) into approved;

  if not approved then
    raise exception 'Teslim için onaylanmış bir başvuru gereklidir.';
  end if;
  if c.topic_reveal_at is not null and now() < c.topic_reveal_at then
    raise exception 'Teslim henüz açılmadı.';
  end if;
  if c.submission_deadline_at is not null and now() > c.submission_deadline_at then
    raise exception 'Teslim süresi doldu.';
  end if;

  return new;
end;
$$;

drop trigger if exists submissions_window on public.submissions;
create trigger submissions_window
  before insert or update on public.submissions
  for each row execute function public.enforce_submission_window();

-- ---------------------------------------------------------------------
-- 5. Oylar
-- ---------------------------------------------------------------------

create table if not exists public.votes (
  id             uuid primary key default gen_random_uuid(),
  voter_id       uuid not null references public.profiles (id) on delete cascade,
  submission_id  uuid not null references public.submissions (id) on delete cascade,
  design_score   int not null check (design_score between 1 and 10),
  seo_score      int not null check (seo_score between 1 and 10),
  security_score int not null check (security_score between 1 and 10),
  created_at     timestamptz not null default now(),
  unique (voter_id, submission_id)
);

-- Kimse kendi projesine oy veremez; oylama yalnızca pencere içinde açıktır
-- ve yalnızca projesini teslim etmiş katılımcılar oy kullanabilir.
create or replace function public.enforce_vote_rules()
returns trigger language plpgsql as $$
declare
  s public.submissions;
  c public.competitions;
begin
  select * into s from public.submissions where id = new.submission_id;
  select * into c from public.competitions where id = s.competition_id;

  if s.user_id = new.voter_id then
    raise exception 'Kendi projenize oy veremezsiniz.';
  end if;
  if not exists (
    select 1 from public.submissions x
    where x.user_id = new.voter_id and x.competition_id = s.competition_id
  ) then
    raise exception 'Oy kullanmak için bu yarışmaya proje teslim etmiş olmanız gerekir.';
  end if;
  if c.voting_opens_at is not null and now() < c.voting_opens_at then
    raise exception 'Oylama henüz açılmadı.';
  end if;
  if c.voting_closes_at is not null and now() > c.voting_closes_at then
    raise exception 'Oylama kapandı.';
  end if;

  return new;
end;
$$;

drop trigger if exists votes_rules on public.votes;
create trigger votes_rules
  before insert or update on public.votes
  for each row execute function public.enforce_vote_rules();

-- ---------------------------------------------------------------------
-- 6. Duyurular
-- ---------------------------------------------------------------------

create table if not exists public.announcements (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid references public.competitions (id) on delete cascade,
  title          text not null,
  body           text not null,
  audience       text not null default 'participants' check (audience in ('public', 'participants')),
  is_pinned      boolean not null default false,
  published_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. Sertifikalar
-- ---------------------------------------------------------------------
-- Kod biçimi: GYD-26-0001-01
--   GYD  = etkinlik kodu · 26 = yıl · 0001 = katılımcı ID · 01 = belge türü
--   01 Katılımcı · 02 Best Design · 03 Best SEO · 04 Best Security · 05 Grand Winner
--   06 Yetkili görev belgesi (jüri / moderatör / destekleyici)

create table if not exists public.certificates (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  user_id        uuid references public.profiles (id) on delete set null,
  competition_id uuid references public.competitions (id) on delete set null,
  recipient_name text not null,
  award_type     text not null check (award_type in ('01', '02', '03', '04', '05', '06')),
  event_code     text not null default 'GYD',
  issued_at      timestamptz not null default now(),
  revoked        boolean not null default false,
  issuer         text not null default 'GurX Youth Design & GurLabs Foundation™'
);

create index if not exists certificates_code_idx on public.certificates (code);
create index if not exists certificates_user_idx on public.certificates (user_id);

-- ---------------------------------------------------------------------
-- 8. Herkese açık görünümler
-- ---------------------------------------------------------------------

drop view if exists public.public_submissions;
create view public.public_submissions as
select
  s.id,
  s.user_id,
  s.competition_id,
  s.title,
  s.description,
  s.live_url,
  s.repo_url,
  s.hero_screenshot_url,
  s.seo_notes,
  s.security_notes,
  s.is_published,
  s.submitted_at,
  p.full_name as author_name,
  (select count(*) from public.votes v where v.submission_id = s.id) as vote_count
from public.submissions s
join public.profiles p on p.id = s.user_id
where s.is_published;

drop view if exists public.leaderboard;
create view public.leaderboard as
with scores as (
  select
    s.id                as submission_id,
    s.competition_id,
    s.title,
    s.live_url,
    s.hero_screenshot_url,
    p.full_name         as author_name,
    round(avg(v.design_score)::numeric, 1)   as design_score,
    round(avg(v.seo_score)::numeric, 1)      as seo_score,
    round(avg(v.security_score)::numeric, 1) as security_score,
    count(v.id)                              as vote_count
  from public.submissions s
  join public.profiles p on p.id = s.user_id
  left join public.votes v on v.submission_id = s.id
  where s.is_published
  group by s.id, s.competition_id, s.title, s.live_url, s.hero_screenshot_url, p.full_name
)
select
  sc.*,
  coalesce(sc.design_score, 0) + coalesce(sc.seo_score, 0) + coalesce(sc.security_score, 0)
    as total_score,
  rank() over (
    partition by sc.competition_id
    order by coalesce(sc.design_score, 0) + coalesce(sc.seo_score, 0) + coalesce(sc.security_score, 0) desc,
             coalesce(sc.design_score, 0) desc,
             coalesce(sc.security_score, 0) desc,
             coalesce(sc.seo_score, 0) desc
  ) as rank,
  (
    select c.award_type
    from public.certificates c
    where c.competition_id = sc.competition_id
      and c.user_id = (select s2.user_id from public.submissions s2 where s2.id = sc.submission_id)
      and c.award_type <> '01'
      and not c.revoked
    order by c.award_type desc
    limit 1
  ) as award_type
from scores sc;

grant select on public.public_submissions to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;

-- ---------------------------------------------------------------------
-- 9. Row Level Security
-- ---------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.competitions  enable row level security;
alter table public.applications  enable row level security;
alter table public.submissions   enable row level security;
alter table public.votes         enable row level security;
alter table public.announcements enable row level security;
alter table public.certificates  enable row level security;

-- profiles ------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- Rolü yalnızca admin değiştirebilir: kullanıcı kendi satırını güncellerken
-- role sütununu değiştiremez.
create or replace function public.protect_role_column()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Rol değiştirme yetkiniz yok.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_role_column();

-- competitions --------------------------------------------------------
drop policy if exists competitions_read on public.competitions;
create policy competitions_read on public.competitions for select using (true);

drop policy if exists competitions_admin on public.competitions;
create policy competitions_admin on public.competitions
  for all using (public.is_admin()) with check (public.is_admin());

-- applications --------------------------------------------------------
drop policy if exists applications_select on public.applications;
create policy applications_select on public.applications
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists applications_insert_own on public.applications;
create policy applications_insert_own on public.applications
  for insert with check (user_id = auth.uid());

drop policy if exists applications_update_own on public.applications;
create policy applications_update_own on public.applications
  for update using (user_id = auth.uid() and status <> 'approved')
  with check (user_id = auth.uid());

drop policy if exists applications_staff on public.applications;
create policy applications_staff on public.applications
  for all using (public.is_staff()) with check (public.is_staff());

-- submissions ---------------------------------------------------------
drop policy if exists submissions_select on public.submissions;
create policy submissions_select on public.submissions
  for select using (user_id = auth.uid() or is_published or public.is_staff());

drop policy if exists submissions_write_own on public.submissions;
create policy submissions_write_own on public.submissions
  for insert with check (user_id = auth.uid());

drop policy if exists submissions_update_own on public.submissions;
create policy submissions_update_own on public.submissions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists submissions_staff on public.submissions;
create policy submissions_staff on public.submissions
  for all using (public.is_staff()) with check (public.is_staff());

-- votes ---------------------------------------------------------------
drop policy if exists votes_select_own on public.votes;
create policy votes_select_own on public.votes
  for select using (voter_id = auth.uid() or public.is_staff());

drop policy if exists votes_insert_own on public.votes;
create policy votes_insert_own on public.votes
  for insert with check (voter_id = auth.uid());

drop policy if exists votes_update_own on public.votes;
create policy votes_update_own on public.votes
  for update using (voter_id = auth.uid()) with check (voter_id = auth.uid());

-- announcements -------------------------------------------------------
drop policy if exists announcements_read_public on public.announcements;
create policy announcements_read_public on public.announcements
  for select using (audience = 'public' or auth.uid() is not null);

drop policy if exists announcements_staff on public.announcements;
create policy announcements_staff on public.announcements
  for all using (public.is_staff()) with check (public.is_staff());

-- certificates --------------------------------------------------------
-- Doğrulama sayfası herkese açıktır: sertifika kaydı anonim olarak okunabilir.
drop policy if exists certificates_read on public.certificates;
create policy certificates_read on public.certificates for select using (true);

drop policy if exists certificates_admin on public.certificates;
create policy certificates_admin on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 10. Başlangıç verisi — GurX Youth Design 2026
-- ---------------------------------------------------------------------

insert into public.competitions (
  slug, title, subtitle, category, event_code, status, cover_image,
  registration_opens_at, registration_closes_at,
  topic_reveal_at, submission_deadline_at,
  voting_opens_at, voting_closes_at, results_at,
  min_age, max_age
) values (
  'gurx-youth-design-2026',
  'GurX Youth Design 2026',
  '24 saatlik Vibe Coding tasarım maratonu',
  'Vibe Coding · UI/UX',
  'GYD',
  'registration_open',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
  now(),
  now() + interval '14 days',
  now() + interval '16 days',
  now() + interval '17 days',
  now() + interval '17 days',
  now() + interval '20 days',
  now() + interval '22 days',
  15, 21
)
on conflict (slug) do nothing;

insert into public.announcements (competition_id, title, body, audience, is_pinned)
select id, 'Başvurular açıldı',
       'GurX Youth Design 2026 başvuruları açıldı. Referans tasarımınızı ve portfolyo bağlantınızı hazırlayın.',
       'public', true
from public.competitions where slug = 'gurx-youth-design-2026'
on conflict do nothing;
