import express from 'express';
import compression from 'compression';
import { createServer } from 'http';

import { configureSocketSever, reset, users } from './socket-server';

const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);
configureSocketSever(httpServer);

app.use(compression());
app.use('/client', express.static('public'));

app.get('/status', (req, res) => {
	res.json(users);
});

app.get('/reset', (req, res) => {
	reset();
	res.json({ message: 'ok' });
});

httpServer.listen(PORT, () =>
	console.log(`Sevidor esperando por peticiones en localhost:${PORT}`)
);
