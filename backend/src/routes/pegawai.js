import { Router } from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'
import { fromPegawai, toPegawai } from '../mappers.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  const q = String(req.query.q || '').trim()
  const unitKerja = String(req.query.unitKerja || '').trim()

  let query = supabase.from('pegawai').select('*').order('created_at', { ascending: false })

  if (unitKerja && unitKerja !== 'Semua') {
    query = query.eq('unit_kerja', unitKerja)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ message: error.message })

  const keyword = q.toLowerCase()
  const list = (data || [])
    .map(toPegawai)
    .filter((item) => {
      if (!keyword) return true
      return (
        item.nama.toLowerCase().includes(keyword) ||
        item.unitKerja.toLowerCase().includes(keyword)
      )
    })

  res.json(list)
})

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('pegawai')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle()

  if (error) return res.status(500).json({ message: error.message })
  if (!data) return res.status(404).json({ message: 'Data pegawai tidak ditemukan.' })
  res.json(toPegawai(data))
})

router.post('/', async (req, res) => {
  const payload = fromPegawai(req.body)
  if (!payload.nama || !payload.nip) {
    return res.status(400).json({ message: 'Nama dan NIP wajib diisi.' })
  }

  const { data, error } = await supabase.from('pegawai').insert(payload).select('*').single()
  if (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'NIP sudah digunakan.' })
    }
    return res.status(500).json({ message: error.message })
  }

  res.status(201).json(toPegawai(data))
})

router.put('/:id', async (req, res) => {
  const payload = fromPegawai(req.body)
  if (!payload.nama || !payload.nip) {
    return res.status(400).json({ message: 'Nama dan NIP wajib diisi.' })
  }

  const { data, error } = await supabase
    .from('pegawai')
    .update(payload)
    .eq('id', req.params.id)
    .select('*')
    .maybeSingle()

  if (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'NIP sudah digunakan.' })
    }
    return res.status(500).json({ message: error.message })
  }
  if (!data) return res.status(404).json({ message: 'Data pegawai tidak ditemukan.' })
  res.json(toPegawai(data))
})

router.delete('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('pegawai')
    .delete()
    .eq('id', req.params.id)
    .select('id')
    .maybeSingle()

  if (error) return res.status(500).json({ message: error.message })
  if (!data) return res.status(404).json({ message: 'Data pegawai tidak ditemukan.' })
  res.status(204).send()
})

export default router
