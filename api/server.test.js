const request = require('supertest')
const server = require('./server')
const db = require('../data/dbConfig')

const Sterl = { username: 'Sterling', password: '1234' }
const Shayne = { username: 'Shayne', password: '1234' }

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})

// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})

describe('endpoints', () => {
  describe('[POST] /api/auth/register', () => {
    it('New user can register with valid credentials, and is returned their credentials', async () => {
      const res = await request(server).post('/auth/register').send(Sterl)
      // console.log(res)
      expect(res.body.id).toBe(1)
      expect(res.body.username).toBe('Sterling')
      expect(res.body).toHaveProperty('password')
    })
    it('If username or password are missing, returns message "username and password required"', async () => {
      const res = await request(server).post('/auth/register').send({ username: 'Sterling' })
      expect(res.body).toBe('username and password required')
    })
    it('If username is taken, returns message "username taken"', async () => {
      await request(server).post('/auth/register').send(Sterl)
      const res = await request(server).post('/auth/register').send(Sterl)
      expect(res.body).toBe('username taken')
    })
  })
})