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
            topic: 'payments',
            fromBeginning: true         //in dev true in prod false !!
        })

        await consumer.run({
            eachMessage: async({topic, partition, message}) => {
                const value = message.value.toString()
                const { userId, cart } = JSON.parse(value)

                const total = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2)

                console.log(`Consumer value: ${userId}, ${cart}, total Price: ${total}`)
            }

        })
    } catch(err){
        console.log(`Consumer analytic connection failed, ${err}`)
    }
     
}
run()


// Nun muss das node enviroment geladen werden mit cd services/analytic-service und npm run dev