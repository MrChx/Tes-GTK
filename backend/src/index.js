import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase.js'
import authRoutes from './routes/auth.js'
import pegawaiRoutes from './routes/pegawai.js'
import dashboardRoutes from './routes/dashboard.js'
import masterRoutes from './routes/master.js'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET wajib diisi di file .env')
}

const app = express()
const port = Number(process.env.PORT || 4000)

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(express.json())

// Lazy ensure admin pada serverless/lokal saat request pertama
let adminChecked = false
app.use(async (_req, _res, next) => {
  if (!adminChecked) {
    try {
      await ensureAdmin()
      adminChecked = true
    } catch (err) {
      console.warn('Pengecekan akun admin awal:', err.message)
    }
  }
  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/pegawai', pegawaiRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/master', masterRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' })
})

async function ensureAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (error) throw error
  if (data) return

  const password_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)
  const { error: insertError } = await supabase.from('admins').insert({
    username,
    nama: process.env.ADMIN_NAMA || 'Administrator',
    password_hash,
  })
  if (insertError) throw insertError
  console.log(`Admin default dibuat: ${username}`)
}

app.listen(port, () => {
  console.log(`API GTK berjalan di port ${port}`)
})

export default app
