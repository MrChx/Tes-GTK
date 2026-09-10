import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { CloseIcon, MenuIcon } from './Icons'
import logoImg from '../assets/logo.png'

export default function Layout() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const handleLogout = () => {
    const name = user?.nama || 'Admin'
    logout()
    showToast(`Sampai jumpa, ${name}!`, 'info')
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="app-shell">
      {/* Mobile Top Navigation Bar */}
      <header className="mobile-header">
        <div className="mobile-header-left">
          <button
            type="button"
            className="btn-icon mobile-menu-btn"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
          <div className="mobile-brand">
            <img src={logoImg} alt="Logo GTK" className="brand-logo sm" />
            <span className="mobile-title">Sistem Data GTK</span>
          </div>
        </div>

        <div className="mobile-header-right">
          <span className="avatar sm" title={user?.nama}>
            {user?.nama?.charAt(0) || 'A'}
          </span>
        </div>
      </header>

      {/* Drawer backdrop on mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop active"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar / Mobile Drawer */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Menu Utama">
        <div className="sidebar-header-row">
          <div className="brand">
            <img src={logoImg} alt="Logo GTK" className="brand-logo" />
            <div>
              <strong>Sistem Data GTK</strong>
              <p>Guru & Tenaga Kependidikan</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Tutup navigasi"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <nav className="side-nav">
          <NavLink to="/" end onClick={closeSidebar}>
            Dashboard
          </NavLink>
          <NavLink to="/pegawai" end onClick={closeSidebar}>
            Data Pegawai
          </NavLink>
          <NavLink to="/pegawai/tambah" onClick={closeSidebar}>
            + Tambah Pegawai
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{user?.nama?.charAt(0) || 'A'}</span>
            <div className="user-info">
              <strong>{user?.nama || 'Admin'}</strong>
              <small>Administrator</small>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-block" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
