-- İlk şema taslağı (Faz 0). Oyuncu uçları anonim ve sunucu üzerinden (service role) çalışır;
-- istemciye doğrudan tablo erişimi yalnızca mekan üyeleri içindir.
create extension if not exists pgcrypto;

create table venues (id uuid primary key default gen_random_uuid(), name text not null, plan text not null default 'free', created_at timestamptz default now());
create table venue_members (venue_id uuid references venues on delete cascade, user_id uuid references auth.users on delete cascade, role text not null check (role in ('owner','host')), primary key (venue_id, user_id));
create table questions (
  id uuid primary key default gen_random_uuid(), venue_id uuid references venues, category text not null, subtopic text,
  difficulty int check (difficulty between 1 and 3), kind text not null check (kind in ('open','choice')),
  body text not null, options jsonb, correct text not null, accepted jsonb default '[]', explanation text, image_url text, source_note text,
  status text not null default 'draft' check (status in ('draft','approved','archived')), report_count int default 0, created_at timestamptz default now()
);
create table venue_seen_questions (venue_id uuid references venues on delete cascade, question_id uuid references questions on delete cascade, seen_at timestamptz default now(), primary key (venue_id, question_id));
create table games (id uuid primary key default gen_random_uuid(), venue_id uuid references venues on delete cascade, code text unique not null, phase text not null default 'lobby', state jsonb not null default '{}', created_at timestamptz default now());
create table teams (id uuid primary key default gen_random_uuid(), game_id uuid references games on delete cascade, name text not null, color text not null, emoji text not null, code text not null, captain_member_id uuid, score int default 0, unique (game_id, color, emoji));
create table team_members (id uuid primary key default gen_random_uuid(), team_id uuid references teams on delete cascade, nickname text not null, token_hash text not null, last_seen timestamptz default now());
create table answers (id uuid primary key default gen_random_uuid(), game_id uuid references games on delete cascade, team_id uuid references teams on delete cascade, question_index int not null, value text not null, locked boolean default false, idempotency_key text unique, created_at timestamptz default now());
create table abuse_flags (id uuid primary key default gen_random_uuid(), venue_id uuid references venues, kind text not null, detail jsonb, created_at timestamptz default now());

alter table venues enable row level security;
alter table venue_members enable row level security;
alter table questions enable row level security;
alter table venue_seen_questions enable row level security;
alter table games enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table answers enable row level security;
alter table abuse_flags enable row level security;

create function is_member(v uuid) returns boolean language sql stable security definer as
$$ select exists (select 1 from venue_members where venue_id = v and user_id = auth.uid()) $$;

create policy venue_read on venues for select using (is_member(id));
create policy member_read on venue_members for select using (user_id = auth.uid());
create policy q_read on questions for select using (venue_id is null and status = 'approved' or is_member(venue_id));
create policy q_write on questions for all using (is_member(venue_id)) with check (is_member(venue_id));
create policy seen_rw on venue_seen_questions for all using (is_member(venue_id)) with check (is_member(venue_id));
create policy games_rw on games for all using (is_member(venue_id)) with check (is_member(venue_id));
create policy teams_read on teams for select using (exists (select 1 from games g where g.id = game_id and is_member(g.venue_id)));
create policy members_read on team_members for select using (exists (select 1 from teams t join games g on g.id = t.game_id where t.id = team_id and is_member(g.venue_id)));
create policy answers_read on answers for select using (exists (select 1 from games g where g.id = game_id and is_member(g.venue_id)));
-- abuse_flags: politika yok, yalnızca service role okur/yazar.
