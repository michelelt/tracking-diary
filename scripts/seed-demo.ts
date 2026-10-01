// Seeds (or resets) the demo user's history on the database in DATABASE_URL: npm run seed:demo
import { db } from '../lib/db'
import { resetDemo } from '../lib/demo-seed'

resetDemo()
  .then((count) => console.log(`✅ Demo: ${count} giornate create`))
  .catch((error) => {
    console.error('❌ Errore:', error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
