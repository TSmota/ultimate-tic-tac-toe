import Fastify from 'fastify';
import fastifyWebSocket from '@fastify/websocket';
import cors from '@fastify/cors';

const server = Fastify();

server.register(cors, {
    origin: '*',
});

server.register(fastifyWebSocket);

server.register(async function (fastify) {
    fastify.get('/', { websocket: true }, (socket, req) => {
        socket.on('message', message => {
            broadcastMessage(message.toString())
        })
    })
})

function broadcastMessage(message: string) {
    server.websocketServer.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

server.listen({
    port: process.env.PORT ? parseInt(process.env.PORT) : 3333,
    host: '0.0.0.0'
}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server listening at: ${address}`);
});
