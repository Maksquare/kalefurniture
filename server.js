// Ensure NODE_ENV is set to production before anything else is required
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const fs = require('fs')
const path = require('path')

// Native zero-dependency .env loader (prevents "Cannot find module 'dotenv'" error on cPanel)
function loadEnvFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const idx = trimmed.indexOf('=')
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim()
          let val = trimmed.slice(idx + 1).trim()
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1)
          }
          if (key && !process.env[key]) {
            process.env[key] = val
          }
        }
      })
    }
  } catch (e) {
    console.error('Error loading env file:', e)
  }
}

// Load .env.local and .env
loadEnvFile(path.join(__dirname, '.env.local'))
loadEnvFile(path.join(__dirname, '.env'))

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV === 'development'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port, dir: __dirname })
const handle = app.getRequestHandler()

app.prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('Error occurred handling', req.url, err?.stack || err)
        res.statusCode = 500
        res.end('Internal Server Error')
      }
    })
      .once('error', (err) => {
        console.error('Server failed to start:', err)
        process.exit(1)
      })
      .listen(port, () => {
        console.log(`> Ready on port ${port} in production mode`)
      })
  })
  .catch((err) => {
    console.error('Next.js failed to prepare:', err)
    process.exit(1)
  })