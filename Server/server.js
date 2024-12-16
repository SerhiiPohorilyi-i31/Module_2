const http = require('http');
const WebSocket = require('ws');
// Створення WebSocket-сервера
const wsPort = 3000;
const httpPort = 3001;
const wss = new WebSocket.Server({ port: wsPort });

// Для зберігання посилань на підключених клієнтів
const clients = [];

wss.on('connection', (ws, req) => {
    console.log('Новий користувач приєднався');
    
    // Додаємо клієнта до списку
    clients.push(ws);
    
    // Повідомляємо всіх користувачів про нове підключення
    const message = JSON.stringify({ text: 'Новий користувач приєднався' });
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });

    // Обробка отриманих повідомлень
    ws.on('message', (message) => {
        if (Buffer.isBuffer(message)) {
            message = message.toString(); // Декодуємо Buffer в текст
        }
    
        console.log('Отримано повідомлення: ', message);
    
        try {
            const data = JSON.parse(message);
    
            // Надсилаємо повідомлення всім користувачам
            const responseMessage = JSON.stringify({ text: data.text });
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(responseMessage);
                }
            });
        } catch (error) {
            console.error('Помилка під час обробки повідомлення:', error);
        }
    });

    // Повідомлення про закриття з'єднання
    ws.on('close', () => {
        console.log('Користувач відключився');
        
        // Видаляємо клієнта зі списку підключених
        const index = clients.indexOf(ws);
        if (index > -1) {
            clients.splice(index, 1);
        }

        // Сповіщаємо всіх інших користувачів про відключення
        const message = JSON.stringify({ text: 'Користувач відключився' });
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

console.log(`WebSocket сервер запущено на ws://localhost:${wsPort}`);

// Створення HTTP-сервера для обробки запитів на відключення
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/disconnect') {
        // Отримуємо IP клієнта або інші дані для відключення
        const ip = req.socket.remoteAddress;
        console.log(`Отримано запит на відключення від IP: ${ip}`);

        let userDisconnected = false;

        // Шукаємо клієнта за IP і закриваємо його з'єднання
        wss.clients.forEach((client) => {
            if (client._socket.remoteAddress === ip && client.readyState === WebSocket.OPEN) {
                // Спочатку надсилаємо повідомлення іншим користувачам про відключення
                const message = JSON.stringify({ text: 'Користувач відключився' });
                wss.clients.forEach((otherClient) => {
                    if (otherClient !== client && otherClient.readyState === WebSocket.OPEN) {
                        otherClient.send(message);
                    }
                });

                // Закриваємо з'єднання
                client.close();
                console.log(`Користувача з IP ${ip} відключено`);
                userDisconnected = true;
            }
        });

        if (userDisconnected) {
            res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.end('Ви успішно відключені від чату.');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.end('Користувач не знайдений або вже відключений.');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
        res.end('Маршрут не знайдено');
    }
});

server.listen(httpPort, () => {
    console.log(`HTTP сервер запущено на http://localhost:${httpPort}`);
});
