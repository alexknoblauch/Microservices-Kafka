/**
 * Node Modules
 */
import { Kafka } from 'kafkajs'

const kafka = new Kafka({
    clientId: 'kafka-service',
    brokers: ['localhost:9092', 'localhost:9093']
})

const admin = kafka.admin()

const myTopics = ['orders', 'payments', 'emails', 'analythics']

async function createTopicsFromList(topicNames) {
    await admin.connect()
    
    await admin.createTopics({
        topics: topicNames.map(topicName => ({
            topic: topicName,
            numPartitions: 1,
            replicationFactor: 1
        }))
    })
    console.log('🎉 Topics created successfully!');

    
    await admin.disconnect()
}

// Aufrufen
createTopicsFromList(myTopics)
