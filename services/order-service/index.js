/**
 * Node Modules
 */
import { Kafka } from 'kafkajs'

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
        await consumer.subscribe({
            topic: 'payments',
            fromBeginning: true         //in dev true in prod false !!
        })

        await consumer.run({
            eachMessage: async({topic, partition, message}) => {
                const value = message.value.toString()
                const { userId, cart } = JSON.parse(value)

            //TODO: Create a new Order in DB
            const orderId = '1223434345'

            await producer.send({
                topic: 'orders',
                messages: [
                    { value: JSON.stringify(userId, orderId)}
                ]
            })

            }

        })
    } catch(err){
        console.log(`Consumer analytic connection failed, ${err}`)
    }
     
}
run()


// Nun muss das node enviroment geladen werden mit cd services/analytic-service und npm run dev