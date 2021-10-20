import SocketClient from './client.js';

class Client {
	constructor() {
		let btn = document.getElementById('connect');
		let userNameInput = document.getElementById('user');

		btn.onclick = () => {
			this.startChat(userNameInput.value);
		};

		userNameInput.addEventListener('paste', event => {
			event.preventDefault();
		});

		userNameInput.addEventListener('keypress', e => {
			let key = e.key || e.which || e.keyCode;

			if (key === 'Enter' || key === 13) {
				this.startChat(userNameInput.value);
			}
		});
	}

	startChat(user) {
		let errorFeedback = document.getElementById('connect_info');
		let userNameInput = document.getElementById('user');

		if (user.length === 0) {
			errorFeedback.innerText = '';
			errorFeedback.className = '';
			errorFeedback.style.display = 'none';
			userNameInput.className = 'form-control';
			return;
		}
		if (user.length < 3) {
			errorFeedback.innerText =
				'El usuario ha de contener mínimo 3 caracteres.';
			errorFeedback.className = 'invalid-feedback';
			errorFeedback.style.display = 'block';
			userNameInput.className = 'form-control is-invalid';
			return;
		}

		let btn = document.getElementById('connect');

		btn.disabled = true;
		const client = new SocketClient(user);
		client.initialize();
	}
}

window.onload = () => {
	new Client();
};
