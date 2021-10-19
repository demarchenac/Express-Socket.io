import readline from 'readline';

class CommandLineInterface {
	interface;

	constructor() {
		this.interface = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	prompt = async question =>
		new Promise(resolve => {
			this.interface.question(question, answer => resolve(answer));
		});

	close = () => this.interface.close();
}

const CLI = new CommandLineInterface();

export default CLI;
