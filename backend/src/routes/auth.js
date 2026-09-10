import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function signUser(admin) {
  return jwt.sign(
    { id: admin.id, username: admin.username, nama: admin.nama },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  )
}

router.post('/login', async (req, res) => {
  const username = req.body.username?.trim()
  const password = req.body.password

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi.' })
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .select('id, username, nama, password_hash')
    .eq('username', username)
    .maybeSingle()

  if (error) return res.status(500).json({ message: error.message })
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ message: 'Username atau password salah.' })
  }

  const user = { id: admin.id, username: admin.username, nama: admin.nama }
  return res.json({ token: signUser(admin), user })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

export default router
