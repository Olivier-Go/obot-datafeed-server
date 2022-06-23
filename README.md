# obot-datafeed-server
### Datafeed websocket server for [oBot](https://github.com/Olivier-Go/obot-sf-backend)

```sh
# install dependencies
yarn
```

Rename `.env.dist` to `.env`.

#### Development
```sh
# launch dev server
yarn start
```

#### Production
````sh
# Install PM2
sudo npm install pm2 -g

# launch app
pm2 start src/app.js

# listing all running processes
pm2 list

# stop/restart processes
pm2 stop all                  
pm2 stop 0                    
pm2 restart all   
````