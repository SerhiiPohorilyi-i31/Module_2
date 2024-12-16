const socket = new WebSocket('ws://localhost:3000');
const sendButton = document.getElementById('sendButton');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

// При підключенні до сервера
socket.onopen = () => {
    console.log('Підключено до сервера WebSocket');
};

// Отримання повідомлень від сервера
socket.onmessage = (event) => {
    const data = event.data;
    
    // Якщо отримано Blob, перетворюємо його в текст і обробляємо
    if (data instanceof Blob) {
        data.text().then((text) => {
            const parsedData = JSON.parse(text); // Парсимо JSON
            addMessage(parsedData.text); // Додаємо повідомлення в інтерфейс
        });
    } else {
        const parsedData = JSON.parse(data);
        addMessage(parsedData.text);
    }
};

// Функція для додавання повідомлення в інтерфейс
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
        socket.send(JSON.stringify(messageObj)); // Відправляємо як JSON
        messageInput.value = ''; // Очищаємо поле вводу
    }
};


