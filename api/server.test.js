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
      const res = await request(server).post('/api/auth/register').send(Sterl)
      expect(res.body.id).toBe(1)
      expect(res.body.username).toBe('Sterling')
      expect(res.body).toHaveProperty('password')
    })
    it('If username or password are missing, returns message "username and password required"', async () => {
      const res = await request(server).post('/api/auth/register').send({ username: 'Sterling' })
      expect(res.body).toBe('username and password required')
    })
    it('If username is taken, returns message "username taken"', async () => {
      await request(server).post('/api/auth/register').send(Sterl)
      const res = await request(server).post('/api/auth/register').send(Sterl)
      expect(res.body).toBe('username taken')
    })
  })
  describe('[POST] /api/auth/login', () => {
    it('Registered user can login with valid credentials, and is returned a message with their token', async () => {
      await request(server).post('/api/auth/register').send(Shayne)
      const res = await request(server).post('/api/auth/login').send(Shayne)
      expect(res.body).toHaveProperty('message')
      expect(res.body).toHaveProperty('token')
    })
    it('Unregistered user gets message "invalid credentials"', async () => {
      const res = await request(server).post('/api/auth/login').send(Shayne)
      expect(res.body).toBe('invalid credentials')
    })
    it('User with inadequate credentials gets message "username and password required"', async () => {
      const res = await request(server).post('/api/auth/login').send({ username: 'Sterling' })
      expect(res.body).toBe('username and password required')
    })
  })
  describe('[GET] /api/jokes', () => {
    it('Logged in user can access jokes', async () => {
      await request(server).post('/api/auth/register').send(Shayne)
      const res = await request(server).post('/api/auth/login').send(Shayne)
      const getRes = await request(server).get('/api/jokes').set('authorization', res.body.token)
      expect(getRes.body.length).toBe(3)
    })
    it('Not logged in user can not access jokes, gets message "token required"', async () => {
      const res = await request(server).get('/api/jokes')
      expect(res.body).toBe('token required')
    })
    it('invalid token responds with message "token invalid"', async () => {
      const res = await request(server).get('/api/jokes').set('authorization', '123ABC123')
      expect(res.body).toBe('token invalid')
    })
  })
})

