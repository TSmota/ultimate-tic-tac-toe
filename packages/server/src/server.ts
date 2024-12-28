import Fastify from 'fastify';
import fastifyWebSocket from '@fastify/websocket';
import cors from '@fastify/cors';
import mq from 'mqemitter';
import { GameRoomSocketHandler } from './handlers/game-room-socket-handler';
import { RoomState } from './types';

const server = Fastify({
  logger: {
    level: 'info',
  },
});
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

const rooms = new Map<string, RoomState>();

server.register(async function (fastify) {
  fastify.get<RoomConnectRequest>('/socket/:room', { websocket: true }, (socket, req) => {
    new GameRoomSocketHandler(socket, emitter, req.params.room, rooms);
  });

  fastify.get('/api/rooms', () => {
    return Array.from(rooms.values());
  });

  fastify.get<RoomConnectRequest>('/api/rooms/:room', (req) => {
    const room = rooms.get(req.params.room);

    if (!room) {
      return;
    }

    return room;
  });
});

const start = async () => {
  try {
    await server.listen({
      port: process.env.PORT ? Number(process.env.PORT) : 3333,
      host: '0.0.0.0',
    });
  } catch (err) {
    server.log.fatal(err);
    process.exit(1);
  }
};

start();
