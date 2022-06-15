export default {
    ping: () => {
        return JSON.stringify({
            id: Date.now(),
            type: 'ping',
            response: true
        })
    },

    subscribe: (topic, symbol, type = null) => {
        return JSON.stringify({
            id: Date.now(),
            type: 'subscribe',
            topic: `${topic}${symbol}${type ? `_${type}` : ''}`,
            response: true
        })
    }
}

