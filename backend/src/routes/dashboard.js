import { Router } from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { toPegawai } from '../mappers.js'

const router = Router()

router.get('/', requireAuth, async (_req, res) => {
  const [{ data: pegawai, error: pegawaiError }, { data: units, error: unitError }] =
    await Promise.all([
      supabase.from('pegawai').select('*').order('created_at', { ascending: false }),
      supabase.from('unit_kerja').select('nama').order('nama'),
    ])

  if (pegawaiError) return res.status(500).json({ message: pegawaiError.message })
  if (unitError) return res.status(500).json({ message: unitError.message })

  const list = (pegawai || []).map(toPegawai)
  const unitKerja = (units || []).map((item) => item.nama)

  res.json({
    totalPegawai: list.length,
    jumlahUnitKerja: unitKerja.length,
    aktif: list.filter((item) => item.status === 'Aktif').length,
    cuti: list.filter((item) => item.status === 'Cuti').length,
    pensiun: list.filter((item) => item.status === 'Pensiun').length,
    perUnit: unitKerja.map((unit) => ({
      unit,
      jumlah: list.filter((item) => item.unitKerja === unit).length,
    })),
    terbaru: list.slice(0, 5),
  })
})

export default router
