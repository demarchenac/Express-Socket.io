import CLI from './utilities/command-line-interface';
import SocketClient from './utilities/socket-client';

const runClient = async () => {
	const user = await CLI.prompt('Usuario: ');
	const client = new SocketClient(user);
	await client.initialize();

	let shouldRun = true;

	while (shouldRun) {
		const input = await CLI.prompt('\nMensaje o comando: ');
		if (input.toLowerCase().trim() === 'exit') {
			client.close();
			shouldRun = false;
		} else if (input.trim().length > 0) {
			client.sendMessage(input.trim());
		}
	}

	console.log('[INFO] Sesión cerrada!');
	CLI.close();
	process.exit(0);
};

runClient();
