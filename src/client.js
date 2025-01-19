const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'newArticles') {
        console.log('\nNew articles received:');
        message.data.forEach(article => {
            console.log(`- ${article.title}`);
        });
    }
});

ws.on('close', () => {
    console.log('Disconnected from server');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});