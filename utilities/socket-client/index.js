import { io } from 'socket.io-client';

import CONFIG from '../../constants/config.json';
import CLI from '../command-line-interface';

class SocketClient {
	port;
	socket;

	constructor(user) {
		this.socket = null;
		this.port = CONFIG.PORT || 3001;
		this.user = user;
	}

	initialize = async () =>
		new Promise(resolve => {
			this.socket = io(`http://localhost:${this.port}`, {
				query: { user: this.user },
			});

			this.socket.on('connect_failed', () => {
				this.socket.close();
				console.log('[INFO] No se pudo establecer conexión!');
			});

			this.socket.on('disconnect', () => {
				console.log('[INFO] Se ha cerrado la conexión!');
			});

			this.socket.on('server-message', ({ user, message }) => {
				console.log(`\n${user}> ${message}`);
			});

			this.socket.on('connect', () => {
				console.log('[INFO] Socket conectado'); // x8WIv7-mJelg7on_ALbx
				resolve();
			});
		});

	emit = (command, payload = {}) => {
		if (!Boolean(this.socket)) throw new Error('Socket not initialized');

		this.socket.emit(command, payload);
	};

	close = () => {
		if (!Boolean(this.socket)) throw new Error('Socket not initialized');

		this.socket.emit('close');
	};

	sendMessage = message => {
		this.emit('client-message', { message: message });
	};
}

export default SocketClient;
