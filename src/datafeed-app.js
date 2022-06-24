import "./utils/env.js";
import {
    startTime,
    memoryUsage,
    updateCandlesArr,
    calcOhlc4,
    calcSMA,
    calcShortMA,
    calcLongMA
} from "./utils/functions.js";
import state from "./state.js";
import { exchange } from "./exchanges/exchange.js";
import { websocketServer } from "./websocket-server.js";

let exchangeWs;

export const app = {
    init: () => {
        state.startTime = Date.now();
        websocketServer.init();
        exchangeWs = exchange.loadWebsocket(process.env.EXCHANGE);
        exchangeWs.onMessage(
            (c) => {
            state.candles = updateCandlesArr(c.symbol, c.candles);
            state.OHLC4 = calcOhlc4(state.candles);
            state.SMA = calcSMA(process.env.SMA_LEN);
            state.LongMA = calcLongMA();
            state.ShortMA = calcShortMA();
            websocketServer.pushData();
        },
            (l) => {
            state.orderbook = l;
            websocketServer.pushData();
        })
    },

    printBanner: () => {
        console.log(`-------------------------------------------------------------`);
        const startedTime = startTime();
        console.log(` ${startedTime.date} ${startedTime.time} - Started : ${startedTime.since} - Mem : ${memoryUsage()} MB `);
        console.log(` Exchange : ${process.env.EXCHANGE} - State : ${exchangeWs.state}`);
        console.log(' Server :', { ...websocketServer.infos, clients: websocketServer.infos.clients.size ?? 0 })
        console.log(`--------------------------------------------------------------`);
    },

    printConsole: () => {
        console.clear();
        app.printBanner();
        console.log('orderbook:', state.orderbook);
        console.log('OHLC4:', state.OHLC4.length > 0 ? state.OHLC4[0] : null);
        console.log('SMA:', state.SMA);
        console.log('ShortMA:', state.ShortMA);
        console.log('LongMA:', state.LongMA);
    },

    run: () => {
        app.init();
        if (process.argv[process.argv.length - 1] === 'console') {
            state.interval = setInterval(app.printConsole, 250);
        } else {
            console.log(`Process pid ${process.pid} started`);
        }
    }
};

app.run();

