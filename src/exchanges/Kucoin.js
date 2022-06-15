import './../utils/env.js';
import { openCandles } from './../websocket/websocket.js';
import axios from "axios";

export default class {
    state = 'Disconnected';

    async getPublicWsToken() {
        let url = `${process.env.KUCOIN_API_URL}/api/v1/bullet-public`;
        let result = await axios.post(url, {});
        return result.data;
    }

    async getSocketEndpoint() {
        let response = await this.getPublicWsToken();
        let token = response.data.token;
        let endpoint = response.data.instanceServers[0].endpoint;
        return `${endpoint}?token=${token}&[connectId=${Date.now()}]`;
    }
    async onCandles(callback) {
        let endpoint = await this.getSocketEndpoint();
        return await openCandles(
            endpoint,
            process.env.KUCOIN_SYMBOL,
            process.env.KUCOIN_TYPE, callback,
            (e) => this.state = e
        );
    }
}