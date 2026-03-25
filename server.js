const { SerialPort, ReadlineParser } = require('serialport');
const WebSocket = require('ws');


const port = new SerialPort({
  path: '/dev/cu.usbmodem1101', 
  baudRate: 9600,
});


const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));


const wss = new WebSocket.Server({ port: 8080 });



port.on('open', () => {
  console.log('Serial port opened.');
});


console.log('WebSocket server running on port 8080.');


wss.on('connection', (ws) => {
  console.log('WebSocket client connected.');

  // 监听 Arduino 数据
  parser.on('data', (data) => {
    const command = data.trim();
    console.log(`Received from Arduino: ${command}`);
    if (command === 'jump') {
      ws.send('jump'); // 将跳跃指令发送给 WebSocket 客户端
      console.log('Jump command sent to client.');
    }
  });

  
  ws.on('message', (message) => {
    console.log(`Received from client: ${message}`);
  });

  
  ws.on('close', () => {
    console.log('WebSocket client disconnected.');
  });
});

parser.on('data', (data) => {
    console.log(`Received raw data from Arduino: ${data.trim()}`); // print
    const command = data.trim();
    if (command === 'jump') {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send('jump');
                console.log('Jump command sent to client.');
            }
        });
    }
});

// error handling
port.on('error', (err) => {
  console.error(`Serial port error: ${err.message}`);
});

wss.on('error', (err) => {
  console.error(`WebSocket server error: ${err.message}`);
});
