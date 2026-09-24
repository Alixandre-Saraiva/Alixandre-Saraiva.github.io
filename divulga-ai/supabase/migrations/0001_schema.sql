-- =============================================================================
-- Divulga ai — schema inicial (Supabase / PostgreSQL)
-- Execute no SQL Editor do Supabase ou via `supabase db push`.
-- A senha dos usuários é gerenciada pelo Supabase Auth (auth.users) e nunca
-- é armazenada nas tabelas públicas.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.tipo_usuario as enum ('cliente', 'profissional', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.status_assinatura as enum ('pendente', 'ativa', 'vencida', 'cancelada');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null,
  email       text not null unique,
  tipo        public.tipo_usuario not null default 'cliente',
  cidade      text,
  telefone    text,
  foto        text,
  lat         double precision,
  lng         double precision,
  banido      boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.categorias (
  id      serial primary key,
  slug    text not null unique,
  nome    text not null,
  icone   text not null default 'wrench',
  ativo   boolean not null default true
);

create table if not exists public.profissionais (
  user_id           uuid primary key references public.users (id) on delete cascade,
  profissao         text not null default '',
  descricao         text not null default '',
  categoria_id      int references public.categorias (id) on delete set null,
  nota              numeric(2, 1) not null default 0,
  total_avaliacoes  int not null default 0,
  valor_medio       numeric(10, 2),
  whatsapp          text,
  assinatura_ativa  boolean not null default false,
  aprovado          boolean not null default false,
  visualizacoes     int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.servicos (
  id               uuid primary key default gen_random_uuid(),
  profissional_id  uuid not null references public.profissionais (user_id) on delete cascade,
  titulo           text not null,
  preco            numeric(10, 2),
  created_at       timestamptz not null default now()
);

create table if not exists public.avaliacoes (
  id               uuid primary key default gen_random_uuid(),
  profissional_id  uuid not null references public.profissionais (user_id) on delete cascade,
  cliente_id       uuid not null references public.users (id) on delete cascade,
  nota             smallint not null check (nota between 1 and 5),
  comentario       text,
  created_at       timestamptz not null default now(),
  unique (profissional_id, cliente_id),
  check (profissional_id <> cliente_id)
);

create table if not exists public.assinaturas (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references public.users (id) on delete cascade,
  status        public.status_assinatura not null default 'pendente',
  valor         numeric(10, 2) not null default 5.00,
  vencimento    timestamptz,
  provider      text check (provider in ('stripe', 'mercadopago', 'demo')),
  provider_ref  text,
  renovacao_automatica boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.pagamentos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  assinatura_id uuid references public.assinaturas (id) on delete set null,
  valor         numeric(10, 2) not null,
  status        text not null default 'aprovado',
  provider      text not null,
  provider_ref  text unique,
  created_at    timestamptz not null default now()
);

create table if not exists public.visualizacoes (
  id               bigserial primary key,
  profissional_id  uuid not null references public.profissionais (user_id) on delete cascade,
  viewer_id        uuid references public.users (id) on delete set null,
  created_at       timestamptz not null default now()
);

-- Estrutura preparada para o chat interno (fase 2)
create table if not exists public.conversas (
  id               uuid primary key default gen_random_uuid(),
  cliente_id       uuid not null references public.users (id) on delete cascade,
  profissional_id  uuid not null references public.profissionais (user_id) on delete cascade,
  created_at       timestamptz not null default now(),
  unique (cliente_id, profissional_id)
);

create table if not exists public.mensagens (
  id           uuid primary key default gen_random_uuid(),
  conversa_id  uuid not null references public.conversas (id) on delete cascade,
  autor_id     uuid not null references public.users (id) on delete cascade,
  conteudo     text not null check (char_length(conteudo) <= 2000),
  lida         boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists idx_users_cidade on public.users (lower(cidade));
create index if not exists idx_prof_categoria on public.profissionais (categoria_id);
create index if not exists idx_prof_visivel on public.profissionais (aprovado, assinatura_ativa);
create index if not exists idx_aval_prof on public.avaliacoes (profissional_id, created_at desc);
create index if not exists idx_serv_prof on public.servicos (profissional_id);
create index if not exists idx_visu_prof on public.visualizacoes (profissional_id, created_at desc);
create index if not exists idx_msg_conversa on public.mensagens (conversa_id, created_at);

-- -----------------------------------------------------------------------------
-- Funções auxiliares
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.users where id = auth.uid() and tipo = 'admin');
$$;

-- Cria o perfil público quando alguém se cadastra pelo Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_tipo public.tipo_usuario;
begin
  v_tipo := case when new.raw_user_meta_data ->> 'tipo' = 'profissional'
                 then 'profissional' else 'cliente' end;  -- nunca 'admin' pelo cadastro

  insert into public.users (id, nome, email, tipo, cidade, telefone, foto)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    v_tipo,
    new.raw_user_meta_data ->> 'cidade',
    new.raw_user_meta_data ->> 'telefone',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  if v_tipo = 'profissional' then
    insert into public.profissionais (user_id, profissao, categoria_id, whatsapp)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'profissao', ''),
      (select id from public.categorias where slug = new.raw_user_meta_data ->> 'categoria'),
      new.raw_user_meta_data ->> 'telefone'
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuários comuns não podem alterar o próprio tipo nem se desbanir.
create or replace function public.protect_user_columns()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    new.tipo   := old.tipo;
    new.banido := old.banido;
    new.email  := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_user_columns on public.users;
create trigger trg_protect_user_columns
  before update on public.users
  for each row execute function public.protect_user_columns();

-- Profissionais não podem aprovar a si mesmos, ativar assinatura ou mudar a nota.
create or replace function public.protect_prof_columns()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and not public.is_admin() then
    new.aprovado          := old.aprovado;
    new.assinatura_ativa  := old.assinatura_ativa;
    new.nota              := old.nota;
    new.total_avaliacoes  := old.total_avaliacoes;
    new.visualizacoes     := old.visualizacoes;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_protect_prof_columns on public.profissionais;
create trigger trg_protect_prof_columns
  before update on public.profissionais
  for each row execute function public.protect_prof_columns();

-- Mantém nota média e total de avaliações atualizados.
create or replace function public.refresh_rating()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_prof uuid := coalesce(new.profissional_id, old.profissional_id);
begin
  update public.profissionais p
     set nota = coalesce((select round(avg(nota)::numeric, 1) from public.avaliacoes where profissional_id = v_prof), 0),
         total_avaliacoes = (select count(*) from public.avaliacoes where profissional_id = v_prof)
   where p.user_id = v_prof;
  return null;
end;
$$;

drop trigger if exists trg_refresh_rating on public.avaliacoes;
create trigger trg_refresh_rating
  after insert or update or delete on public.avaliacoes
  for each row execute function public.refresh_rating();

-- Espelha o status da assinatura no perfil do profissional.
create or replace function public.sync_subscription_flag()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  update public.profissionais
     set assinatura_ativa = (new.status = 'ativa' and (new.vencimento is null or new.vencimento > now()))
   where user_id = new.user_id;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_sync_subscription on public.assinaturas;
create trigger trg_sync_subscription
  before insert or update on public.assinaturas
  for each row execute function public.sync_subscription_flag();

-- Bloqueia anúncios vencidos. Chamado pelo cron diário (/api/cron/assinaturas)
-- ou por pg_cron: select cron.schedule('expirar', '0 3 * * *', 'select public.expire_subscriptions()');
create or replace function public.expire_subscriptions()
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_count int;
begin
  update public.assinaturas
     set status = 'vencida'
   where status = 'ativa' and vencimento is not null and vencimento < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Registra uma visualização de perfil (qualquer visitante).
create or replace function public.register_view(p_profissional uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null and auth.uid() = p_profissional then
    return; -- não conta a visita do próprio dono
  end if;
  insert into public.visualizacoes (profissional_id, viewer_id) values (p_profissional, auth.uid());
  update public.profissionais set visualizacoes = visualizacoes + 1 where user_id = p_profissional;
end;
$$;

-- -----------------------------------------------------------------------------
-- View pública (somente colunas seguras) e busca
-- -----------------------------------------------------------------------------
create or replace view public.profissionais_publicos as
select
  p.user_id                as id,
  u.nome,
  u.foto,
  u.cidade,
  u.lat,
  u.lng,
  p.profissao,
  p.descricao,
  p.nota,
  p.total_avaliacoes,
  p.valor_medio,
  p.whatsapp,
  p.visualizacoes,
  p.created_at,
  c.slug                   as categoria_slug,
  c.nome                   as categoria_nome
from public.profissionais p
join public.users u on u.id = p.user_id
left join public.categorias c on c.id = p.categoria_id
where p.aprovado and p.assinatura_ativa and not u.banido;

grant select on public.profissionais_publicos to anon, authenticated;

-- Avaliações com nome/foto do cliente (sem expor e-mail ou telefone)
create or replace view public.avaliacoes_publicas as
select a.id, a.profissional_id, a.cliente_id, a.nota, a.comentario, a.created_at,
       u.nome as cliente_nome, u.foto as cliente_foto
from public.avaliacoes a
join public.users u on u.id = a.cliente_id;

grant select on public.avaliacoes_publicas to anon, authenticated;

create or replace function public.search_profissionais(
  p_q          text default null,
  p_cidade     text default null,
  p_categoria  text default null,
  p_ordem      text default 'avaliacao',   -- avaliacao | proximos | recentes
  p_lat        double precision default null,
  p_lng        double precision default null,
  p_limit      int default 12,
  p_offset     int default 0
)
returns table (
  id uuid, nome text, foto text, cidade text, lat double precision, lng double precision,
  profissao text, nota numeric, total_avaliacoes int, valor_medio numeric,
  created_at timestamptz, categoria_slug text, categoria_nome text, distancia_km double precision
)
language sql stable security definer set search_path = public
as $$
  with base as (
    select v.*,
      case when p_lat is not null and p_lng is not null and v.lat is not null and v.lng is not null then
        6371 * 2 * asin(sqrt(
          power(sin(radians(v.lat - p_lat) / 2), 2) +
          cos(radians(p_lat)) * cos(radians(v.lat)) * power(sin(radians(v.lng - p_lng) / 2), 2)
        ))
      end as distancia_km
    from public.profissionais_publicos v
    where (p_q is null or p_q = '' or
           unaccent(v.nome || ' ' || v.profissao || ' ' || coalesce(v.categoria_nome, '') || ' ' || v.descricao)
             ilike '%' || unaccent(p_q) || '%')
      and (p_cidade is null or p_cidade = '' or unaccent(lower(v.cidade)) = unaccent(lower(p_cidade)))
      and (p_categoria is null or p_categoria = '' or v.categoria_slug = p_categoria)
  )
  select id, nome, foto, cidade, lat, lng, profissao, nota, total_avaliacoes, valor_medio,
         created_at, categoria_slug, categoria_nome, distancia_km
  from base
  order by
    case when p_ordem = 'proximos' then distancia_km end asc nulls last,
    case when p_ordem = 'recentes' then extract(epoch from created_at) end desc,
    nota desc, total_avaliacoes desc
  limit least(p_limit, 50) offset greatest(p_offset, 0);
$$;

grant execute on function public.search_profissionais to anon, authenticated;
grant execute on function public.register_view to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.users          enable row level security;
alter table public.categorias     enable row level security;
alter table public.profissionais  enable row level security;
alter table public.servicos       enable row level security;
alter table public.avaliacoes     enable row level security;
alter table public.assinaturas    enable row level security;
alter table public.pagamentos     enable row level security;
alter table public.visualizacoes  enable row level security;
alter table public.conversas      enable row level security;
alter table public.mensagens      enable row level security;

-- users
drop policy if exists users_select on public.users;
create policy users_select on public.users for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists users_update on public.users;
create policy users_update on public.users for update
  using (id = auth.uid() or public.is_admin());

-- categorias
drop policy if exists cat_select on public.categorias;
create policy cat_select on public.categorias for select using (true);
drop policy if exists cat_admin on public.categorias;
create policy cat_admin on public.categorias for all
  using (public.is_admin()) with check (public.is_admin());

-- profissionais
drop policy if exists prof_select on public.profissionais;
create policy prof_select on public.profissionais for select
  using ((aprovado and assinatura_ativa) or user_id = auth.uid() or public.is_admin());
drop policy if exists prof_update on public.profissionais;
create policy prof_update on public.profissionais for update
  using (user_id = auth.uid() or public.is_admin());

-- servicos
drop policy if exists serv_select on public.servicos;
create policy serv_select on public.servicos for select using (true);
drop policy if exists serv_write on public.servicos;
create policy serv_write on public.servicos for all
  using (profissional_id = auth.uid()) with check (profissional_id = auth.uid());

-- avaliacoes
drop policy if exists aval_select on public.avaliacoes;
create policy aval_select on public.avaliacoes for select using (true);
drop policy if exists aval_insert on public.avaliacoes;
create policy aval_insert on public.avaliacoes for insert
  with check (cliente_id = auth.uid() and profissional_id <> auth.uid());
drop policy if exists aval_update on public.avaliacoes;
create policy aval_update on public.avaliacoes for update using (cliente_id = auth.uid());
drop policy if exists aval_delete on public.avaliacoes;
create policy aval_delete on public.avaliacoes for delete
  using (cliente_id = auth.uid() or public.is_admin());

-- assinaturas / pagamentos: leitura do dono ou admin; escrita só via service_role (webhooks)
drop policy if exists ass_select on public.assinaturas;
create policy ass_select on public.assinaturas for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists pag_select on public.pagamentos;
create policy pag_select on public.pagamentos for select
  using (user_id = auth.uid() or public.is_admin());

-- visualizacoes: apenas o dono vê; inserção via register_view()
drop policy if exists visu_select on public.visualizacoes;
create policy visu_select on public.visualizacoes for select
  using (profissional_id = auth.uid() or public.is_admin());

-- chat (fase 2)
drop policy if exists conv_access on public.conversas;
create policy conv_access on public.conversas for all
  using (auth.uid() in (cliente_id, profissional_id))
  with check (auth.uid() = cliente_id);
drop policy if exists msg_select on public.mensagens;
create policy msg_select on public.mensagens for select
  using (exists (select 1 from public.conversas c where c.id = conversa_id and auth.uid() in (c.cliente_id, c.profissional_id)));
drop policy if exists msg_insert on public.mensagens;
create policy msg_insert on public.mensagens for insert
  with check (autor_id = auth.uid() and exists (
    select 1 from public.conversas c where c.id = conversa_id and auth.uid() in (c.cliente_id, c.profissional_id)));

-- -----------------------------------------------------------------------------
-- Storage: fotos de perfil (bucket público "avatars", pasta = uid do usuário)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists avatars_write on storage.objects;
create policy avatars_write on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists avatars_update on storage.objects;
create policy avatars_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- Categorias iniciais
-- -----------------------------------------------------------------------------
insert into public.categorias (slug, nome, icone) values
  ('pedreiro', 'Pedreiro', 'brick-wall'),
  ('eletricista', 'Eletricista', 'zap'),
  ('encanador', 'Encanador', 'droplets'),
  ('pintor', 'Pintor', 'paint-roller'),
  ('diarista', 'Diarista', 'sparkles'),
  ('jardineiro', 'Jardineiro', 'sprout'),
  ('tecnico-informatica', 'Técnico de informática', 'monitor'),
  ('montador-moveis', 'Montador de móveis', 'hammer'),
  ('designer', 'Designer', 'palette'),
  ('programador', 'Programador', 'code'),
  ('mecanico', 'Mecânico', 'car')
on conflict (slug) do nothing;

-- Para tornar alguém administrador:
-- update public.users set tipo = 'admin' where email = 'seu@email.com';
