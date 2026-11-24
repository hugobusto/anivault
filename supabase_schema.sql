-- ==========================================================
-- AniVault - Esquema de Base de Datos para Supabase (PostgreSQL)
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ==========================================================

-- 1. Tabla Principal de Animes
create table if not exists public.animes (
  id text primary key,
  title text not null,
  alt_title text,
  studio text,
  genres text,
  status text not null default 'airing', -- 'airing', 'completed', 'planning', 'dropped'
  cover_url text,
  banner_url text,
  seasons jsonb not null default '[]'::jsonb,
  movies jsonb not null default '[]'::jsonb,
  rating numeric(3,1) default 0.0,
  favorite boolean default false,
  notes text default '',
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

-- 2. Tabla de Ajustes de Usuario y Perfil
create table if not exists public.user_settings (
  id text primary key default 'default_user',
  username text default 'Alexander "Kage" Vance',
  avatar_url text,
  level_title text default 'Nivel 24 · Otaku Curator',
  telegram_chat_id text,
  telegram_enabled boolean default true,
  last_sync timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

-- 3. Habilitar Seguridad a Nivel de Fila (RLS)
alter table public.animes enable row level security;
alter table public.user_settings enable row level security;

-- 4. Políticas de Acceso para la API Pública (anon key)
-- Permite lectura pública / de la app
drop policy if exists "Permitir lectura publica animes" on public.animes;
create policy "Permitir lectura publica animes"
  on public.animes for select
  using (true);

-- Permite inserción pública / de la app
drop policy if exists "Permitir insercion animes" on public.animes;
create policy "Permitir insercion animes"
  on public.animes for insert
  with check (true);

-- Permite actualización pública / de la app
drop policy if exists "Permitir actualizacion animes" on public.animes;
create policy "Permitir actualizacion animes"
  on public.animes for update
  using (true);

-- Permite borrado público / de la app
drop policy if exists "Permitir borrado animes" on public.animes;
create policy "Permitir borrado animes"
  on public.animes for delete
  using (true);

-- Políticas para user_settings
drop policy if exists "Permitir todo user_settings" on public.user_settings;
create policy "Permitir todo user_settings"
  on public.user_settings for all
  using (true)
  with check (true);

-- 5. Trigger para actualizar el campo updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_animes_updated_at on public.animes;
create trigger set_animes_updated_at
  before update on public.animes
  for each row execute function public.handle_updated_at();

-- ¡Listo! Ahora tu proyecto en Supabase está configurado para AniVault.
