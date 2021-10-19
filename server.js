import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import CONFIG from './constants/config.json';

const PORT = CONFIG.PORT || 3001;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

let users = {};
let sockets = {};

io.on('connection', socket => {
	const { user } = socket.handshake.query;
	const session = {
		id: socket.id,
		user: user,
	};

	const userExists = Boolean(users[session.user]);
	if (userExists && users[session.user] !== session.id) {
		console.log(
			`[INFO] Sesión para el usuario ${session.user} ya existente! Cerrando conexión...`
		);

		users[session.id] = null;
		users[session.user] = null;
		socket.disconnect();
	} else {
		console.log(`[INFO] Se ha conectado el usuario ${session.user}!`);
		users[session.user] = session.id;
		sockets[session.id] = socket;
	}

	socket.on('ping', () => {
		socket.emit('pong');
	});

	socket.on('disconnect', () => {
		console.log(`[INFO] El usuario ${session.user} se ha desconectado.`);
	});

	socket.on('close', () => {
		users[session.id] = null;
		users[session.user] = null;
		socket.disconnect();
	});

	socket.on('client-message', ({ message }) => {
		console.log(`[INFO] ${session.user} enviado un mensaje!`);

		socket.broadcast.emit('server-message', {
			user: session.user,
			message: message,
		});
	});
});

httpServer.listen(PORT, () =>
	console.log(`Sevidor esperando por peticiones en localhost:${PORT}`)
);
