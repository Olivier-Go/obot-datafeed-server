import "./utils/env.js";
import state from "./state.js";
import { debug } from "./utils/functions.js";
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

export const websocketServer = {
    infos: {
        state: 'Closed',
        address: '',
        port: 0,
        message: '',
        clients: []
    },

    init: () => {
        const server = createServer();
        const websocket = new WebSocketServer({ noServer: true });

        websocket.on('connection', (ws, request) => {
            websocketServer.updateClients(websocket)
            ws.on('close', (code) => websocketServer.updateClients(websocket));
        });

        server.listen(process.env.WS_PORT, () => (
            websocketServer.infos = {
                ...websocketServer.infos,
                state: 'Listening',
                address: server.address().address,
                port: server.address().port,
                message: ''
            }
        ))
        .on('error', (error) => (
            websocketServer.infos = {
                ...websocketServer.infos,
                state: 'Error',
                message: error.toString()
            }
        ))
        .on('close', () => (
            websocketServer.infos = {
                ...websocketServer.infos,
                state: 'Closed',
                message: ''
            }
        ))
        .on('upgrade', (request, socket, head) => {
            if (request.headers['upgrade'] !== 'websocket') {
                return socket.end('HTTP/1.1 400 Bad Request');
            }
            return websocket.handleUpgrade(request, socket, head, (ws) => {
                websocket.emit('connection', ws, request);
            })
        })
    },

    updateClients: (websocket) => websocketServer.infos.clients = websocket.clients,

    pushData: () => {
        if (websocketServer.infos.clients.size && state.ShortMA && state.LongMA) {
            const data = {
                lastCandle: state.candles.length > 0 ? state.candles[0] : {},
                OHLC4: state.OHLC4.length > 0 ? state.OHLC4[0] : {},
                SMA: state.SMA,
                ShortMA: state.ShortMA,
                LongMA: state.LongMA
            }
            websocketServer.infos.clients.forEach(ws => {
                ws.send(JSON.stringify(data));
            });
        }
    }
}
