const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Fetches articles from a specific Hacker News page.
 * @param {number} pageNo - The page number to fetch (1-20).
 * @returns {Promise<object[]>} List of articles with details.
 */
async function fetchArticles(pageNo) {
    if (pageNo <= 0 || pageNo > 20) {
        throw new Error("Page number must be between 1 and 20.");
    }

    const url = `https://news.ycombinator.com/newest?p=${pageNo}`;
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const articles = [];
        const articleRows = $("tr.athing");
        const subtextRows = $("td.subtext");

        articleRows.each((index, element) => {
            const title = $(element).find(".titleline a").text() || "No Title";
            const rankk = $(element).find(".rank").text().replace(".", "") || "N/A";
            const link = $(element).find(".titleline a").attr("href") || "No URL";
            const site = $(element).find(".sitestr").text() || "N/A";

            const subtext = $(subtextRows[index]);
            const score = subtext.find(".score").text() || "Not Scored";
            const author = subtext.find(".hnuser").text() || "Unknown Author";
            const time = subtext.find(".age").text() || "Unknown Time";

            articles.push({
                rankk,
                title,
                link: link.startsWith("http") ? link : `https://news.ycombinator.com/newest/${link}`,
                site,
                score,
                author,
                time,
            });
        });

        return articles;
    } catch (error) {
        throw new Error(`Failed to fetch page ${pageNo}: ${error.message}`);
    }
}

module.exports = { fetchArticles };