import WS from 'ws';
import ReconnectingWebSocket from 'reconnecting-websocket';

export const openWebSocket = (url) => (
    new Promise((resolve, reject) => {
        const connection = new ReconnectingWebSocket(url, undefined, {
            WebSocket: WS,
            connectionTimeout: 4000,
            debug: false,
            maxReconnectionDelay: 10000,
            maxRetries: Infinity,
            minReconnectionDelay: 4000
        })

        connection.onopen = () => resolve(connection);
        connection.onerror = (err) => reject(err);
    })
)
