import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon } from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import logoImg from '../assets/logo.png'

export default function Login() {
  const { user, ready, login } = useAuth()
  const { showToast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!ready) {
    return (
      <div className="login-page">
        <div className="card loading-skeleton-card" style={{ maxWidth: '400px', margin: 'auto' }}>
          <div className="page-loading">Memeriksa sesi login...</div>
        </div>
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.')
      return
    }

    setSubmitting(true)
    setError('')
    const result = await login(username.trim(), password)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message || 'Login gagal. Periksa username dan password.')
      showToast(result.message || 'Login gagal!', 'error')
    } else {
      showToast('Selamat datang di Sistem Data GTK!', 'success')
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-hero">
          <img src={logoImg} alt="Logo Kemendikbud GTK" className="brand-logo lg" />
          <h1>Sistem Data Pegawai</h1>
          <p>
            Kelola data Guru dan Tenaga Kependidikan sekolah dengan efisien, akurat, dan terintegrasi.
          </p>
          <div className="login-features-list">
            <div className="feature-pill">✓ Manajemen Pegawai Terpadu</div>
            <div className="feature-pill">✓ Statistik & Sebaran Unit</div>
            <div className="feature-pill">✓ Ekspor Data Cepat</div>
          </div>
        </div>

        <div className="login-form-wrapper">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div>
              <h2>Masuk Sistem</h2>
              <p className="muted">Gunakan akun admin terdaftar untuk melanjutkan.</p>
              <p>Username: admin, Password: admin123</p>
            </div>

            {error && (
              <div className="alert error">
                <span>{error}</span>
              </div>
            )}

            <label className="login-field">
              <span>Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                required
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="btn btn-primary btn-block login-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-sm" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
