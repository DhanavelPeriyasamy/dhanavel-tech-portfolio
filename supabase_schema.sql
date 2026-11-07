-- Starter tables; review policies before production use.
create extension if not exists pgcrypto;
create table public.visitor_profiles (user_id uuid primary key references auth.users(id) on delete cascade, full_name text not null, email text not null, organization text not null, job_title text not null, reason_for_visit text not null, linkedin_url text, status text not null default 'pending', role text not null default 'visitor', created_at timestamptz not null default now());
create table public.contact_messages (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), subject text not null, message text not null, created_at timestamptz not null default now());
create table public.activity_events (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id), event_name text not null, page_name text, target text, created_at timestamptz not null default now());
-- Enable RLS and add owner/admin policies before connecting this schema to the app.
-- Never expose the Supabase service-role key in Streamlit code.
