import express, { Express } from 'express';

import { createServer, Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const port = process.env.PORT_HTTP;

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

enum MultiplayerEvent {
  play = 'play',
  roomChange = 'roomChange',
  roundPlayed = 'roundPlayed',
}

enum Choices {
  ROCK = 'rock',
  PAPER = 'paper',
  SCISSOR = 'scissor',
}

dotenv.config();

const httpServer: Server = createServer();

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

let plays: number = 0;

// eslint-ignore @typescript-eslint/no-unused-vars
io.on('connection', (socket) => {
  const room = socket.handshake['query']['room'] || [''];

  socket.join(room);
  console.log('user joined room #' + room);

  if (io.sockets.adapter.rooms.get(room as string)?.size === 2) {
    console.log('Room #' + room + ' is ready');
    io.to(room).emit(MultiplayerEvent.roomChange, true);
  }

  socket.on('disconnect', function () {
    if (room) {
      socket.leave(room as string);
    }
    console.log('user disconnected from ' + room);
  });

  socket.on(MultiplayerEvent.play, (choice: Choices) => {
    socket.broadcast.to(room).emit(MultiplayerEvent.play, choice);
    console.log('new play !', room, choice);

    plays++;
    if (plays === 2) {
      console.log('resolve game now!!');
      setTimeout(() => {
        io.to(room).emit(MultiplayerEvent.roundPlayed, true);
        plays = 0;
      }, 1000);
    }
  });
});

io.listen(Number(process.env.PORT_RT));
