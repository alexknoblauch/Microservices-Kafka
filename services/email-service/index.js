/**
 * Node Modules
 */
import { Kafka } from 'kafkajs'
import { redisClient } from '../../lib/redis'
import logger from '../../lib/winston'

const kafka = new Kafka({
    clientId: 'email-service',
    brokers: ['localhost:9092']
})

const producer = kafka.producer()
const consumer = kafka.consumer({groupId: 'email-service' })

const run = async function() {
    try{
        await producer.connect()
        await consumer.connect()
        await consumer.subscribe({
            topic: 'orders',
            fromBeginning: true         //in dev true in prod false !!
        })


        await consumer.run({
            eachMessage: async({topic, partition, message}) => {
                try{
                    const value = message.value?.toString()
                    const { userId, orderId } = JSON.parse(value)               // orderID von message.value!!
                    
                    const emailExists = await redisClient.get(`order:${orderId}:email:sent`);     //SATZ erstellen email ID sent
                    if(emailExists) return
                    
                    //TODO: Send email to User
                    const emailId = '1223434345'
                    
                    await producer.send({
                        topic: 'emails',
                        messages: [
                            { value: JSON.stringify({ userId, emailId })}
                        ]
                    })

                    await redisClient.setEx(`order:${orderId}:email:sent`, 86400, orderId)
                } catch(err) {
                    logger.error({
                        message: 'Email Consumer run failed',
                        topic,
                        partition,
                        error: err.message
                    })
                }
            } 
        })
    } catch(err){
        console.log(`Consumer analytic connection failed, ${err}`)
    }
     
}
run()


// Nun muss das node enviroment geladen werden mit cd services/analytic-service und npm run dev