-- =============================================================================
-- 0003_posts_media — posts, post_media + storage bucket
-- =============================================================================

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('job','sales','other')),
  title text not null,
  body_md text not null,
  framework text check (framework in ('AIDA','PAS','BAB','FAB','4U','PASTOR')),
  variants jsonb not null default '[]'::jsonb,
  ai_generation_id uuid,
  status text not null default 'draft' check (status in ('draft','ready','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_posts_org_status on public.posts(org_id, status);
create index idx_posts_search on public.posts using gin (to_tsvector('simple', coalesce(title,'') || ' ' || body_md));

create trigger trg_posts_updated
before update on public.posts
for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

create policy "posts_org_select" on public.posts
  for select using (public.is_org_member(org_id));

create policy "posts_editor_insert" on public.posts
  for insert with check (public.is_org_role(org_id, 'editor'));

create policy "posts_editor_update" on public.posts
  for update using (public.is_org_role(org_id, 'editor'));

create policy "posts_admin_delete" on public.posts
  for delete using (public.is_org_role(org_id, 'admin'));

-- -----------------------------------------------------------------------------
-- post_media
-- -----------------------------------------------------------------------------
create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  mime text,
  width int,
  height int,
  bytes int,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_post_media_post on public.post_media(post_id, position);

alter table public.post_media enable row level security;

create policy "post_media_org_select" on public.post_media
  for select using (public.is_org_member(org_id));

create policy "post_media_editor_insert" on public.post_media
  for insert with check (public.is_org_role(org_id, 'editor'));

create policy "post_media_editor_update" on public.post_media
  for update using (public.is_org_role(org_id, 'editor'));

create policy "post_media_editor_delete" on public.post_media
  for delete using (public.is_org_role(org_id, 'editor'));

-- -----------------------------------------------------------------------------
-- Storage bucket: post-media
-- Layout: post-media/<org_id>/<post_id>/<filename>
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media',
  'post-media',
  false,
  8388608, -- 8 MiB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

create policy "post_media_storage_select"
on storage.objects for select
using (
  bucket_id = 'post-media'
  and public.is_org_member((storage.foldername(name))[1]::uuid)
);

create policy "post_media_storage_insert"
on storage.objects for insert
with check (
  bucket_id = 'post-media'
  and public.is_org_role((storage.foldername(name))[1]::uuid, 'editor')
);

create policy "post_media_storage_update"
on storage.objects for update
using (
  bucket_id = 'post-media'
  and public.is_org_role((storage.foldername(name))[1]::uuid, 'editor')
);

create policy "post_media_storage_delete"
on storage.objects for delete
using (
  bucket_id = 'post-media'
  and public.is_org_role((storage.foldername(name))[1]::uuid, 'editor')
);

comment on table public.posts is 'Biblioteka treści — kreatywa do późniejszego wrzucenia w kampanie. Wariancja A/B w variants jsonb.';
comment on table public.post_media is 'Obrazy/media dla posta. Storage layout: post-media/<org_id>/<post_id>/<filename>.';
