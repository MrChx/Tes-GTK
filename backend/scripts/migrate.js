import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.resolve(__dirname, '../sql/schema.sql')

async function runDirectPostgresMigration(databaseUrl, sql) {
  console.log('🔄 Menghubungkan langsung ke PostgreSQL Supabase via DATABASE_URL...')
  let pgModule
  try {
    pgModule = await import('pg')
  } catch {
    console.error('❌ Modul "pg" belum terpasang. Menjalankan migrasi langsung memerlukan driver pg.')
    console.log('💡 Jalankan: npm install pg')
    return false
  }

  const cleanDatabaseUrl = databaseUrl.replace(/:\[([^\]]+)\]@/, ':$1@')
  const { Client } = pgModule.default || pgModule
  const client = new Client({
    connectionString: cleanDatabaseUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    console.log('✅ Berhasil terhubung ke database Supabase.')
    console.log('⏳ Menjalankan script migrasi schema.sql...')
    await client.query(sql)
    console.log('🎉 Migrasi schema dan data awal berhasil dieksekusi!')
    await client.end()
    return true
  } catch (err) {
    console.error('❌ Gagal mengeksekusi SQL melalui PostgreSQL:', err.message)
    try {
      await client.end()
    } catch {}
    return false
  }
}

async function runManagementApiMigration(projectRef, accessToken, sql) {
  console.log(`🔄 Mengirim migrasi ke Supabase Management API (Project: ${projectRef})...`)
  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query: sql }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`❌ API Supabase mengembalikan status ${res.status}:`, text)
      return false
    }

    console.log('🎉 Migrasi schema dan seed berhasil dieksekusi via Management API!')
    return true
  } catch (err) {
    console.error('❌ Gagal menghubungi API Supabase:', err.message)
    return false
  }
}

async function verifyTables(supabaseUrl, serviceRoleKey) {
  console.log('🔍 Memverifikasi status tabel di Supabase...')
  try {
    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const [adminCheck, unitCheck, pegawaiCheck] = await Promise.all([
      client.from('admins').select('id', { count: 'exact', head: true }),
      client.from('unit_kerja').select('id', { count: 'exact', head: true }),
      client.from('pegawai').select('id', { count: 'exact', head: true }),
    ])

    const hasAdmins = !adminCheck.error
    const hasUnit = !unitCheck.error
    const hasPegawai = !pegawaiCheck.error

    if (hasAdmins && hasUnit && hasPegawai) {
      console.log('✅ Tabel "admins" : OK')
      console.log(`✅ Tabel "unit_kerja" : OK (${unitCheck.count ?? 0} data)`)
      console.log(`✅ Tabel "pegawai" : OK (${pegawaiCheck.count ?? 0} data)`)
      console.log('\n🌟 Seluruh tabel Supabase telah siap dan terverifikasi!')
      return true
    } else {
      console.log('⚠️ Beberapa tabel belum ditemukan:')
      if (!hasAdmins) console.log('   - admins: ' + adminCheck.error?.message)
      if (!hasUnit) console.log('   - unit_kerja: ' + unitCheck.error?.message)
      if (!hasPegawai) console.log('   - pegawai: ' + pegawaiCheck.error?.message)
      return false
    }
  } catch (err) {
    console.error('❌ Gagal memverifikasi dengan Supabase Client:', err.message)
    return false
  }
}

function extractProjectRef(url) {
  if (!url) return null
  const match = url.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/i)
  return match ? match[1] : null
}

async function main() {
  console.log('====================================================')
  console.log('   MIGRASI DATABASE SISTEM DATA GTK KE SUPABASE     ')
  console.log('====================================================\n')

  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ File skema tidak ditemukan di: ${schemaPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8')
  const {
    DATABASE_URL,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ACCESS_TOKEN,
  } = process.env

  const isPlaceholderUrl =
    !SUPABASE_URL || SUPABASE_URL.includes('YOUR_PROJECT') || SUPABASE_URL === 'https://YOUR_PROJECT.supabase.co'
  const isPlaceholderKey =
    !SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === 'your-service-role-key'

  const projectRef = extractProjectRef(SUPABASE_URL)

  // 1. Cek apakah sudah ada DATABASE_URL
  if (DATABASE_URL && !DATABASE_URL.includes('your-password')) {
    const success = await runDirectPostgresMigration(DATABASE_URL, sql)
    if (success) {
      if (!isPlaceholderUrl && !isPlaceholderKey) {
        await verifyTables(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      }
      process.exit(0)
    }
  }

  // 2. Cek apakah ada SUPABASE_ACCESS_TOKEN
  if (SUPABASE_ACCESS_TOKEN && projectRef) {
    const success = await runManagementApiMigration(projectRef, SUPABASE_ACCESS_TOKEN, sql)
    if (success) {
      if (!isPlaceholderUrl && !isPlaceholderKey) {
        await verifyTables(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      }
      process.exit(0)
    }
  }

  // 3. Cek apakah tabel sudah ada di Supabase
  if (!isPlaceholderUrl && !isPlaceholderKey) {
    const isOk = await verifyTables(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    if (isOk) {
      console.log('Database Anda sudah termigrasi dan siap dijalankan.')
      process.exit(0)
    }
  }

  // 4. Panduan jika belum ada koneksi otomatis
  console.log('\n📌 LANGKAH MIGRASI LANGSUNG KE SUPABASE ANDA:\n')

  if (projectRef) {
    console.log(`🔗 Buka SQL Editor project Anda di tautan ini:`)
    console.log(`👉 https://supabase.com/dashboard/project/${projectRef}/sql/new\n`)
  } else {
    console.log(`🔗 Buka SQL Editor di Dashboard Supabase:`)
    console.log(`👉 https://supabase.com/dashboard\n`)
  }

  console.log('Langkah 1: Salin seluruh isi file SQL di bawah ini atau dari file:')
  console.log(`   ${schemaPath}\n`)
  console.log('Langkah 2: Tempel (Paste) di SQL Editor Supabase, lalu klik tombol "Run" (▶️).\n')
  console.log('--- ATAU OTOMATIS VIA COMMAND LINE ---')
  console.log('Tambahkan salah satu konfigurasi berikut di file backend/.env:')
  console.log('A) DATABASE_URL=postgresql://postgres.[project-ref]:[db-password]@aws-0-[region].pooler.supabase.com:6543/postgres')
  console.log('   (Dapat dilihat di Supabase: Project Settings -> Database -> Connection string -> URI)')
  console.log('B) SUPABASE_ACCESS_TOKEN=sbp_xxxx (dari https://supabase.com/dashboard/account/tokens)')
  console.log('\nLalu jalankan kembali: npm run migrate\n')
}

main().catch((err) => {
  console.error('Terjadi kesalahan:', err)
  process.exit(1)
})
