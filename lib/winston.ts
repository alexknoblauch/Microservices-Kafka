/**
 * Node Modules
 */
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

/**
 * Node Modules
 */
import config from '../config'
import { asyncLocalStorageInstance } from '@/utils/correlationStore';

const { combine, timestamp, json, errors, align, printf, colorize } = winston.format;

const correlationIdFormat = winston.format((info) => {
  const correlationId = asyncLocalStorageInstance.getStore() as string;
  
  if (!correlationId) {
    info.correlationId = 'N/A';
  } else {
    info.correlationId = correlationId
  }
  return info;
});

const transports: winston.transport[] = [];                       //LOKI for centraliezd log files. winstown würde sosnt in jedem server ein logifle abelgen

if (config.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(
        correlationIdFormat(),
        colorize({ all: true }),                                    // Farben aktivieren
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),               // Zeitformat
        align(),                                                    // schön ausgerichtet
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr =
            Object.keys(meta).length > 0
              ? "\n" + JSON.stringify(meta, null, 2)
              : "";
          return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
        })
      ),
    })
  );
}


//LOG ROTATION in production mit DailyRotatFile: npm install winston-daily-rotate-file
if (config.NODE_ENV === "production") {
  transports.push(
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',                                                        // Log Level
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      format: combine(correlationIdFormat(), timestamp(), json())           //CorrelationID
    })
  );

  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',                                                       //Log Level
      maxSize: '10m',
      maxFiles: '30d',      
      zippedArchive: true,
      format: combine(correlationIdFormat(), timestamp(), json())           //CorrelationID
    })
  )

  transports.push(
    new DailyRotateFile({
      filename: 'logs/warn-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'warn',                                                    //Log Level
      maxSize: '10m',
      maxFiles: '30d',
      format: combine(correlationIdFormat(), timestamp(), json())       //CorrelationID
    })
  )
}

const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',                                      //Fallback hier wichtig
  transports,
  silent: config.NODE_ENV === 'test'
});

export default logger; 
