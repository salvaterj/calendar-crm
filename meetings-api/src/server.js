import express from 'express'
import cors from 'cors'
import { meetingsRouter } from './routes/meetings.js'

const app = express()

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/meetings', meetingsRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'internal error' })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`meetings-api rodando na porta ${port}`)
})
