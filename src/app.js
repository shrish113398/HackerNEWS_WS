const readline = require("readline");
const { fetchArticles } = require("./fetcher");
const { saveToFile } = require("./fileManager");
const { connectDB, clearArticlesTable, saveArticlesToDB } = require("./dbManager");
const WebSocket = require('ws');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

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

    async startScraping(connection) {
        if (this.isRunning) return;

        this.isRunning = true;

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

/**
 * @param {number} pages 
 * @param {import("mysql2/promise").Connection} connection 
 * @param {WebSocketServer} wsServer
 */
async function scrapeAndSave(pages, connection, wsServer) {
    await clearArticlesTable(connection);

    await wsServer.startScraping(connection);

    for (let pageNo = 1; pageNo <= pages; pageNo++) {
        console.log(`Fetching page ${pageNo}...`);
        const articles = await fetchArticles(pageNo);

        saveToFile(pageNo, articles);

        await saveArticlesToDB(connection, articles);
    }

    console.log("Initial scraping task completed. Continuing with real-time updates...");
}

async function main() {
    const connection = await connectDB();
    const wsServer = new WebSocketServer(8080);
    console.log('WebSocket server started on port 8080');

    try {
        const pagesInput = await prompt("Enter number of pages to fetch initially (max 20): ");
        const pages = parseInt(pagesInput, 10);

        if (isNaN(pages) || pages <= 0 || pages > 20) {
            console.log("Please enter a valid number between 1 and 20.");
            rl.close();
            return;
        }

        console.log("Starting the scraping task...");
        await scrapeAndSave(pages, connection, wsServer);

        while (true) {
            const input = await prompt('Type "stop" to end the scraping process: ');
            if (input.toLowerCase() === 'stop') {
                await wsServer.stopScraping();
                console.log('Scraping stopped');
                break;
            }
        }

        rl.close();
    } catch (error) {
        console.error("An error occurred:", error.message);
    } finally {
        await wsServer.stopScraping();
        await connection.end();
    }
}

process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');
    await wsServer.stopScraping();
    process.exit(0);
});

main().catch(error => console.error("Unhandled error in main function:", error.message)); 