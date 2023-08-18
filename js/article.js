import { getArticles } from "./data_fetch.js";

const perPage = 10;
const articleSection = document.querySelector("#article-articlelists");
const numberDisplay = document.createElement("h1");

document.addEventListener("DOMContentLoaded", () => {
    const currentURL = new URL(document.location.href);
    const currentURLSearchPage = currentURL.search.match(/(?<=(?:\?|\&)page\=)\w+/i);
    const currentPage = currentURLSearchPage ? Math.max(Number.parseInt(currentURLSearchPage[0]) - 1, 0) : 0;
    listArticles(currentPage * perPage, perPage);
});

async function listArticles(startIdx, limit) {
    try {
        const articles = await getArticles(startIdx, limit, articleSection);
        if (!articles) throw new Error("No articles data found.");

        const totalArticles = articles.total;
        numberDisplay.textContent = startIdx >= totalArticles ? `No content available` : `Article ${articles.skip + 1} - Article ${articles.skip + articles.limit}`;
        articleSection.insertAdjacentElement("afterbegin", numberDisplay);

        const pageLink = document.createElement("page-link");
        pageLink.autoPopulate(totalArticles, perPage);
        articleSection.insertAdjacentElement("beforeend", pageLink);
    }
    catch (error) {
        console.warn(error);
    }
};
