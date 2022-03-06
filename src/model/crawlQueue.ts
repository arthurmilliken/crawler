import { Database } from 'lmdb'
import { childLogger } from '../logger'
const log = childLogger({ module: 'crawlQueue' })

const VISIBILITY_TIMEOUT_SECS = 360 // six minutes
const MAX_RECEIVES = 3

const KEY_FIRST_ID = '!FIRST_ID'
const KEY_LAST_ID = '!LAST_ID'
const EXISTS = 1

export type CrawlQueueKey = number | string
export type CrawlQueueValue = CrawlTask | number | undefined

export interface CrawlTask {
  id: number
  sent: number // "sent to queue" - timestamp
  received: number // "received from queue" - timestamp
  receiveCount: number
  body: {
    url: string
  }
}

export class CrawlQueue {
  db: Database<CrawlQueueValue, CrawlQueueKey>
  constructor(db: Database<CrawlQueueValue, CrawlQueueKey>) {
    this.db = db
  }

  getFirstId(): number {
    return (this.db.get(KEY_FIRST_ID) as number | undefined) || 0
  }

  getLastId(): number {
    return (this.db.get(KEY_LAST_ID) as number | undefined) || 0
  }

  async send(url: string): Promise<boolean> {
    const parsed = new URL(url) // throw if cannot parse
    const href = parsed.origin + parsed.pathname // ignore search and hash
    try {
      // open transaction
      return await this.db.transactionSync(() => {
        // check for duplicate
        const dedupeKey = `URL!${href}`
        if (this.db.get(dedupeKey)) {
          return false
          // throw new Error(`duplicate url: ${href}`);
        }
        // calculate id
        const id = this.getLastId() + 1
        // enqueue task
        const task = {
          id,
          sent: Date.now(),
          received: 0,
          receiveCount: 0,
          body: {
            url: href,
          },
        }
        this.db.put(id, task)
        this.db.put(KEY_LAST_ID, id)
        this.db.put(dedupeKey, EXISTS)
        return true
      })
    } catch (err) {
      const error: Error = err as Error
      if (error.message?.startsWith('duplicate url:')) {
        log.debug(error.message)
        return false
      }
      throw err
    }
  }

  async receive(): Promise<CrawlTask | null> {
    return null
    const range = this.db.getRange({
      start: this.getFirstId(),
      end: Number.MAX_SAFE_INTEGER,
      limit: 1,
    }).asArray
    if (range.length === 0) return null
  }
}
