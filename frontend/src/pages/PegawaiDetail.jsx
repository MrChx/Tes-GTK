import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import { CopyIcon } from '../components/Icons'
import { usePegawai } from '../context/PegawaiContext'
import { useToast } from '../context/ToastContext'

function Field({ label, value, copyable = false, onCopy }) {
  return (
    <div className="detail-field">
      <span className="field-label">{label}</span>
      <div className="field-val-row">
        <strong className="field-value">{value || '—'}</strong>
        {copyable && value && (
          <button
            type="button"
            className="btn-icon copy-btn"
            onClick={() => onCopy(value, label)}
            title={`Salin ${label}`}
            aria-label={`Salin ${label}`}
          >
            <CopyIcon size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function PegawaiDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, hapus, loading } = usePegawai()
  const { showToast } = useToast()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const item = getById(id)

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showToast(`${label} berhasil disalin!`, 'info', 2500)
      },
      () => {
        showToast('Gagal menyalin ke clipboard', 'error')
      },
    )
  }

  const handleDelete = async () => {
    if (!item) return
    setDeleting(true)
    try {
      await hapus(item.id)
      showToast(`Data pegawai "${item.nama}" berhasil dihapus.`, 'success')
      navigate('/pegawai')
    } catch (err) {
      showToast(`Gagal menghapus: ${err.message}`, 'error')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card loading-skeleton-card">
          <div className="skeleton-pulse" style={{ height: '60px', marginBottom: '20px' }} />
          <div className="skeleton-pulse" style={{ height: '200px' }} />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="page">
        <div className="card empty-state">
          <h2>Data pegawai tidak ditemukan</h2>
          <p className="muted">Pegawai dengan ID "{id}" mungkin telah dihapus.</p>
          <Link to="/pegawai" className="btn btn-primary">
            Kembali ke daftar pegawai
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="breadcrumb-nav">
            <Link to="/pegawai" className="breadcrumb-link">
              ← Kembali ke Daftar Pegawai
            </Link>
          </div>
          <p className="eyebrow">Profil Lengkap</p>
          <h1>{item.nama}</h1>
        </div>
        <div className="header-actions">
          <Link to={`/pegawai/${item.id}/edit`} className="btn btn-primary">
            Edit Data
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirm(true)}
          >
            Hapus
          </button>
        </div>
      </header>

      <article className="card detail-card">
        <div className="detail-top">
          <div className="avatar xl">{item.nama.charAt(0)}</div>
          <div className="detail-hero-info">
            <h2>{item.nama}</h2>
            <p className="detail-hero-sub">
              {item.jabatan} · <span className="unit-text">{item.unitKerja}</span>
            </p>
            <div className="detail-hero-badges">
              <span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span>
              <span className="badge badge-outline">ID: {item.id}</span>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <Field label="NIP" value={item.nip} copyable onCopy={handleCopy} />
          <Field label="Jabatan" value={item.jabatan} />
          <Field label="Unit Kerja" value={item.unitKerja} />
          <Field label="Status Kepegawaian" value={item.status} />
          <Field label="Email" value={item.email} copyable onCopy={handleCopy} />
          <Field label="Nomor Telepon" value={item.telepon} copyable onCopy={handleCopy} />
          <Field label="Tanggal Masuk" value={item.tanggalMasuk} />
          <Field label="Alamat Tinggal" value={item.alamat} />
        </div>
      </article>

      <ConfirmModal
        open={confirm}
        title="Hapus data pegawai?"
        message={`Data ${item.nama} (NIP: ${item.nip}) akan dihapus permanen dari sistem.`}
        loading={deleting}
        onCancel={() => setConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
