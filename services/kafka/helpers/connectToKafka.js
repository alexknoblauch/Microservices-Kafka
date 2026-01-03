export const connectToKafka = async function(kafkaClient){
    try{
        await kafkaClient.connect()
        console.log('Payment Producer conneted')
    }catch(err){
        console.log(`Kafka connection failer, ${err}`)
    }
}
