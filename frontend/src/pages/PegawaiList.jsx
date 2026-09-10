import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import {
  CloseIcon,
  DownloadIcon,
  GridIcon,
  PlusIcon,
  SearchIcon,
  SortAscIcon,
  SortDefaultIcon,
  SortDescIcon,
  TableIcon,
} from '../components/Icons'
import { usePegawai } from '../context/PegawaiContext'
import { useToast } from '../context/ToastContext'

export default function PegawaiList() {
  const { pegawai, master, loading, error, hapus } = usePegawai()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialStatus = searchParams.get('status') || 'Semua'
  const initialUnit = searchParams.get('unit') || 'Semua'
  const initialQ = searchParams.get('q') || ''

  const [q, setQ] = useState(initialQ)
  const [unit, setUnit] = useState(initialUnit)
  const [status, setStatus] = useState(initialStatus)
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'
  const [sortField, setSortField] = useState('nama')
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' | 'desc'
  const [targetHapus, setTargetHapus] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Sync back to URL params when filters change
  const handleFilterChange = (newQ, newUnit, newStatus) => {
    const params = {}
    if (newQ) params.q = newQ
    if (newUnit && newUnit !== 'Semua') params.unit = newUnit
    if (newStatus && newStatus !== 'Semua') params.status = newStatus
    setSearchParams(params, { replace: true })
  }

  const handleQChange = (val) => {
    setQ(val)
    handleFilterChange(val, unit, status)
  }

  const handleUnitChange = (val) => {
    setUnit(val)
    handleFilterChange(q, val, status)
  }

  const handleStatusChange = (val) => {
    setStatus(val)
    handleFilterChange(q, unit, val)
  }

  const handleResetFilters = () => {
    setQ('')
    setUnit('Semua')
    setStatus('Semua')
    setSearchParams({}, { replace: true })
  }

  const isFiltered = q.trim() !== '' || unit !== 'Semua' || status !== 'Semua'

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Filtered & sorted data
  const filteredData = useMemo(() => {
    const keyword = q.trim().toLowerCase()

    const list = pegawai.filter((item) => {
      const matchNama = item.nama?.toLowerCase().includes(keyword) || false
      const matchNip = item.nip?.toLowerCase().includes(keyword) || false
      const matchJabatan = item.jabatan?.toLowerCase().includes(keyword) || false
      const matchUnitKeyword = item.unitKerja?.toLowerCase().includes(keyword) || false

      const matchKeyword =
        !keyword || matchNama || matchNip || matchJabatan || matchUnitKeyword
      const matchUnit = unit === 'Semua' || item.unitKerja === unit
      const matchStatus = status === 'Semua' || item.status === status

      return matchKeyword && matchUnit && matchStatus
    })

    return [...list].sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase()
      const valB = (b[sortField] || '').toString().toLowerCase()
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [pegawai, q, unit, status, sortField, sortOrder])

  // CSV Export
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'info')
      return
    }

    const headers = ['ID', 'Nama', 'NIP', 'Jabatan', 'Unit Kerja', 'Status', 'Email', 'Telepon']
    const rows = filteredData.map((p) => [
      `"${p.id}"`,
      `"${p.nama.replace(/"/g, '""')}"`,
      `"${p.nip}"`,
      `"${p.jabatan}"`,
      `"${p.unitKerja}"`,
      `"${p.status}"`,
      `"${p.email || ''}"`,
      `"${p.telepon || ''}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `data-pegawai-gtk-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast(`Berhasil mengekspor ${filteredData.length} data pegawai ke CSV!`, 'success')
  }

  const handleDeleteConfirm = async () => {
    if (!targetHapus) return
    setDeleting(true)
    try {
      await hapus(targetHapus.id)
      showToast(`Data "${targetHapus.nama}" berhasil dihapus.`, 'success')
      setTargetHapus(null)
    } catch (err) {
      showToast(`Gagal menghapus: ${err.message}`, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) return <SortDefaultIcon />
    return sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Master Data Terpadu</p>
          <h1>Data Pegawai GTK</h1>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleExportCSV}
            title="Ekspor daftar saat ini ke file CSV"
          >
            <DownloadIcon size={16} />
            <span className="btn-text-responsive">Ekspor CSV</span>
          </button>
          <Link to="/pegawai/tambah" className="btn btn-primary">
            <PlusIcon size={16} />
            <span>Tambah Pegawai</span>
          </Link>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      {/* Interactive Toolbar with Multi-Filters & View Toggle */}
      <div className="card toolbar-container">
        <div className="toolbar-main">
          <div className="search-box">
            <SearchIcon className="search-icon" size={18} />
            <input
              type="text"
              value={q}
              onChange={(e) => handleQChange(e.target.value)}
              placeholder="Cari nama, NIP, jabatan..."
              aria-label="Cari data pegawai"
            />
            {q && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => handleQChange('')}
                aria-label="Hapus teks pencarian"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          <div className="filter-group">
            <select
              value={unit}
              onChange={(e) => handleUnitChange(e.target.value)}
              aria-label="Filter unit kerja"
              className="filter-select"
            >
              <option value="Semua">Semua Unit Kerja</option>
              {master.unitKerja.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              aria-label="Filter status pegawai"
              className="filter-select"
            >
              <option value="Semua">Semua Status</option>
              {master.status.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="toolbar-footer">
          <div className="toolbar-info">
            <span className="muted">
              Menampilkan <b>{filteredData.length}</b> dari {pegawai.length} pegawai
            </span>
            {isFiltered && (
              <button
                type="button"
                className="btn-link reset-btn"
                onClick={handleResetFilters}
              >
                Reset filter
              </button>
            )}
          </div>

          <div className="view-toggle" role="group" aria-label="Tampilan">
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Tampilan Tabel"
              aria-label="Tampilan Tabel"
            >
              <TableIcon size={16} />
              <span className="toggle-label">Tabel</span>
            </button>
            <button
              type="button"
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Tampilan Kartu"
              aria-label="Tampilan Kartu"
            >
              <GridIcon size={16} />
              <span className="toggle-label">Kartu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="card loading-skeleton-card">
          <div className="skeleton-pulse" style={{ height: '40px', marginBottom: '12px' }} />
          <div className="skeleton-pulse" style={{ height: '40px', marginBottom: '12px' }} />
          <div className="skeleton-pulse" style={{ height: '40px', marginBottom: '12px' }} />
        </div>
      ) : filteredData.length === 0 ? (
        /* Empty State */
        <div className="card empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Tidak ada data pegawai yang sesuai</h3>
          <p className="muted">
            {isFiltered
              ? 'Coba ubah kata kunci atau bersihkan filter yang aktif.'
              : 'Belum ada data pegawai yang terdaftar di sistem.'}
          </p>
          {isFiltered ? (
            <button type="button" className="btn btn-ghost" onClick={handleResetFilters}>
              Reset Semua Filter
            </button>
          ) : (
            <Link to="/pegawai/tambah" className="btn btn-primary">
              Tambah Pegawai Baru
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="card table-wrap">
          <table className="responsive-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort('nama')}
                  className="sortable"
                  title="Urutkan berdasarkan nama"
                >
                  <div className="th-content">
                    <span>Nama</span>
                    {renderSortIcon('nama')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nip')}
                  className="sortable"
                  title="Urutkan berdasarkan NIP"
                >
                  <div className="th-content">
                    <span>NIP</span>
                    {renderSortIcon('nip')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('jabatan')}
                  className="sortable"
                  title="Urutkan berdasarkan jabatan"
                >
                  <div className="th-content">
                    <span>Jabatan</span>
                    {renderSortIcon('jabatan')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unitKerja')}
                  className="sortable"
                  title="Urutkan berdasarkan unit kerja"
                >
                  <div className="th-content">
                    <span>Unit Kerja</span>
                    {renderSortIcon('unitKerja')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="sortable"
                  title="Urutkan berdasarkan status"
                >
                  <div className="th-content">
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th className="th-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="table-row-hover">
                  <td>
                    <div className="name-cell">
                      <span className="avatar sm">{item.nama.charAt(0)}</span>
                      <Link to={`/pegawai/${item.id}`} className="name-link">
                        {item.nama}
                      </Link>
                    </div>
                  </td>
                  <td className="code-font">{item.nip}</td>
                  <td>{item.jabatan}</td>
                  <td>
                    <button
                      type="button"
                      className="unit-chip-btn"
                      onClick={() => handleUnitChange(item.unitKerja)}
                      title={`Filter unit: ${item.unitKerja}`}
                    >
                      {item.unitKerja}
                    </button>
                  </td>
                  <td>
                    <span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span>
                  </td>
                  <td className="actions">
                    <div className="action-btns-group">
                      <Link
                        to={`/pegawai/${item.id}`}
                        className="btn btn-ghost btn-sm"
                        title="Lihat Detail"
                      >
                        Detail
                      </Link>
                      <Link
                        to={`/pegawai/${item.id}/edit`}
                        className="btn btn-ghost btn-sm"
                        title="Edit Data"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger-ghost btn-sm"
                        onClick={() => setTargetHapus(item)}
                        title="Hapus Pegawai"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View (Touch & Mobile Friendly) */
        <div className="pegawai-cards-grid">
          {filteredData.map((item) => (
            <article key={item.id} className="card pegawai-card">
              <div className="pegawai-card-header">
                <div className="pegawai-card-avatar">
                  <span className="avatar">{item.nama.charAt(0)}</span>
                </div>
                <div className="pegawai-card-title">
                  <Link to={`/pegawai/${item.id}`} className="name-link">
                    {item.nama}
                  </Link>
                  <span className="code-font text-sm muted">NIP: {item.nip}</span>
                </div>
                <span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span>
              </div>

              <div className="pegawai-card-body">
                <div className="card-info-row">
                  <span className="info-label">Jabatan:</span>
                  <span className="info-val">{item.jabatan}</span>
                </div>
                <div className="card-info-row">
                  <span className="info-label">Unit Kerja:</span>
                  <span className="info-val">{item.unitKerja}</span>
                </div>
                {item.email && (
                  <div className="card-info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-val text-truncate">{item.email}</span>
                  </div>
                )}
              </div>

              <div className="pegawai-card-footer">
                <Link to={`/pegawai/${item.id}`} className="btn btn-ghost btn-sm">
                  Detail
                </Link>
                <Link to={`/pegawai/${item.id}/edit`} className="btn btn-ghost btn-sm">
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-danger-ghost btn-sm"
                  onClick={() => setTargetHapus(item)}
                >
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={Boolean(targetHapus)}
        title="Hapus data pegawai?"
        message={`Data "${targetHapus?.nama}" (NIP: ${targetHapus?.nip}) akan dihapus secara permanen.`}
        loading={deleting}
        onCancel={() => setTargetHapus(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
