const WebSocket = require('ws');
const { fetchArticles } = require('./fetcher');
const { connectDB, saveArticlesToDB, clearArticlesTable } = require('./dbManager');

class WebSocketServer {
    constructor(port = 8080) {
        this.wss = new WebSocket.Server({ port });
        this.connections = new Set();
        this.isRunning = false;
        this.interval = null;

        this.init();
    }

    init() {
        this.wss.on('connection', (ws) => {
            console.log('New client connected');
            this.connections.add(ws);

            ws.on('close', () => {
                console.log('Client disconnected');
                this.connections.delete(ws);
            });
        });
    }

    broadcast(message) {
        this.connections.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    async startScraping() {
        if (this.isRunning) return;

        this.isRunning = true;
        const connection = await connectDB();

        await clearArticlesTable(connection);

        const fetchAndProcess = async () => {
            try {
                const articles = await fetchArticles(1);

                await saveArticlesToDB(connection, articles);

                articles.forEach(article => {
                    console.log(`New article added: ${article.title}`);
                });

                this.broadcast({
                    type: 'newArticles',
                    data: articles
                });

            } catch (error) {
                console.error('Error in fetch and process:', error);
            }
        };

        await fetchAndProcess();

        this.interval = setInterval(fetchAndProcess, 30000);
    }

    async stopScraping() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

module.exports = WebSocketServer;