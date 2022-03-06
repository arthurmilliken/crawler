import axios from 'axios'
import { writeFile, mkdir } from 'fs/promises'
import * as path from 'path'
import { getLogger } from './logger'
import { CrawlerDatabase } from './model/db'
import { open, Database, RootDatabase, ABORT } from 'lmdb'

const href = 'https://example.com/'
const log = getLogger()

export async function main() {
  try {
    const res = await axios.get(href, { responseType: 'arraybuffer' })
    log.info({ res })
    const data: Buffer = res.data

    const url = new URL(href)
    const pathname = url.pathname + url.pathname.endsWith('/') ? '!index' : ''
    const save = path.resolve(path.join('.ignore', url.hostname, pathname))

    await mkdir(path.dirname(save), { recursive: true })

    await writeFile(save, data, 'binary')
    log.info({ url, pathname, save }, 'saved')
    if (res.headers['content-type'].startsWith('text/')) {
      const text = data.toString('utf8')
      console.log(text)
    }
  } catch (err) {
    log.error({ err })
  }
}

export async function main2() {
  const db = open({ path: '.db' })
  await db.put('a', 'apple')
  await db.put('b', 'banana')

  const result = await db.transactionSync(() => {
    db.put('a', 'another')
    db.put('b', 'biscuit')
    const a = db.get('a')
    const b = db.get('b')
    log.info({ a, b }, 'before ABORT')
    return ABORT
  })

  await db.committed

  const a = db.get('a')
  const b = db.get('b')

  log.info({ a, b, result }, 'before db.drop()')

  await db.clearAsync()
}

main2()
