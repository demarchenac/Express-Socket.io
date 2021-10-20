import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

export default class SocketClient {
	port;
	socket;

	constructor(user) {
		this.contentFeed = document.getElementById('feed-content');
		this.messageInput = document.getElementById('message');
		this.sendBtn = document.getElementById('send');
		this.socket = null;
		this.user = user;
		this.commands = [];
		this.isWaitingClose = false;
	}

	initialize = () => {
		this.socket = io({
			query: { user: this.user },
		});

		this.socket.on('connect_failed', () => {
			this.socket.close();
			console.log('[INFO] No se pudo establecer conexión!');
		});

		this.socket.on('disconnect', () => {
			console.log('[INFO] Se ha cerrado la conexión!');

			let connectSection = document.getElementById('connection-form');
			let chatSection = document.getElementById('chat');

			chatSection.style.display = 'none';
			connectSection.style.display = 'flex';

			if (!this.isWaitingClose) {
				let errorFeedback = document.getElementById('connect_info');
				let userNameInput = document.getElementById('user');

				errorFeedback.innerText =
					'Sesión cerrada inesperadamente, intente conectarse nuevamente.';
				errorFeedback.className = 'invalid-feedback';
				errorFeedback.style.display = 'block';
				userNameInput.className = 'form-control is-invalid';
			}

			this.isWaitingClose = false;
		});

		this.socket.on('pong', () => {
			console.log('pong!');
			this.addSystemMessage(`<span>pong!</span>`);
		});

		this.socket.on('user-connect', ({ user }) => {
			this.addSystemMessage(`<span>${user}</span> se ha unido`);
		});

		this.socket.on('user-disconnect', ({ user }) => {
			this.addSystemMessage(`<span>${user}</span> se ha desconectado`);
		});

		this.socket.on('server-message', ({ user, message }) => {
			this.addMessage(user, message);
		});

		this.socket.on('connect', () => {
			console.log('[INFO] Socket conectado');

			let btn = document.getElementById('connect');
			let connectSection = document.getElementById('connection-form');
			let chatSection = document.getElementById('chat');
			btn.disabled = false;
			connectSection.className = '';
			connectSection.style.display = 'none';
			chatSection.className = 'row';
			chatSection.style.display = 'flex';

			this.setUpEvents();
			this.registerCommands();
			this.addSystemMessage(
				'Use /ayuda para ver los comandos disponibles.'
			);
		});
	};

	setUpEvents = () => {
		this.messageInput.addEventListener('keypress', e => {
			let key = e.key || e.which || e.keyCode;
			if (key === 'Enter' || key === 13)
				this.sendMessage(this.messageInput.value);
		});

		this.sendBtn.addEventListener('click', () => {
			const message = this.messageInput.value;
			this.sendMessage(message);
		});
	};

	registerCommands = () => {
		this.registerCommand('/ayuda o /help', 'Ver comandos');
		this.registerCommand('/ping', 'Mensaje de estado al servidor');
		this.registerCommand('/salir o /exit', 'Cerrar chat');
	};

	registerCommand = (identifier, description) => {
		this.commands.push({ id: identifier, content: description });
	};

	emit = (command, payload = {}) => {
		if (!Boolean(this.socket)) throw new Error('Socket not initialized');

		this.socket.emit(command, payload);
	};

	close = () => {
		if (!Boolean(this.socket)) throw new Error('Socket not initialized');

		this.socket.emit('close');
	};

	sendMessage = message => {
		const minified = message.toLowerCase().trim();
		if (minified === '/ayuda' || minified === '/help') {
			this.printCommands();
		} else if (minified === '/ping') {
			this.emit('ping');
		} else if (minified === '/salir' || minified === '/exit') {
			this.isWaitingClose = true;
			this.emit('close');
		} else if (minified.length > 0) {
			this.emit('client-message', { message: message });
			this.addMessage(this.user, message, true);
		}

		this.messageInput.value = '';
	};

	addMessage(user, message, sendedByMe = false) {
		let newline = document.createElement('p');

		newline.className = sendedByMe ? 'user' : 'anyone';
		newline.innerHTML = `<span>${user}:</span> ${message}`;

		this.appendMessage(newline);
	}

	printCommands = () => {
		for (const command of this.commands) {
			const message = `Use <span>${command.id}</span> para ${command.content}`;
			this.addSystemMessage(message);
		}
	};

	addSystemMessage(message) {
		let newline = document.createElement('p');

		newline.className = 'system';
		newline.innerHTML = `<i>${message}</i>`;

		this.appendMessage(newline);
	}

	appendMessage(node) {
		if (this.contentFeed.childNodes.length > 50) {
			this.contentFeed.removeChild(this.contentFeed.childNodes[0]);
		}
		this.contentFeed.appendChild(node);
	}
}
