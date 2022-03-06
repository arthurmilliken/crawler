export interface PageMeta {
  href: string
  responseUrl?: string
  method: string
  res?: {
    status: number
    statusText: string
    headers: Record<string, string>
  }
  err?: {
    name?: string
    message?: string
    stack?: string
  }
  contentLength?: number
  sha256?: string // in hex format
  timestamp?: number
}
export type PageMetaKey = [href: string, timestamp: number]
