-- =====================================================================
-- GurX™ — Migration 003
--
-- 1. Profil kaydetme 403 hatasının düzeltmesi (eksik INSERT politikası)
-- 2. Staff görev rolleri (Co-Organizer, Moderator, Developer, Marketing Lead, Jüri)
-- 3. Admin'in yeni yarışma oluşturabilmesi için gereken izinler
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles: kendi satırını oluşturabilme
-- ---------------------------------------------------------------------
-- upsert, satır yoksa INSERT dener. INSERT politikası olmadığı için
-- PostgREST 403 döndürüyordu.

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- Rol sütunu INSERT sırasında da korunmalı: kullanıcı kendini admin yapamaz.
create or replace function public.protect_role_on_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from 'participant'::user_role
     and not public.is_admin()
     and lower(new.email) <> 'zulfumirzagur23@gmail.com' then
    new.role := 'participant';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role_insert on public.profiles;
create trigger profiles_protect_role_insert
  before insert on public.profiles
  for each row execute function public.protect_role_on_insert();

-- ---------------------------------------------------------------------
-- 2. Staff görev rolleri
-- ---------------------------------------------------------------------
-- `role` yetki seviyesidir (participant / staff / admin).
-- `staff_role` ise ekipteki görevdir ve yalnızca yetki seviyesi staff/admin
-- olanlar için anlamlıdır.

do $$ begin
  create type staff_role as enum
    ('co_organizer', 'moderator', 'developer', 'marketing_lead', 'jury');
exception when duplicate_object then null; end $$;

alter table public.profiles add column if not exists staff_role staff_role;
alter table public.profiles add column if not exists staff_title text;

-- Jüri, jury_scores tablosuna yalnızca staff_role = 'jury' ise yazabilir.
create or replace function public.is_juror()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or (p.role = 'staff' and p.staff_role = 'jury'))
  );
$$;

drop policy if exists jury_scores_staff on public.jury_scores;
create policy jury_scores_read on public.jury_scores
  for select using (public.is_staff());

drop policy if exists jury_scores_write on public.jury_scores;
create policy jury_scores_write on public.jury_scores
  for all using (public.is_juror() and juror_id = auth.uid())
  with check (public.is_juror() and juror_id = auth.uid());

-- Staff listesi: herkese açık "ekip" bölümünde kullanılabilir.
drop view if exists public.public_staff;
create view public.public_staff as
select
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.staff_role,
  p.staff_title,
  p.country
from public.profiles p
where p.role in ('staff', 'admin')
  and p.is_public
  and p.staff_role is not null;

grant select on public.public_staff to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Yarışma oluşturma
-- ---------------------------------------------------------------------
-- competitions_admin politikası FOR ALL olduğu için INSERT zaten kapsanır;
-- burada yalnızca slug çakışmasında anlaşılır hata verilmesi sağlanıyor.

create or replace function public.normalize_competition_slug()
returns trigger language plpgsql as $$
begin
  new.slug := lower(regexp_replace(trim(new.slug), '[^a-zA-Z0-9-]+', '-', 'g'));
  new.slug := regexp_replace(new.slug, '-{2,}', '-', 'g');
  new.slug := trim(both '-' from new.slug);
  if new.slug = '' then
    raise exception 'Yarışma adresi (slug) boş olamaz.';
  end if;
  return new;
end;
$$;

drop trigger if exists competitions_slug on public.competitions;
create trigger competitions_slug
  before insert or update on public.competitions
  for each row execute function public.normalize_competition_slug();

-- Etkinlik kodu sertifika kodunun ilk parçasıdır (GYD-26-0001-01).
alter table public.competitions drop constraint if exists competitions_event_code_format;
alter table public.competitions
  add constraint competitions_event_code_format
  check (event_code ~ '^[A-Z]{2,5}$');
