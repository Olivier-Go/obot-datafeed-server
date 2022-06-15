import utils from './websocket-utils.js';
import { openWebSocket } from './open-websocket.js';

export const openCandles = async (endpoint, symbol, type, cb, state) => {
    const w = await openWebSocket(endpoint);

    w.onmessage = (msg) => {
        let msg_data = JSON.parse(msg.data);

        // Connect or Reconnect fire the subscribe!
        if (msg_data.type === "welcome") {
            state('Connected');
            //Add heartbeat
            setInterval(() => {
                w.send(utils.ping());
            }, 20000)
            // Subscribe
            w.send(utils.subscribe("/market/candles:", symbol, type));
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