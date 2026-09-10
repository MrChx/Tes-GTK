-- Jalankan file ini di Supabase SQL Editor.

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  nama text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.unit_kerja (
  id uuid primary key default gen_random_uuid(),
  nama text unique not null
);

create table if not exists public.pegawai (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nip text unique not null,
  jabatan text not null,
  unit_kerja text not null,
  status text not null check (status in ('Aktif', 'Cuti', 'Pensiun')),
  email text,
  telepon text,
  tanggal_masuk date,
  alamat text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.unit_kerja enable row level security;
alter table public.pegawai enable row level security;

insert into public.unit_kerja (nama) values
  ('Tata Usaha'),
  ('Kurikulum'),
  ('Kesiswaan'),
  ('Sarana Prasarana'),
  ('Perpustakaan'),
  ('Bimbingan Konseling'),
  ('Humas')
on conflict (nama) do nothing;

insert into public.pegawai (nama, nip, jabatan, unit_kerja, status, email, telepon, tanggal_masuk, alamat)
values
  ('Siti Nurhaliza, S.Pd.', '197805152005012001', 'Kepala Sekolah', 'Tata Usaha', 'Aktif', 'siti.nurhaliza@sekolah.sch.id', '081234567890', '2005-01-12', 'Jl. Pendidikan No. 12, Jakarta'),
  ('Ahmad Fauzi, M.Pd.', '198203102008011003', 'Wakil Kepala Sekolah', 'Kurikulum', 'Aktif', 'ahmad.fauzi@sekolah.sch.id', '081298765432', '2008-03-01', 'Jl. Merdeka No. 45, Jakarta'),
  ('Dewi Lestari, S.Pd.', '199001222015032002', 'Guru', 'Kurikulum', 'Aktif', 'dewi.lestari@sekolah.sch.id', '082112345678', '2015-07-20', 'Jl. Melati No. 8, Depok'),
  ('Budi Santoso', '198511052010011004', 'Staf Tata Usaha', 'Tata Usaha', 'Aktif', 'budi.santoso@sekolah.sch.id', '081377788899', '2010-11-05', 'Jl. Kenanga No. 3, Bekasi'),
  ('Rina Wulandari, S.Sos.', '199208172018032005', 'Pustakawan', 'Perpustakaan', 'Aktif', 'rina.wulandari@sekolah.sch.id', '085267891234', '2018-03-17', 'Jl. Cendana No. 21, Tangerang'),
  ('Hendra Wijaya', '197912012003011006', 'Tenaga Administrasi', 'Sarana Prasarana', 'Cuti', 'hendra.wijaya@sekolah.sch.id', '081809876543', '2003-01-02', 'Jl. Mawar No. 17, Bogor'),
  ('Maya Sari, S.Pd.', '196507101990032007', 'Guru', 'Kesiswaan', 'Pensiun', 'maya.sari@sekolah.sch.id', '081345678901', '1990-03-10', 'Jl. Anggrek No. 9, Jakarta'),
  ('Andi Pratama', '199503152020011008', 'Operator', 'Humas', 'Aktif', 'andi.pratama@sekolah.sch.id', '082198765432', '2020-01-15', 'Jl. Flamboyan No. 5, Depok')
on conflict (nip) do nothing;
