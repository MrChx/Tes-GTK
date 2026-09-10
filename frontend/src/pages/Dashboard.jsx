import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { ArrowRightIcon, PlusIcon } from '../components/Icons'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    api('/dashboard')
      .then((data) => {
        setStats(data)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (error) {
    return (
      <div className="page">
        <div className="alert error">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            style={{ marginLeft: 'auto' }}
            onClick={() => window.location.reload()}
          >
            Muat Ulang
          </button>
        </div>
      </div>
    )
  }

  if (loading || !stats) {
    return (
      <div className="page">
        <div className="page-header skeleton-pulse" style={{ height: '60px' }} />
        <div className="stat-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card skeleton-pulse" style={{ height: '110px' }} />
          ))}
        </div>
        <div className="split">
          <div className="card skeleton-pulse" style={{ height: '280px' }} />
          <div className="card skeleton-pulse" style={{ height: '280px' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Ringkasan Sistem</p>
          <h1>Dashboard GTK</h1>
        </div>
        <Link to="/pegawai/tambah" className="btn btn-primary">
          <PlusIcon size={16} />
          <span>Tambah Pegawai</span>
        </Link>
      </header>

      {/* Interactive Stat Cards */}
      <section className="stat-grid" aria-label="Statistik Pegawai">
        <article
          className="stat-card clickable"
          onClick={() => navigate('/pegawai')}
          title="Klik untuk melihat semua pegawai"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/pegawai')}
        >
          <div className="stat-card-header">
            <span>Jumlah Pegawai</span>
            <span className="stat-icon-badge">👥</span>
          </div>
          <strong>{stats.totalPegawai}</strong>
          <span className="stat-action-hint">Lihat semua data →</span>
        </article>

        <article
          className="stat-card clickable"
          onClick={() => navigate('/pegawai')}
          title="Klik untuk melihat daftar unit kerja"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/pegawai')}
        >
          <div className="stat-card-header">
            <span>Jumlah Unit Kerja</span>
            <span className="stat-icon-badge">🏢</span>
          </div>
          <strong>{stats.jumlahUnitKerja}</strong>
          <span className="stat-action-hint">Lihat sebaran unit →</span>
        </article>

        <article
          className="stat-card accent clickable"
          onClick={() => navigate('/pegawai?status=Aktif')}
          title="Klik untuk memfilter pegawai Aktif"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/pegawai?status=Aktif')}
        >
          <div className="stat-card-header">
            <span>Pegawai Aktif</span>
            <span className="stat-icon-badge">🟢</span>
          </div>
          <strong>{stats.aktif}</strong>
          <span className="stat-action-hint light">Filter aktif →</span>
        </article>

        <article
          className="stat-card clickable"
          onClick={() => navigate('/pegawai?status=Cuti')}
          title="Klik untuk melihat pegawai Cuti / Pensiun"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/pegawai?status=Cuti')}
        >
          <div className="stat-card-header">
            <span>Cuti / Pensiun</span>
            <span className="stat-icon-badge">📋</span>
          </div>
          <strong>
            {stats.cuti} / {stats.pensiun}
          </strong>
          <span className="stat-action-hint">Filter status ini →</span>
        </article>
      </section>

      <section className="split">
        {/* Interactive Unit Kerja Bars */}
        <article className="card">
          <div className="card-header-flex">
            <h2>Pegawai per Unit Kerja</h2>
            <small className="muted">Klik unit untuk memfilter</small>
          </div>
          <ul className="bar-list">
            {stats.perUnit.map((item) => {
              const percent = stats.totalPegawai
                ? Math.round((item.jumlah / stats.totalPegawai) * 100)
                : 0

              return (
                <li
                  key={item.unit}
                  className="bar-item-interactive"
                  onClick={() => navigate(`/pegawai?unit=${encodeURIComponent(item.unit)}`)}
                  title={`Lihat ${item.jumlah} pegawai di ${item.unit}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    navigate(`/pegawai?unit=${encodeURIComponent(item.unit)}`)
                  }
                >
                  <div className="bar-meta">
                    <span className="bar-label">{item.unit}</span>
                    <span className="bar-stat-val">
                      <b>{item.jumlah}</b>
                      <small className="muted"> ({percent}%)</small>
                    </span>
                  </div>
                  <div className="bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </article>

        {/* Interactive Pegawai Terbaru */}
        <article className="card">
          <div className="card-header-flex">
            <h2>Pegawai Terbaru</h2>
            <span className="badge">{stats.terbaru.length} Baru</span>
          </div>
          <ul className="simple-list">
            {stats.terbaru.map((item) => (
              <li
                key={item.id}
                className="recent-item clickable"
                onClick={() => navigate(`/pegawai/${item.id}`)}
                title={`Buka profil ${item.nama}`}
              >
                <div className="recent-item-info">
                  <div className="avatar sm">{item.nama.charAt(0)}</div>
                  <div>
                    <strong className="recent-name">{item.nama}</strong>
                    <small>
                      {item.jabatan} · {item.unitKerja}
                    </small>
                  </div>
                </div>
                <span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span>
              </li>
            ))}
          </ul>
          <Link to="/pegawai" className="text-link">
            <span>Lihat semua data pegawai</span>
            <ArrowRightIcon size={14} />
          </Link>
        </article>
      </section>
    </div>
  )
}
