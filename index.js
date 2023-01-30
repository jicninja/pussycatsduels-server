"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT_HTTP;
app.use(express_1.default.static('public'));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
var MultiplayerEvent;
(function (MultiplayerEvent) {
    MultiplayerEvent["play"] = "play";
    MultiplayerEvent["roomChange"] = "roomChange";
    MultiplayerEvent["roundPlayed"] = "roundPlayed";
})(MultiplayerEvent || (MultiplayerEvent = {}));
var Choices;
(function (Choices) {
    Choices["ROCK"] = "rock";
    Choices["PAPER"] = "paper";
    Choices["SCISSOR"] = "scissor";
})(Choices || (Choices = {}));
dotenv_1.default.config();
const httpServer = (0, http_1.createServer)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
    },
});
let plays = 0;
// eslint-ignore @typescript-eslint/no-unused-vars
io.on('connection', (socket) => {
    var _a;
    const room = socket.handshake['query']['room'] || [''];
    socket.join(room);
    console.log('user joined room #' + room);
    if (((_a = io.sockets.adapter.rooms.get(room)) === null || _a === void 0 ? void 0 : _a.size) === 2) {
        console.log('Room #' + room + ' is ready');
        io.to(room).emit(MultiplayerEvent.roomChange, true);
    }
    socket.on('disconnect', function () {
        if (room) {
            socket.leave(room);
        }
        console.log('user disconnected from ' + room);
    });
    socket.on(MultiplayerEvent.play, (choice) => {
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
