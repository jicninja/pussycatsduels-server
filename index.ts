import express, { type Express, type Request, type Response } from 'express';
import { createServer, Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const httpServer: Server = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// eslint-ignore @typescript-eslint/no-unused-vars
io.on('connection', (socket) => {
  console.log('socket--->', socket);
});

io.listen(Number(port));
