# HackerNews Real-Time Scraper

A Node.js application that scrapes Hacker News articles in real-time and provides updates through WebSocket connections. The application stores articles in both a MySQL database and text files, while broadcasting updates to connected clients.

## Features

- Real-time scraping of Hacker News articles
- WebSocket server for live updates
- MySQL database integration
- File-based storage of scraped articles
- Configurable initial scraping of multiple pages
- Automatic updates every 30 seconds
- Clean shutdown handling

## Prerequisites

- Node.js (v12 or higher)
- MySQL Server
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hackernews-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Set up the MySQL database:
```sql
CREATE DATABASE hackernews;
USE hackernews;

CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rankk VARCHAR(10),
    title TEXT,
    site VARCHAR(255),
    link TEXT,
    author VARCHAR(255),
    score VARCHAR(50),
    posted VARCHAR(50),
    UNIQUE KEY unique_article (title(255), author)
);
```

4. Configure database connection:
Update the database configuration in `dbManager.js`:
```javascript
const dbConfig = {
    host: "localhost",
    user: "your_username",
    password: "your_password",
    database: "hackernews"
};
```

## Usage

1. Start the server:
```bash
node app.js
```

2. In another terminal, start the client:
```bash
node client.js
```

3. Follow the prompts in the server terminal:
   - Enter the number of pages to fetch initially (1-20)
   - Type "stop" when you want to end the scraping process

## Project Structure

```
project/
├── app.js              # Main application file
├── websocketServer.js  # WebSocket server implementation
├── client.js          # Example WebSocket client
├── dbManager.js       # Database operations
├── fetcher.js         # Article fetching logic
├── fileManager.js     # File operations
└── HackerNews/       # Directory for saved article files
```

## Key Components

- `app.js`: Main application entry point that coordinates all components
- `websocketServer.js`: Handles real-time updates and client connections
- `client.js`: Example implementation of a WebSocket client
- `dbManager.js`: Manages database connections and operations
- `fetcher.js`: Handles article scraping from Hacker News
- `fileManager.js`: Manages file system operations for saving articles

## Features in Detail

### Real-time Updates
- Scrapes the newest articles every 30 seconds
- Broadcasts updates to all connected WebSocket clients
- Filters articles posted within the last 5 minutes

### Database Storage
- Stores articles in MySQL database
- Prevents duplicate entries
- Updates existing entries with new information

### File Storage
- Saves articles in text files
- Organizes files by page number
- Creates a new directory if it doesn't exist

### WebSocket Communication
- Supports multiple client connections
- Broadcasts updates to all connected clients
- Handles client disconnections gracefully

## Error Handling

- Graceful shutdown on process termination
- Database connection error handling
- WebSocket error handling
- Scraping error handling

## Limitations

- Maximum of 20 pages can be scraped initially
- Only articles from the last 5 minutes are stored in the database
- Time parsing only supports "minutes" and "hours" formats

## Contributing

Feel free to submit issues and enhancement requests!

## License

[Your License Here]
