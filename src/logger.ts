import { AxiosError, AxiosResponse } from 'axios'
import * as bunyan from 'bunyan'
import { APP_NAME, LOG_PATH, LOG_LEVEL } from './config'

export interface LoggerConfig {
  appName: string
  logLevel: bunyan.LogLevel
  logPath: string
}

const defaultConfig: LoggerConfig = {
  appName: APP_NAME,
  logLevel: LOG_LEVEL,
  logPath: LOG_PATH,
}

const loggerConfig: LoggerConfig = Object.assign({}, defaultConfig)

export const configureLogger = (config: LoggerConfig): bunyan => {
  Object.assign(loggerConfig, config)
  return getLogger()
}

export let log: bunyan

export function getLogger(): bunyan {
  if (!log) {
    log = bunyan.createLogger({
      name: loggerConfig.appName,
      src: true,
      serializers: {
        err: serializeError,
        res: serializeResponse,
      },
      streams: [
        {
          level: loggerConfig.logLevel,
          stream: process.stdout,
        },
        {
          level: loggerConfig.logLevel,
          path: loggerConfig.logPath,
        },
      ],
    })
  }
  return log
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function childLogger(options: Record<string, any>): bunyan {
  return log.child(options)
}

const serializeResponse = (res: AxiosResponse): unknown => {
  if (res.config && res.status && res.statusText && res.headers) {
    return {
      statusCode: res.status,
      statusText: res.statusText,
      headers: res.headers,
      request: {
        method: res.config.method,
        url: res.config.url,
        headers: res.config.headers,
      },
      responseUrl: res.request.res.responseUrl,
    }
  } else return res
}

const serializeError = (err: Error): unknown => {
  if ((err as AxiosError).response) {
    return {
      message: err.message,
      name: err.name,
      stack: err.stack,
      response: serializeResponse(
        (err as AxiosError).response as AxiosResponse
      ),
    }
  } else return bunyan.stdSerializers.err(err)
}
