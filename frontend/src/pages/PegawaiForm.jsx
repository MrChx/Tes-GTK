import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePegawai } from '../context/PegawaiContext'
import { useToast } from '../context/ToastContext'

const emptyForm = {
  nama: '',
  nip: '',
  jabatan: 'Guru',
  unitKerja: 'Tata Usaha',
  status: 'Aktif',
  email: '',
  telepon: '',
  tanggalMasuk: '',
  alamat: '',
}

export default function PegawaiForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, tambah, ubah, master, loading } = usePegawai()
  const { showToast } = useToast()
  const existing = id ? getById(id) : null
  const isEdit = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setForm({ ...emptyForm, ...existing })
    }
  }, [existing])

  if (isEdit && loading) {
    return (
      <div className="page">
        <div className="card loading-skeleton-card">
          <div className="skeleton-pulse" style={{ height: '40px', marginBottom: '16px' }} />
          <div className="skeleton-pulse" style={{ height: '240px' }} />
        </div>
      </div>
    )
  }

  if (isEdit && !existing && !loading) {
    return (
      <div className="page">
        <div className="card empty-state">
          <h2>Data pegawai tidak ditemukan</h2>
          <p className="muted">Pegawai yang ingin diedit tidak ada dalam database.</p>
          <Link to="/pegawai" className="btn btn-primary">
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    )
  }

  const update = (field) => (e) => {
    const val = e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const errors = {}
    if (!form.nama.trim()) {
      errors.nama = 'Nama lengkap wajib diisi.'
    }
    if (!form.nip.trim()) {
      errors.nip = 'NIP wajib diisi.'
    } else if (!/^\d+$/.test(form.nip.trim())) {
      errors.nip = 'NIP hanya boleh berupa angka.'
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Format alamat email tidak valid.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      setError('Mohon perbaiki isian formulir yang ditandai merah.')
      return
    }

    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        await ubah(id, form)
        showToast(`Data pegawai "${form.nama}" berhasil diperbarui!`, 'success')
        navigate(`/pegawai/${id}`)
      } else {
        const created = await tambah(form)
        showToast(`Pegawai baru "${created.nama}" berhasil ditambahkan!`, 'success')
        navigate(`/pegawai/${created.id}`)
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="breadcrumb-nav">
            <Link
              to={isEdit ? `/pegawai/${id}` : '/pegawai'}
              className="breadcrumb-link"
            >
              ← {isEdit ? 'Batal dan Kembali' : 'Kembali ke Daftar'}
            </Link>
          </div>
          <p className="eyebrow">{isEdit ? 'Perbarui Profil' : 'Formulir Baru'}</p>
          <h1>{isEdit ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}</h1>
        </div>
      </header>

      <form className="card form-container" onSubmit={handleSubmit} noValidate>
        {error && <div className="alert error">{error}</div>}

        <div className="form-grid">
          <label className="form-field">
            <span className="field-title">
              Nama Lengkap <span className="req-star">*</span>
            </span>
            <input
              type="text"
              value={form.nama}
              onChange={update('nama')}
              placeholder="Contoh: Siti Nurhaliza, S.Pd."
              className={fieldErrors.nama ? 'input-error' : ''}
              required
            />
            {fieldErrors.nama && <span className="error-text">{fieldErrors.nama}</span>}
          </label>

          <label className="form-field">
            <span className="field-title">
              NIP (Nomor Induk Pegawai) <span className="req-star">*</span>
            </span>
            <input
              type="text"
              value={form.nip}
              onChange={update('nip')}
              placeholder="Contoh: 198501012010011001"
              maxLength={20}
              className={fieldErrors.nip ? 'input-error' : ''}
              required
            />
            {fieldErrors.nip && <span className="error-text">{fieldErrors.nip}</span>}
          </label>

          <label className="form-field">
            <span className="field-title">Jabatan</span>
            <select value={form.jabatan} onChange={update('jabatan')}>
              {master.jabatan.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="field-title">Unit Kerja</span>
            <select value={form.unitKerja} onChange={update('unitKerja')}>
              {master.unitKerja.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="field-title">Status Kepegawaian</span>
            <select value={form.status} onChange={update('status')}>
              {master.status.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="field-title">Tanggal Mulai Tugas</span>
            <input
              type="date"
              value={form.tanggalMasuk}
              onChange={update('tanggalMasuk')}
            />
          </label>

          <label className="form-field">
            <span className="field-title">Alamat Email</span>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="nama@sekolah.sch.id"
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
          </label>

          <label className="form-field">
            <span className="field-title">Nomor WhatsApp / Telepon</span>
            <input
              type="tel"
              value={form.telepon}
              onChange={update('telepon')}
              placeholder="081234567890"
            />
          </label>

          <label className="form-field full">
            <span className="field-title">Alamat Lengkap</span>
            <textarea
              value={form.alamat}
              onChange={update('alamat')}
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota..."
              rows={3}
            />
          </label>
        </div>

        <div className="form-actions">
          <Link
            to={isEdit ? `/pegawai/${id}` : '/pegawai'}
            className="btn btn-ghost"
          >
            Batal
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-sm" />
                <span>Menyimpan...</span>
              </>
            ) : isEdit ? (
              'Simpan Perubahan'
            ) : (
              'Simpan Pegawai'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
