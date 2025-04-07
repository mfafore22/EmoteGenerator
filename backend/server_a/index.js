const WebSocket = require('ws');
const {Kafka} = require('kafkajs');

const kafka = new Kafka({
    clientId: 'server-a',
    brokers: ['kafka:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'server-a-group' });

const server = new WebSocket.Server({ port: 3000});

server.on('connection', socket => {
    console.log('Frontend Connected');

    socket.on('close', () => {
        console.log('Frontend disconnected');
    })
})



const consumesMeaningFulMoments = async () => {
 
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({topic: 'aggregated-emote-data', fromBeginning: true});

    await consumer.run({eachMessage: async ({ topic, partition, message}) => {
        const meaningfulMoment = JSON.parse(message.value.toString());
        console.log('Received meaningful moment:' ,meaningfulMoment);

        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN){
                
                console.log('Sending to client' , meaningfulMoment);
                client.send(JSON.stringify(meaningfulMoment));
            }
        });

        console.log('Broadcasted meaningful moment:', meaningfulMoment);
    },
});

};


consumesMeaningFulMoments().catch(console.error);