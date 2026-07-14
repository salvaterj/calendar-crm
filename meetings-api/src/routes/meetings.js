import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { pool } from '../db.js'

export const meetingsRouter = Router()

function toApi(row) {
  return {
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    participantIds: row.participant_ids,
    isOnline: row.is_online,
    location: row.location,
    createdAt: row.created_at
  }
}

meetingsRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM meetings ORDER BY starts_at ASC')
    res.json(rows.map(toApi))
  } catch (err) {
    next(err)
  }
})

meetingsRouter.post('/', async (req, res, next) => {
  try {
    const { title, startsAt, endsAt, participantIds, isOnline, location } = req.body || {}

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'title é obrigatório' })
    }
    const start = new Date(startsAt)
    const end = new Date(endsAt)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ error: 'startsAt/endsAt inválidos (endsAt deve ser depois de startsAt)' })
    }
    if (!Array.isArray(participantIds) || participantIds.length === 0 || !participantIds.every((p) => typeof p === 'string')) {
      return res.status(400).json({ error: 'participantIds deve ser uma lista não vazia de strings' })
    }

    const id = randomUUID()
    const { rows } = await pool.query(
      `INSERT INTO meetings (id, title, starts_at, ends_at, participant_ids, is_online, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, title.trim(), start, end, participantIds, !!isOnline, location || null]
    )
    res.status(201).json(toApi(rows[0]))
  } catch (err) {
    next(err)
  }
})

meetingsRouter.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM meetings WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'not found' })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
