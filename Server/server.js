const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws) => {
    console.log('Новий користувач приєднався');
    
    // Повідомляємо всіх користувачів про новий підключення
    const message = JSON.stringify({ text: 'Новий користувач приєднався' });
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });

    // Обробка отриманих повідомлень
    ws.on('message', (message) => {
        console.log('Отримано повідомлення: ', message);
        
        // Надсилаємо повідомлення всім користувачам
        const data = JSON.parse(message);
        const responseMessage = JSON.stringify({ text: data.text });
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(responseMessage);
            }
        });
    });

    // Повідомлення про закриття з'єднання
    ws.on('close', () => {
        console.log('Користувач відключився');
    });
});

console.log('Сервер запущено на ws://localhost:3000');

