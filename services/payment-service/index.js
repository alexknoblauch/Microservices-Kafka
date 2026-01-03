/**
 * Node Modules
*/
import express from 'express'
import cors from 'cors'
import { Kafka } from 'kafkajs'
import { connectToKafka } from '../kafka/helpers/connectToKafka'

//KAFKA
const kafka = new Kafka({
    clientId: 'payment-service',
    brokers: ['localhost:9092', 'localhost:9093']
})
const producer = kafka.producer()


//APP
const app = express()

app.use(cors({
    origin:'http://localhost:3000'
}))

app.use(express.json())

app.post('/payment-service', async (req, res) => {
    const {cart} = req.body
    // ASSUME THAT WE GET THE COOKIE AND BCRYPTED USERID

    const userId = '123'

    //TODO: STRIPE

    // KAFKA
    producer.send({
        topic: 'payments'
    })

    return res.status(200).send('payment successfull')
})

app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err.message)
})

app.listen(8000, () => {
    connectToKafka(producer)                            //KAFKA Connection WICHTIG !!
    console.log('app listenig at port 800')
})