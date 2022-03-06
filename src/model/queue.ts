import { Database, Key, RootDatabase, ABORT, DatabaseOptions } from 'lmdb'

export type seconds = number
export type hours = number

/** Epoch milliseconds */
export type timestamp = number

export const DEFAULT_QUEUE_NAME = 'queue'
export const DEFAULT_VISIBILITY_TIMEOUT_SECS: seconds = 60 // six minutes
export const DEFAULT_MAX_RECEIVES = 3
export const DEFAULT_MAX_RETENTION_HOURS: hours = 72 // three days

export interface Message {
  id: number
  enqueued: timestamp
  received: timestamp
  numReceives: number
  body: unknown
  dedupKey?: string
}

export interface QueueOptions {
  /** The name used for the queue database. Default "queue" */
  name?: string
  /** Messages will be deleted from the queue if not received within this time. Default 72 */
  maxRetentionHours?: number
  /** If true, a received message will not be deleted from until it is passed to queue.ack(). Default true */
  requireAck?: boolean
  /** Amount of time a received message is considered "in-flight" and cannot be re-sent. Default 360 (six minutes)*/
  visibilityTimeout?: seconds
  /** Maximum number of times to re-send a message before moving it to Deadletter queue */
  maxReceives?: number
  /** If true, then messages sent without a dedupeKey will use message content for deduplication */
  dedupByContent?: boolean
}

type QueueConfig = Required<QueueOptions>

export const defaultConfig: QueueConfig = {
  name: DEFAULT_QUEUE_NAME,
  maxRetentionHours: DEFAULT_MAX_RETENTION_HOURS,
  requireAck: true,
  visibilityTimeout: DEFAULT_VISIBILITY_TIMEOUT_SECS,
  maxReceives: DEFAULT_MAX_RECEIVES,
  dedupByContent: false,
}

/**
 * LMDB Implementation of a persistent work queue (similar to Amazon SQS),
 * which will preserve data between shutdowns and crashes.
 *
 * A received messaged must be acknowleged by calling queue.ack(), unless
 * `requireAck` is set to false. Messages which are not successfully
 * acknowledged are automatically sent to an internal deadletter queue.
 *
 * The queue will automatically deduplicate messages by content if
 * `dedupeByContent=true`. When a message successfully processed with an
 * ack(), it is removed from the deduplication index.
 *
 * Template types:
 * - V: type for message payload
 * - K: type for deduplication key (assumed to be V if `dedupeByContent=true`)
 */
export class Queue<V = any, K extends Key = Key> {
  config: QueueConfig
  db: RootDatabase
  queue: Database<V, [string | number, K]>

  constructor(db: RootDatabase, options?: QueueOptions) {
    this.config = Object.assign({}, defaultConfig, options)
    this.db = db
    this.queue = db.openDB({
      name: this.config.name,
      compression: true,
      useVersions: true,
      sharedStructuresKey: Symbol.for('structures'),
      encoding: this.config.dedupByContent ? 'ordered-binary' : 'msgpack',
    })
  }

  /** Send a message to the queue.
   * Resolve to false if message is a duplicate */
  async send(body: V, dedupKey?: K): Promise<boolean> {
    // Deduplicate message
    // Determine message id
    // Build Message object
    // Enqueue message
    throw new Error('not implemented')
  }

  /** Resolve to null if there are no valid messages in the queue */
  async receive(): Promise<(Message & { body: V }) | null> {
    throw new Error('not implemented')
  }

  /** Resolve to null if there are no valid messages in Deadletter queue */
  async receiveDeadletter(): Promise<(Message & { body: V }) | null> {
    throw new Error('not implmemented')
  }

  /** Resolve to false if message already acknowleged/rejected */
  async ack(message: Message): Promise<boolean> {
    throw new Error('not implemented')
  }

  /**
   * Remove message from queue and place into Deadletter queue.
   * Resolve to false if message already acknowleged/rejected
   */
  async reject(message: Message): Promise<boolean> {
    throw new Error('not implemented')
  }

  /**
   * Remove all messages from queue.
   * Resolve to number of messages purged.
   */
  async purge(): Promise<number> {
    throw new Error('not implemented')
  }

  /**
   * Remove all messages from deadletter queue.
   * Resolve to number of messages purged.
   */
  async purgeDeadletter(): Promise<number> {
    throw new Error('not implemented')
  }
}
