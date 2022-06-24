import { spawn } from "child_process";
const app = spawn('node', ['./src/datafeed-app.js']);
app.stdout.setEncoding('utf-8');
app.stdout.on('data', (data) => {
    console.log(data);
    process.exit(0);
})
app.stderr.on('data', (data) => console.log('error: ', data.toString()));
app.on('exit', (code) => console.log('Process exited with code', code));
