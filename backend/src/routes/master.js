import { Router } from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (_req, res) => {
  const { data, error } = await supabase.from('unit_kerja').select('nama').order('nama')
  if (error) return res.status(500).json({ message: error.message })

  res.json({
    unitKerja: (data || []).map((item) => item.nama),
    jabatan: [
      'Kepala Sekolah',
      'Wakil Kepala Sekolah',
      'Guru',
      'Staf Tata Usaha',
      'Pustakawan',
      'Operator',
      'Tenaga Administrasi',
    ],
    status: ['Aktif', 'Cuti', 'Pensiun'],
  })
})

export default router
