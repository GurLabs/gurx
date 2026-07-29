-- =====================================================================
-- GurX™ — Migration 002
--
-- schema.sql'i daha önce çalıştırdıysanız SADECE bu dosyayı çalıştırın.
-- Sıfırdan kuruyorsanız önce schema.sql, sonra bu dosya.
--
-- İçerik:
--   1. Profil alanları (kullanıcı adı, biyografi, herkese açık profil)
--   2. Profil fotoğrafı için storage kovası ve politikaları
--   3. Herkese açık profil görünümü
--   4. Destek talepleri (ticket) ve iletişim mesajları
--   5. Jüri puanlama tabloları ve yeni sıralama görünümü
--   6. 06 numaralı yetkili belgesi türü
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Profil alanları
-- ---------------------------------------------------------------------

alter table public.profiles add column if not exists username   text unique;
alter table public.profiles add column if not exists bio        text;
alter table public.profiles add column if not exists is_public  boolean not null default true;

-- Kullanıcı adı biçimi: 3-30 karakter, küçük harf/rakam/alt tire/tire
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9_-]{3,30}$');

-- Mevcut kullanıcılara e-postadan türetilmiş benzersiz bir kullanıcı adı ver.
update public.profiles p
   set username = sub.candidate
  from (
    select id,
           left(regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9_-]', '', 'g'), 24)
             || '-' || left(replace(id::text, '-', ''), 5) as candidate
      from public.profiles
     where username is null
  ) sub
 where p.id = sub.id
   and p.username is null;

-- Yeni kayıtlarda kullanıcı adını otomatik üret.
create or replace function public.ensure_username()
returns trigger language plpgsql as $$
begin
  if new.username is null then
    new.username :=
      left(regexp_replace(lower(split_part(new.email, '@', 1)), '[^a-z0-9_-]', '', 'g'), 24)
      || '-' || left(replace(new.id::text, '-', ''), 5);
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_ensure_username on public.profiles;
create trigger profiles_ensure_username
  before insert on public.profiles
  for each row execute function public.ensure_username();

-- ---------------------------------------------------------------------
-- 2. Profil fotoğrafı — storage
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152,
        array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

-- Dosya yolu daima "<user_id>/<dosya>" biçimindedir; kullanıcı yalnızca
-- kendi klasörüne yazabilir.
drop policy if exists "avatars herkese acik okuma" on storage.objects;
create policy "avatars herkese acik okuma" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars sahibi yazar" on storage.objects;
create policy "avatars sahibi yazar" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars sahibi gunceller" on storage.objects;
create policy "avatars sahibi gunceller" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars sahibi siler" on storage.objects;
create policy "avatars sahibi siler" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------
-- 3. Herkese açık profil görünümü
-- ---------------------------------------------------------------------
-- E-posta, doğum yılı, rol ve referans bilgisi bu görünümde YER ALMAZ.

drop view if exists public.public_profiles;
create view public.public_profiles as
select
  p.id,
  p.username,
  p.full_name,
  p.bio,
  p.avatar_url,
  p.country,
  p.portfolio_url,
  p.github_url,
  p.linkedin_url,
  p.created_at
from public.profiles p
where p.is_public and p.username is not null;

grant select on public.public_profiles to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Destek talepleri ve iletişim mesajları
-- ---------------------------------------------------------------------

do $$ begin
  create type ticket_status as enum ('open', 'pending', 'resolved', 'closed');
exception when duplicate_object then null; end $$;

create table if not exists public.tickets (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  user_id         uuid references public.profiles (id) on delete set null,
  email           text not null,
  full_name       text not null,
  subject         text not null,
  category        text not null default 'general'
                  check (category in ('general','application','submission','certificate','technical','other')),
  status          ticket_status not null default 'open',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.ticket_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.tickets (id) on delete cascade,
  author_id   uuid references public.profiles (id) on delete set null,
  author_name text not null,
  is_staff    boolean not null default false,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);

-- Referans numarası: GX-2026-4F7A2B
create or replace function public.ensure_ticket_reference()
returns trigger language plpgsql as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'GX-' || to_char(now(), 'YYYY') || '-'
                     || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
  end if;
  return new;
end;
$$;

drop trigger if exists tickets_reference on public.tickets;
create trigger tickets_reference
  before insert on public.tickets
  for each row execute function public.ensure_ticket_reference();

-- Yeni mesaj geldiğinde talebi güncelle.
create or replace function public.touch_ticket()
returns trigger language plpgsql as $$
begin
  update public.tickets
     set last_message_at = new.created_at,
         updated_at      = now(),
         status          = case
                             when new.is_staff then 'pending'::ticket_status
                             when status in ('resolved', 'closed') then 'open'::ticket_status
                             else status
                           end
   where id = new.ticket_id;
  return new;
end;
$$;

drop trigger if exists ticket_messages_touch on public.ticket_messages;
create trigger ticket_messages_touch
  after insert on public.ticket_messages
  for each row execute function public.touch_ticket();

alter table public.tickets         enable row level security;
alter table public.ticket_messages enable row level security;

drop policy if exists tickets_select on public.tickets;
create policy tickets_select on public.tickets
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists tickets_insert on public.tickets;
create policy tickets_insert on public.tickets
  for insert with check (user_id = auth.uid());

drop policy if exists tickets_staff on public.tickets;
create policy tickets_staff on public.tickets
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists ticket_messages_select on public.ticket_messages;
create policy ticket_messages_select on public.ticket_messages
  for select using (
    public.is_staff()
    or exists (select 1 from public.tickets t where t.id = ticket_id and t.user_id = auth.uid())
  );

drop policy if exists ticket_messages_insert on public.ticket_messages;
create policy ticket_messages_insert on public.ticket_messages
  for insert with check (
    author_id = auth.uid()
    and (
      public.is_staff()
      or exists (select 1 from public.tickets t where t.id = ticket_id and t.user_id = auth.uid())
    )
  );

-- Giriş yapmamış ziyaretçilerin iletişim formu ayrı tutulur.
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  email      text not null,
  subject    text not null,
  body       text not null,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists contact_insert_anyone on public.contact_messages;
create policy contact_insert_anyone on public.contact_messages
  for insert to anon, authenticated with check (true);

drop policy if exists contact_staff_read on public.contact_messages;
create policy contact_staff_read on public.contact_messages
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------
-- 5. Jüri puanlaması
-- ---------------------------------------------------------------------
-- Karar: üç ölçütü (tasarım / SEO / güvenlik) JÜRİ puanlar.
-- Grand Winner ise yalnızca katılımcı oylamasıyla belirlenir.

create table if not exists public.jury_scores (
  id             uuid primary key default gen_random_uuid(),
  juror_id       uuid not null references public.profiles (id) on delete cascade,
  submission_id  uuid not null references public.submissions (id) on delete cascade,
  design_score   int not null check (design_score between 1 and 10),
  seo_score      int not null check (seo_score between 1 and 10),
  security_score int not null check (security_score between 1 and 10),
  note           text,
  created_at     timestamptz not null default now(),
  unique (juror_id, submission_id)
);

alter table public.jury_scores enable row level security;

drop policy if exists jury_scores_staff on public.jury_scores;
create policy jury_scores_staff on public.jury_scores
  for all using (public.is_staff()) with check (public.is_staff() and juror_id = auth.uid());

-- Katılımcı oyu artık tek bir tercih: Grand Winner adayı.
alter table public.votes add column if not exists is_grand_pick boolean not null default true;

-- Sıralama görünümü: kategori puanları jüriden, oy sayısı katılımcılardan.
drop view if exists public.leaderboard;
create view public.leaderboard as
with jury as (
  select
    s.id                                     as submission_id,
    s.competition_id,
    s.title,
    s.live_url,
    s.hero_screenshot_url,
    p.full_name                              as author_name,
    round(avg(j.design_score)::numeric, 1)   as design_score,
    round(avg(j.seo_score)::numeric, 1)      as seo_score,
    round(avg(j.security_score)::numeric, 1) as security_score,
    count(distinct j.id)                     as jury_count
  from public.submissions s
  join public.profiles p on p.id = s.user_id
  left join public.jury_scores j on j.submission_id = s.id
  where s.is_published
  group by s.id, s.competition_id, s.title, s.live_url, s.hero_screenshot_url, p.full_name
),
votes_agg as (
  select submission_id, count(*) as vote_count
  from public.votes
  group by submission_id
)
select
  jury.*,
  coalesce(v.vote_count, 0) as vote_count,
  coalesce(jury.design_score, 0)
    + coalesce(jury.seo_score, 0)
    + coalesce(jury.security_score, 0) as total_score,
  rank() over (
    partition by jury.competition_id
    order by coalesce(v.vote_count, 0) desc,
             coalesce(jury.design_score, 0)
               + coalesce(jury.seo_score, 0)
               + coalesce(jury.security_score, 0) desc
  ) as rank,
  (
    select c.award_type
    from public.certificates c
    where c.competition_id = jury.competition_id
      and c.user_id = (select s2.user_id from public.submissions s2 where s2.id = jury.submission_id)
      and c.award_type <> '01'
      and not c.revoked
    order by c.award_type desc
    limit 1
  ) as award_type
from jury
left join votes_agg v on v.submission_id = jury.submission_id;

grant select on public.leaderboard to anon, authenticated;

-- ---------------------------------------------------------------------
-- 6. Yetkili görev belgesi (06)
-- ---------------------------------------------------------------------

alter table public.certificates drop constraint if exists certificates_award_type_check;
alter table public.certificates
  add constraint certificates_award_type_check
  check (award_type in ('01', '02', '03', '04', '05', '06'));
