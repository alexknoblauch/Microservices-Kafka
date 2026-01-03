/**
 * Node Modules
*/
import express from 'express'
import cors from 'cors'
import { Kafka } from 'kafkajs'

const kafka = new Kafka({
    clientId: 'payment-service',
    brokers: ['localhost:9092', 'localhost:9093']
})

const producer = kafka.producer()

const connectKafka = async function(){
    try{
        await producer.connect()
        console.log('Payment Producer conneted')
    }catch(err){
        console.log(`Kafka connection failer, ${err}`)
    }
}

const app = express()

app.use(cors({
    origin:'http://localhost:3000'
}))

app.post('/payment-service', async (req, res) => {
    const {cart} = req.body
    // ASSUME THAT WE GET THE COOKIE AND BCRYPTED USERID

    const userId = '123'

    //TODO: STRIPE

    // KAFKA
    await producer.send({
        topic: 'payments',
        messages: [{
            value: JSON.stringify({
                eventType: 'payment-successful',  
                userId: userId,
                cart: cart
            })
        }]
    });

    return res.status(200).send('payment successfull')
})

app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err.message)
})

app.listen(8000, () => {
    connectKafka()
    console.log('app listenig at port 800')
})