-- Run these statements in the Supabase SQL editor to create required tables

create table if not exists users (
  id bigserial primary key,
  email text unique not null,
  auth_id text unique,
  password_hash text,
  created_at timestamptz default now()
);

create table if not exists auctions (
  id bigserial primary key,
  title text not null,
  description text,
  start_price numeric(18,2) not null,
  current_price numeric(18,2) not null,
  seller_id bigint not null references users(id),
  status text default 'open',
  created_at timestamptz default now(),
  ends_at timestamptz
);

create table if not exists bids (
  id bigserial primary key,
  auction_id bigint not null references auctions(id),
  bidder_id bigint not null references users(id),
  amount numeric(18,2) not null,
  created_at timestamptz default now()
);

-- Optional indexes
create index if not exists idx_auctions_seller on auctions(seller_id);
create index if not exists idx_bids_auction on bids(auction_id);
