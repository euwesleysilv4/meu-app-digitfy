-- Habilita a extensão uuid-ossp se ainda não estiver habilitada
create extension if not exists "uuid-ossp";

-- Remove triggers existentes se existirem
drop trigger if exists update_service_promotions_updated_at on service_promotions;
drop trigger if exists update_service_requests_updated_at on service_requests;

-- Remove tabelas se existirem
drop table if exists service_promotions;
drop table if exists service_requests;

-- Tabela para divulgação de serviços
create table service_promotions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    title text not null,
    description text not null,
    category text not null,
    price decimal(10,2) not null,
    contact_whatsapp text,
    contact_email text,
    contact_instagram text,
    image_url text,
    payment_methods text[] not null,
    payment_option text not null,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela para solicitações de serviços
create table service_requests (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    name text not null,
    email text not null,
    whatsapp text,
    instagram text,
    service_type text not null,
    description text not null,
    budget decimal(10,2),
    payment_methods text[] not null,
    priority text not null,
    delivery_date date,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Função para atualizar o campo updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Trigger para service_promotions
create trigger update_service_promotions_updated_at
    before update on service_promotions
    for each row
    execute procedure update_updated_at_column();

-- Trigger para service_requests
create trigger update_service_requests_updated_at
    before update on service_requests
    for each row
    execute procedure update_updated_at_column();

-- Função para verificar se o usuário é admin
create or replace function is_admin()
returns boolean as $$
begin
  return (
    select exists (
      select 1 from auth.users
      where id = auth.uid()
      and raw_user_meta_data->>'admin' = 'true'
    )
  );
end;
$$ language plpgsql security definer;

-- Habilita RLS para as tabelas
alter table service_promotions enable row level security;
alter table service_requests enable row level security;

-- Remove todas as políticas existentes
drop policy if exists "Política de inserção de serviços" on service_promotions;
drop policy if exists "Política de visualização de serviços" on service_promotions;
drop policy if exists "Política de atualização de serviços" on service_promotions;
drop policy if exists "Política de administração de serviços" on service_promotions;
drop policy if exists "Política de inserção de solicitações" on service_requests;
drop policy if exists "Política de visualização de solicitações" on service_requests;
drop policy if exists "Política de atualização de solicitações" on service_requests;
drop policy if exists "Política de administração de solicitações" on service_requests;

-- Políticas para service_promotions
create policy "Política de inserção de serviços"
    on service_promotions
    for insert
    to authenticated
    with check (true);

create policy "Política de visualização de serviços"
    on service_promotions
    for select
    using (
        status = 'approved' 
        or auth.uid() = user_id 
        or is_admin()
    );

create policy "Política de atualização de serviços"
    on service_promotions
    for update
    using (auth.uid() = user_id or is_admin());

create policy "Política de exclusão de serviços"
    on service_promotions
    for delete
    using (is_admin());

-- Políticas para service_requests
create policy "Política de inserção de solicitações"
    on service_requests
    for insert
    to authenticated
    with check (true);

create policy "Política de visualização de solicitações"
    on service_requests
    for select
    using (
        auth.uid() = user_id 
        or is_admin()
    );

create policy "Política de atualização de solicitações"
    on service_requests
    for update
    using (auth.uid() = user_id or is_admin());

create policy "Política de exclusão de solicitações"
    on service_requests
    for delete
    using (is_admin());

-- Índices para melhorar a performance
create index if not exists idx_service_promotions_user_id on service_promotions(user_id);
create index if not exists idx_service_promotions_status on service_promotions(status);
create index if not exists idx_service_requests_user_id on service_requests(user_id);
create index if not exists idx_service_requests_status on service_requests(status); 