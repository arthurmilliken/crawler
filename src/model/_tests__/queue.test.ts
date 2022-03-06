import { Database, open, RootDatabase } from 'lmdb'
import { defaultConfig, Queue, QueueOptions } from '../queue'

describe('Queue', () => {
  let rootDb: RootDatabase
  beforeEach(async () => {
    // set up database
    rootDb = open({ path: '.db' })
    await rootDb.clearAsync()
  })
  afterEach(async () => {
    // tear down database
    await rootDb.clearAsync()
    rootDb.close()
  })
  describe('constructor', () => {
    it('correctly builds config', async () => {
      const opts: QueueOptions = {
        name: 'expected-name',
        maxRetentionHours: 100,
        requireAck: false,
        visibilityTimeout: 20,
        maxReceives: 3,
        dedupByContent: true,
      }
      const q = new Queue(rootDb, opts)
      expect(q.config).toStrictEqual(opts)
      await q.queue.drop()
    })
    it('correctly assigns default config values', async () => {
      const q = new Queue(rootDb)
      expect(q.config).toStrictEqual(defaultConfig)
      await q.queue.drop()
    })
    it('opens a table for the queue', async () => {
      const q = new Queue(rootDb)
      expect(q.queue).toBeInstanceOf(Database)
      await q.queue.drop()
    })
  })
  describe('send', () => {
    it.todo('returns false if message is duplicate and does not enqueue')
    it.todo('autoincrements message id')
    it.todo('correctly builds and enqueues message')
  })
  describe('receive', () => {
    it.todo('returns first message in queue')
    it.todo('deletes message if requireAck not set')
    it.todo('skips messages in flight')
    it.todo('correctly increments numReceives and received')
    it.todo('moves dead messages to deadletter queue')
    it.todo('returns null if no valid messages are in queue')
  })
  describe('receiveDeadletter', () => {
    it.todo('returns first message in queue')
    it.todo('skips messages in flight')
    it.todo('correctly increments numReceives and received')
    it.todo('returns null if no valid messages are in queue')
  })
  describe('ack', () => {
    it.todo('deletes message from queue')
    it.todo('removes message from dedup index')
    it.todo('resolves to false and aborts if message already acknowleged')
    it.todo('resolves to false and aborts if message already rejected')
  })
  describe('reject', () => {
    describe('when normal message', () => {
      it.todo('moves message to deadletter queue')
      it.todo('does not remove message from dedup index')
      it.todo('resolves to false and aborts if message already acknowleged')
      it.todo('resolves to false and aborts if message already rejected')
    })
    it.todo('when deadletter message', () => {
      it.todo('deletes message from deadletter queue')
      it.todo('removes message from dedup index')
      it.todo('resolves to false and aborts if message already acknowleged')
      it.todo('resolves to false and aborts if message already rejected')
    })
  })
})
