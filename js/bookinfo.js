import { getSpecificBook } from './data_fetch.js';

const pageURL = new URL(document.location);
const genreSearch = pageURL.searchParams.get("genre");
const bookSearch = pageURL.searchParams.get("book");
const mainElement = document.querySelector("#bookinfo-area");

document.addEventListener("DOMContentLoaded", (event) => {
    if (!genreSearch || !bookSearch) document.location.replace("/collection.html");
    else displayBookInfo();
});

async function displayBookInfo() {
    try {
        const book = await getSpecificBook(genreSearch, bookSearch);
        if (!book) throw new Error(`No book with ISBN No. ${bookSearch} found within ${genreSearch} genre!`);
        document.title = `${book.title} | Book Library`;
        const displayBook = document.createElement("book-info");
        displayBook.setBook(book);
        mainElement.appendChild(displayBook);
    }
    catch(error){
        const errorTxt = document.createElement("h1");
        errorTxt.textContent = error.toString();
        mainElement.replaceChildren(errorTxt);
        console.warn(error);
    }
}
