import pino from 'pino';

const logger = pino({
  level: `${process.env.LOG_LEVEL}` || `info`, // log level for development
  transport: {
    target: 'pino-pretty'
  }
  })

export default logger;