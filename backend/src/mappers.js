export function toPegawai(row) {
  if (!row) return null
  return {
    id: row.id,
    nama: row.nama,
    nip: row.nip,
    jabatan: row.jabatan,
    unitKerja: row.unit_kerja,
    status: row.status,
    email: row.email || '',
    telepon: row.telepon || '',
    tanggalMasuk: row.tanggal_masuk || '',
    alamat: row.alamat || '',
  }
}

export function fromPegawai(body) {
  return {
    nama: body.nama?.trim(),
    nip: body.nip?.trim(),
    jabatan: body.jabatan,
    unit_kerja: body.unitKerja,
    status: body.status,
    email: body.email?.trim() || null,
    telepon: body.telepon?.trim() || null,
    tanggal_masuk: body.tanggalMasuk || null,
    alamat: body.alamat?.trim() || null,
  }
}
