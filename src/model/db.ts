import { open, Database, RootDatabase } from 'lmdb'
import { CrawlQueue } from './crawlQueue'
import { PageMeta, PageMetaKey } from './pageMeta'

const DB_PATH = '.db'

export class CrawlerDatabase {
  rootDb: RootDatabase<string, string>
  crawlQueue: CrawlQueue
  pageMeta: Database<PageMeta, PageMetaKey>

  constructor() {
    const dbParams = {
      compression: true,
      useVersions: true,
      sharedStructuresKey: Symbol.for('structures'),
    }

    this.rootDb = open({
      path: '.db',
      ...dbParams,
    })
    this.crawlQueue = new CrawlQueue(this.rootDb.openDB('crawlQueue', dbParams))
    this.pageMeta = this.rootDb.openDB('pageMeta', dbParams)
  }

  getStats() {
    return {
      rootDb: this.rootDb.getStats(),
      crawlQueue: this.crawlQueue.db.getStats(),
      pageMeta: this.pageMeta.getStats(),
    }
  }
}
