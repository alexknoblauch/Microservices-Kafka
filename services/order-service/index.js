/**
 * Node Modules
 */
import { Kafka } from 'kafkajs'
import { redisClient } from '../../lib/redis'
import logger from '../../lib/winston'
import { withRetry } from '../../helpers/withRetry'

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: ['localhost:9092']
})

const producer = kafka.producer()
const consumer = kafka.consumer({groupId: 'order-service' })

const run = async function() {
    try{
        await producer.connect()
        await consumer.connect()
        await redisClient.connect()     // jeder microservice NEU connecten
        await consumer.subscribe({
            topic: 'payments',
            fromBeginning: true         //in dev true in prod false !!
        })

        await consumer.run({
            eachMessage: async({topic, partition, message}) => {
                try {
                    const value = message.value.toString()
                    const { userId, cart, paymentId } = JSON.parse(value)           // paymentId von message.value !!
                    logger.info('Payment event received', {
                        topic,
                        partition,
                        userId,
                        timestamp: new Date().toISOString()
                    });


                    // GUARD CLAUSE FÜR PAYMENT ORDER ID (für keiene 2 order indemopency)
                    const existingOrderId = await redisClient.get(`payment:${paymentId}:order`);
                    if (existingOrderId) {
                        logger.info('Payment already processed - order exists', {
                            paymentId,
                            existingOrderId,
                            userId,
                            offset: message.offset
                        });
                        return; 
                    }


                    //FAKE ORDER ID
                    const orderId = '1223434345' 
                    logger.info('OrderId created', {orderId})
                    await redisClient.setEx(`payment:${paymentId}:order`, 86400, orderId);


                    await withRetry(async () => {
                        await redisClient.setEx(
                                `order:${orderId}:status`,
                                7 * 24 * 60 * 60, // 7 Tage TTL
                                'processing'
                            );
                        logger.info('Reis orderId set', {orderId})
                    }, 3)


                    
                    await withRetry(async () => {
                        await producer.send({
                            topic: 'orders',
                            messages: [
                                { value: JSON.stringify({ userId, orderId })}
                            ]
                        });
                        logger.info('Producer sent orders topic')
                    }, 3)

                } catch (err) {
                    logger.error('Orderservice went wrong', {
                        error: err.message,    
                        stack: err.stack,      
                        topic,
                        partition,
                        offset: message.offset 
                    })
            }
        }})
        
    } catch(err){
        console.log(`Consumer analytic connection failed, ${err}`)
    }
}
run()


// Nun muss das node enviroment geladen werden mit cd services/analytic-service und npm run dev