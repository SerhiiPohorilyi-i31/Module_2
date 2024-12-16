const socket = new WebSocket('ws://localhost:3000'); // Підключення до WebSocket-сервера
const sendButton = document.getElementById('sendButton');
const disconnectBtn = document.getElementById('disconnectBtn');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

// При підключенні до сервера
socket.onopen = () => {
    console.log('Підключено до сервера WebSocket');
};

// Отримання повідомлень від сервера
socket.onmessage = (event) => {
    const data = event.data;
    
    if (data instanceof Blob) {
        data.text().then((text) => {
            const parsedData = JSON.parse(text);
            addMessage(parsedData.text);
        });
    } else {
        const parsedData = JSON.parse(data);
        addMessage(parsedData.text);
    }
};

// Функція для додавання повідомлення
function addMessage(message) {
    const messageContainer = document.createElement("div");
    messageContainer.textContent = message;
    messagesDiv.appendChild(messageContainer);
}

// Відправлення повідомлення на сервер
sendButton.onclick = () => {
    const message = messageInput.value;
    if (message) {
        const messageObj = { text: message };
        socket.send(JSON.stringify(messageObj));
        messageInput.value = ''; // Очищаємо поле вводу
    }
};

// Обробка кнопки "Відключитися"
disconnectBtn.onclick = () => {
    fetch('http://localhost:3001/disconnect', { method: 'GET' }) // HTTP-запит на відключення
        .then(response => {
            if (response.ok) {
                console.log('Відключено від сервера');
                addMessage('Ви відключились від чату.'); // Повідомлення користувачу
                socket.close(); // Закриття WebSocket-з'єднання
                disableChat(); // Відключення елементів інтерфейсу
            } else {
                console.error('Не вдалося відключитись від сервера');
            }
        })
        .catch(error => console.error('Помилка запиту:', error));
};

// Функція для відключення чату
function disableChat() {
    sendButton.disabled = true;
    messageInput.disabled = true;
    disconnectBtn.disabled = true;
}
