/**
 * Node Modules
 */
import { Kafka } from 'kafkajs'

const kafka = new Kafka({
    clientId: 'analytics-service',
    brokers: ['localhost:9092']
})

const consumer = kafka.consumer({groupId: 'analytics-service' })

const run = async function() {
    try{
        await consumer.connect()
        await consumer.subscribe({
            topic: 'payment',
            fromBeginning: true         //in dev true in prod false !!
        })

        await consumer.run({
            eachMessage: async({topic, partition, message}) => {
                const value = message.value.toString()
                const { userId, cart } = JSON.parse(value)
                console.log(`Consumer value: ${userId}, ${cart}`)
            }

        })
    } catch(err){
        console.log(`Consumer analytic connection failed, ${err}`)
    }
     
}
run()
