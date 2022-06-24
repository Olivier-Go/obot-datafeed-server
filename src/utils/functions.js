import state from "./../state.js";

export const debug = (data) => {
    console.log(data);
    process.exit();
}

export const isEmptyObj = (obj) => (
    Object.keys(obj).length === 0
)

export const timeAgo = (timestamp) => (
    (Date.now() - timestamp) / 1000
)

export const twoDigit = (number) => (
    number.toLocaleString('fr-FR', { minimumIntegerDigits: 2, useGrouping: false })
)

export const startTime = () => {
    const today = new Date();
    const date = `${twoDigit(today.getDate())}/${twoDigit(today.getMonth()+1)}/${today.getFullYear()}`;
    const time = `${twoDigit(today.getHours())}:${twoDigit(today.getMinutes())}:${twoDigit(today.getSeconds())}`;
    let since = new Date(timeAgo(state.startTime) * 1000).toISOString();
    const days = new Date(timeAgo(state.startTime) * 1000).toISOString().substring(8, 10);
    const hours = new Date(timeAgo(state.startTime) * 1000).toISOString().substring(11, 19);
    since = `${Number(days) - 1}D-${hours}`
    return {
        date,
        time,
        since
    }
}

export const memoryUsage = () => (
    Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100
)

export const updateOB = (arr) => {
    let result = {};
    if (arr.length) {
        result = {
            price: parseFloat(arr.slice(0, 1).shift()[0]),
            size: parseFloat(arr.slice(0, 1).shift()[1]),
        }
    }
    return result;
}

export const existingOrder = (orderbook) => {
    return (
        state.orderbook.ask && orderbook.ask &&
        state.orderbook.ask.price === orderbook.ask.price &&
        state.orderbook.ask.size === orderbook.ask.size &&
        state.orderbook.bid && orderbook.bid &&
        state.orderbook.bid.price === orderbook.bid.price &&
        state.orderbook.bid.size === orderbook.bid.size
    );
}

const formatCandle = (symbol, candle) => (
    {
        symbol,
        timecycleMs: parseInt(candle[0]) * 1000,
        timecycleDate: new Date(parseInt(candle[0]) * 1000).toLocaleString('fr-FR'),
        open: candle[1],
        close: candle[2],
        high: candle[3],
        low: candle[4],
        volume: candle[5],
        amount: candle[6]
    }
)

const formatOhlc4 = (candle, value) => (
    {
        symbol: candle.symbol,
        timecycleMs: candle.timecycleMs,
        timecycleDate: candle.timecycleDate,
        value
    }
)

export const updateCandlesArr = (symbol, kline) => {
    const candle = formatCandle(symbol, kline);
    let result = [candle];
    state.candles.map((c) => {
        if (c.timecycleMs !== candle.timecycleMs) {
            result.push(c);
        }
    })
    result.sort((a, b) => parseFloat(b.timecycleMs) - parseFloat(a.timecycleMs));
    if (result.length > 3) result.pop();
    return result;
}

export const calcOhlc4 = () => {
    let arr = [...state.candles];
    let result = [...state.OHLC4];
    if (arr.length > 1) {
        arr.shift();
        const candle = arr[0];
        const value = parseFloat(((parseFloat(candle.open) + parseFloat(candle.high) + parseFloat(candle.low) + parseFloat(candle.close)) / 4).toFixed(4));
        const ohlc4 = formatOhlc4(candle, value);
        let exist = false;
        state.OHLC4.map((o) => {
            if (o.timecycleMs === ohlc4.timecycleMs) exist = true;
        })
        if (!exist) result.push(ohlc4);
    }
    result.sort((a, b) => parseFloat(b.timecycleMs) - parseFloat(a.timecycleMs));
    if (result.length > 3) result.pop();
    return result;
}

export const calcSMA = (len) => {
    let arr = [...state.OHLC4];
    let sum = 0;
    if (arr.length >= len) {
        for (let i = 0; i < len; i++) {
            sum += arr[i].value;
        }
        return parseFloat((((sum / len) * process.env.TICK_MULTIPLIER) / process.env.TICK_MULTIPLIER).toFixed(4));
    }
    return null;
}

export const calcShortMA = () => {
    if (state.SMA) {
        return parseFloat(((state.SMA * ((100 + parseFloat(process.env.SHORT_LEVEL)) / 100) * process.env.TICK_MULTIPLIER) / process.env.TICK_MULTIPLIER).toFixed(4));
    }
    return null;
}

export const calcLongMA = () => {
    if (state.SMA) {
        return parseFloat(((state.SMA * ((100 + parseFloat(process.env.LONG_LEVEL)) / 100) * process.env.TICK_MULTIPLIER) / process.env.TICK_MULTIPLIER).toFixed(4));
    }
    return null;
}