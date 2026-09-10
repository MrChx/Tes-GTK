import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { PegawaiProvider } from './context/PegawaiContext'
import { ToastProvider } from './context/ToastContext'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import PegawaiDetail from './pages/PegawaiDetail'
import PegawaiForm from './pages/PegawaiForm'
import PegawaiList from './pages/PegawaiList'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PegawaiProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/pegawai" element={<PegawaiList />} />
                <Route path="/pegawai/tambah" element={<PegawaiForm />} />
                <Route path="/pegawai/:id" element={<PegawaiDetail />} />
                <Route path="/pegawai/:id/edit" element={<PegawaiForm />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </PegawaiProvider>
      </ToastProvider>
    </AuthProvider>
  )
}
