import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { JABATAN, STATUS, UNIT_KERJA } from '../data/seed'
import { useAuth } from './AuthContext'

const PegawaiContext = createContext(null)

export function PegawaiProvider({ children }) {
  const { user } = useAuth()
  const [pegawai, setPegawai] = useState([])
  const [master, setMaster] = useState({
    unitKerja: UNIT_KERJA,
    jabatan: JABATAN,
    status: STATUS,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reload = async () => {
    setLoading(true)
    setError('')
    try {
      const [list, masterData] = await Promise.all([api('/pegawai'), api('/master')])
      setPegawai(list)
      setMaster(masterData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      setPegawai([])
      return
    }
    reload()
  }, [user])

  const getById = useCallback(
    (id) => pegawai.find((item) => item.id === id),
    [pegawai],
  )

  const tambah = async (data) => {
    const item = await api('/pegawai', { method: 'POST', body: data })
    setPegawai((prev) => [item, ...prev])
    return item
  }

  const ubah = async (id, data) => {
    const item = await api(`/pegawai/${id}`, { method: 'PUT', body: data })
    setPegawai((prev) => prev.map((row) => (row.id === id ? item : row)))
    return item
  }

  const hapus = async (id) => {
    await api(`/pegawai/${id}`, { method: 'DELETE' })
    setPegawai((prev) => prev.filter((item) => item.id !== id))
  }

  const value = useMemo(
    () => ({ pegawai, master, loading, error, reload, getById, tambah, ubah, hapus }),
    [pegawai, master, loading, error, getById],
  )

  return <PegawaiContext.Provider value={value}>{children}</PegawaiContext.Provider>
}

export function usePegawai() {
  const ctx = useContext(PegawaiContext)
  if (!ctx) throw new Error('usePegawai harus dipakai di dalam PegawaiProvider')
  return ctx
}
