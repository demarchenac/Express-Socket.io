import { Server } from 'socket.io';

let users = {};
let sockets = {};

export const reset = () => {
	for (const user of Object.keys(sockets)) {
		sockets[user].disconnect();
	}
	users = {};
	sockets = {};
};

export const configureSocketSever = httpServer => {
	const io = new Server(httpServer);

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
			socket.broadcast.emit('user-connect', {
				user: session.user,
			});
		}

		console.table(users);

		socket.on('ping', () => {
			socket.emit('pong');
		});

		socket.on('disconnect', () => {
			console.log(
				`[INFO] El usuario ${session.user} se ha desconectado.`
			);

			console.table(users);
		});

		socket.on('close', () => {
			users[session.id] = null;
			users[session.user] = null;

			socket.broadcast.emit('user-disconnect', {
				user: session.user,
			});
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
};

export { users, sockets };
