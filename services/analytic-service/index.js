/**
 * Node Modules
 */
import { Kafka } from 'kafkajs'

const kafka = new Kafka({
    clientId: 'analytics-service',
    brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'analytics-service' })
const consumerOrder = kafka.consumer({ groupId: 'analytics-service' })

const run = async function() {
    try{
        await consumer.connect()
        
        await consumer.subscribe({
            topics: ['payments', 'orders', 'emails'],
            fromBeginning: true         //in dev true in prod false !!
        })

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString()
        
        switch(topic) {
            case 'payments': {
                const { userId, cart } = JSON.parse(value)
                const total = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2)
                console.log(`Payment: User ${userId}, Total: ${total}`)
                break
            }
            case 'orders': {
                const { userId, orderId, items } = JSON.parse(value)
                console.log(`Order: User ${userId}, Order ${orderId}, Items: ${items.length}`)
                break
            }
            case 'emails': {
                const { userId, emailId, type } = JSON.parse(value)
                console.log(`Email: User ${userId}, Type: ${emailId}`)
                break
            }
            default:
                console.log(`Unknown topic: ${topic}`)
                }
            }
        })
    } catch(err){
        console.log(`Consumer analytic connection failed, ${err}`)
    }
     
}
run()


// Nun muss das node enviroment geladen werden mit cd services/analytic-service und npm run dev