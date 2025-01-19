const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "../HackerNews");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

/**
 * @param {number} pageNo 
 * @param {object[]} articles
 */
function saveToFile(pageNo, articles) {
    const filePath = path.join(outputDir, `NewsPage${pageNo}.txt`);
    const fileContent = articles.map(article => {
        return `
        --------------------------------------------------------------------
        Article Number: ${article.rank}
        Article Title: ${article.title}
        Source Website: ${article.site}
        Source URL: ${article.link}
        Article Author: ${article.author}
        Article Score: ${article.score}
        Posted: ${article.time}
        --------------------------------------------------------------------`;
    }).join("\n");

    fs.writeFileSync(filePath, fileContent, "utf-8");
    console.log(`Page ${pageNo} saved to ${filePath}`);
}

module.exports = { saveToFile };