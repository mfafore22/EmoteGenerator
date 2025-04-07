const express = require('express');
const {Kafka} = require('kafkajs');

const app = express();
const port = 3000;

const kafka = new Kafka({ clientId: 'server_b' , brokers: ['kafka:9092']});

const consumer = kafka.consumer({ groupId: 'server_b'});
const producer = kafka.producer();

let threshold = 5;
let allowedEmotes = ['❤️', '👍', '😢', '😡'];
const windowSize = 10000;
let emoteWindow = [];

async function processMessages(){
    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({ topic: 'raw-emote-data'});

    await consumer.run({
      eachMessage: async ({ message}) => {
        const data = JSON.parse(message.value.toString());
        const now = Date.now();

        emoteWindow.push({ ...data, ts:now});

        emoteWindow = emoteWindow.filter(msg => now - msg.ts <= windowSize);

        const counts = {};
        for(let msg of emoteWindow){
            if(allowedEmotes.includes(msg.emote)){
                counts[msg.emote] = (counts[msg.emote] || 0) + 1;
            }
        }

        for (const [emote, count] of Object.entries(counts)){
            if (count >= threshold){
                const moment = {emote, count, timestamp: new Date().toISOString()};
                await producer.send({topic: 'aggregated-emote-data', messages: [{ value: JSON.stringify(moment) }] });
                console.log('Meaningful moment:', moment);

                emoteWindow = [];                  
            }
        }
      }  
    });
}

app.use(express.json());

app.get('/threshold' , (req,res) => res.json({ threshold}));
app.post('/threshold', (req,res) => {
    threshold = req.body.threshold;
    res.json({threshold});
});

app.get('/allowed-emotes', (req,res) => res.json({ allowedEmotes}));
app.post('/allowed-emotes', (req,res) => {
    allowedEmotes = req.body.emotes;
    res.json({allowedEmotes});
});

app.listen(port, () => {
    console.log(`Server B listening at http://localhost:${port}`);
    processMessages();
});