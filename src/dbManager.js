const mysql = require("mysql2/promise");

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "masu@&16",
    database: "hackernews",
};

/**
 * @returns {Promise<mysql.Connection>} Database connection instance.
 */
async function connectDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("Connected to MySQL database.");
        return connection;
    } catch (error) {
        console.error("Error connecting to MySQL database:", error.message);
        throw error;
    }
}

/**
 * @param {mysql.Connection} connection - Database connection.
 * @returns {Promise<void>}
 */
async function clearArticlesTable(connection) {
    try {
        await connection.execute("TRUNCATE TABLE articles");
        console.log("Cleared the articles table.");
    } catch (error) {
        console.error("Error clearing the articles table:", error.message);
        throw error;
    }
}

/**
 * @param {mysql.Connection} connection 
 * @param {object[]} articles 
 * @returns {Promise<void>}
 */
async function saveArticlesToDB(connection, articles) {
    try {
        const now = new Date();

        const filteredArticles = articles.filter(article => {
            const postedTime = parsePostedTime(article.time);
            return postedTime && (now - postedTime) / (1000 * 60) <= 5; 
        });

        const query = `
            INSERT INTO articles (rankk, title, site, link, author, score, posted)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            score = VALUES(score), posted = VALUES(posted);
        `;

        for (const article of filteredArticles) {
            await connection.execute(query, [
                article.rankk || null,
                article.title || null,
                article.site || null,
                article.link || null,
                article.author || null,
                article.score || null,
                article.time || null,
            ]);
        }

        console.log(`${filteredArticles.length} articles saved to the database.`);
    } catch (error) {
        console.error("Error saving articles to the database:", error.message);
        throw error;
    }
}

/**
 * @param {string} postedTimeStr 
 * @returns {Date | null} 
 */
function parsePostedTime(postedTimeStr) {
    const now = new Date();
    const [value, unit] = postedTimeStr.split(" ");

    if (!value || !unit) return null;

    const timeValue = parseInt(value, 10);
    if (isNaN(timeValue)) return null;

    switch (unit.toLowerCase()) {
        case "minute":
        case "minutes":
            return new Date(now.getTime() - timeValue * 60 * 1000);
        case "hour":
        case "hours":
            return new Date(now.getTime() - timeValue * 60 * 60 * 1000);
        default:
            return null; 
    }
}

module.exports = { connectDB, clearArticlesTable, saveArticlesToDB };
