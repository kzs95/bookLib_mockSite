import { getBooks } from './data_fetch.js';

const perPage = 10;
const booksSection = document.querySelector("#bookListings");

document.addEventListener("DOMContentLoaded", () => {
    const currentURL = new URL(document.location.href);
    const currentURLSearchPage = currentURL.search.match(/(?<=(?:\?|\&)page\=)\w+/i);
    const currentURLSearchGenre = currentURL.search.match(/(?<=(?:\?|\&)genre\=)\w+/i);
    const currentGenre = currentURLSearchGenre ? currentURLSearchGenre[0] : 'latest';
    const currentPage = currentURLSearchPage ? Math.max(Number.parseInt(currentURLSearchPage[0]) - 1, 0) : 0;
    listBook(currentPage * perPage, perPage, currentGenre);
});

async function listBook(startIdx, limit, genre) {
    if (genre === 'latest') {
        genre = 'all';
        limit = 5;
    };
    try {
        const books = await getBooks(startIdx, limit, genre);
        if (!books) throw new Error("No book data found.");
        books.forEach((book) => {
            const bookListElm = document.createElement("book-list");
            bookListElm.setBook(book);
            booksSection.appendChild(bookListElm);
        });
        if (books.total > perPage && genre !== 'all') {
            const pageLink = document.createElement("page-link");
            pageLink.autoPopulate(books.total, perPage);
            booksSection.insertAdjacentElement("beforeend",pageLink);
        }
    }
    catch (error) {
        console.warn(error);
    }
}


