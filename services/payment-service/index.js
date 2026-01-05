/**
 * Node Modules
*/
import express from 'express'
import cors from 'cors'
import { Kafka } from 'kafkajs'
import { connectToKafka } from '../kafka/helpers/connectToKafka'
import { v4 as uuidv4 } from 'uuid';
import { withRetry } from '../../helpers/withRetry';
import logger from '../../lib/winston';


//
//KAFKA
const kafka = new Kafka({
    clientId: 'payment-service',
    brokers: ['localhost:9092']
})
const producer = kafka.producer()


//
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
    const paymentId = uuidv4()

    //TODO: STRIPE

    // KAFKA
    try{
        await withRetry(async () => {
           await producer.send({
                topic: 'payments',                       // sends message to paymnets Topic in Kafka
                messages: [
                    {value: JSON.stringify({ cart, userId, paymentId })}
                ]
            })
        }, 3)
        return res.status(200).send('payment successfull')

    } catch(err){
        logger.error('Payment Producer failed', {
            err,
            cart, 
            userId, 
            paymentId
        })

        return res.status(500).json({
            success: false,
            error: 'PAYMENT_PROCESSING_FAILED',  
            message: 'Payment could not be processed. Please try again.',
            paymentId: paymentId,                 
            timestamp: new Date().toISOString()
        })
    }
})

app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err.message)
})

app.listen(8000, () => {
    connectToKafka(producer)                            //KAFKA Connection WICHTIG !!
    console.log('app listenig at port 800')
})