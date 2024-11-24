import Fastify from 'fastify';
import fastifyWebSocket from '@fastify/websocket';
import cors from '@fastify/cors';
import mq from 'mqemitter';
import { GameRoomSocketHandler } from './handlers/game-room-socket-handler';

const server = Fastify();
const emitter = mq();

server.register(cors, {
  origin: '*',
});

server.register(fastifyWebSocket);

type RoomConnectRequest = {
  Params: {
    room: string;
  };
};

server.register(async function (fastify) {
  fastify.get<RoomConnectRequest>('/socket/:room', { websocket: true }, (socket, req) => {
    new GameRoomSocketHandler(socket, emitter, req.params.room);
  });
});

const start = async () => {
  try {
    const address = await server.listen({
      port: process.env.PORT ? parseInt(process.env.PORT) : 3333,
      host: '0.0.0.0',
    });

    console.log(`Server listening at: ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
