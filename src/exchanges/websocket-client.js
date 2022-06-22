import ReconnectingWebSocket from "reconnecting-websocket";
import WS from "ws";

const openWebSocket = (url) => (
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

const ping = () => {
    return JSON.stringify({
        id: Date.now(),
        type: 'ping',
        response: true
    })
}

const subscribe = (topic, symbol, type = null) => {
    return JSON.stringify({
        id: Date.now(),
        type: 'subscribe',
        topic: `${topic}${symbol}${type ? `_${type}` : ''}`,
        response: true
    })
}

export const openCandles = async (endpoint, symbol, type, cb, state) => {
    const w = await openWebSocket(endpoint);

    w.onmessage = (msg) => {
        let msg_data = JSON.parse(msg.data);

        // Connect or Reconnect fire the subscribe!
        if (msg_data.type === "welcome") {
            state('Connected');
            //Add heartbeat
            setInterval(() => {
                w.send(ping());
            }, 20000)
            // Subscribe
            w.send(subscribe("/market/candles:", symbol, type));
        }

        if (msg_data.type === "message") {
            cb(msg_data.data);
        }
    }

    return () => {
        w.close(1000, "Close handle was called", { keepClosed: true });
        state('Disconnected');
    }
}