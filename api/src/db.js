import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Create tables
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      platforms JSONB NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active',
      priority BOOLEAN NOT NULL DEFAULT false,
      notes TEXT DEFAULT '',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      "clientId" INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'post',
      deadline TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      description TEXT DEFAULT '',
      "needsApproval" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      "clientId" INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      amount NUMERIC NOT NULL,
      currency TEXT NOT NULL DEFAULT 'MDL',
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid',
      date TEXT NOT NULL,
      notes TEXT DEFAULT ''
    );
  `)
  console.log('Database initialized')
}

initDB().catch(console.error)

export default pool