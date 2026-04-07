
create table public.quick_input_presets (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  slot_number int not null,
  label text not null default '',
  health_issue text not null default '',
  treatment text not null default '',
  medication text not null default '',
  created_at timestamp with time zone not null default now(),
  unique (teacher_id, slot_number)
);

alter table public.quick_input_presets enable row level security;

create policy "Teachers can manage their own presets"
  on public.quick_input_presets
  for all
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
