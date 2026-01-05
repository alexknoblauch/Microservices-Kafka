import { createClient } from 'redis';           // muss dieser import sein!! nur redis

export const redisClient = createClient({
      url: 'redis://localhost:6379'
})

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});


redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});
