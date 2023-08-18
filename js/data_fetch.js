//If passed a housingElement, will immediatedly create and append obtained data as <tile-landscape> custom element
//Else return an object {limit:10,posts:[{},{}],skip,total}
export async function getArticles(startIdx, limit, housingElement) {
    try {
        const articlesList = await fetch(`https://dummyjson.com/posts?&skip=${startIdx ?? 0}&limit=${limit ?? 10}`);
        if (articlesList.status === 200) {
            const articles = await articlesList.json();
            if (housingElement) {
                for (const articleEntry of articles.posts) {
                    const { title, body, tags, userId } = articleEntry;
                    const articleTiles = document.createElement("tile-landscape");
                    const tilePicture = document.createElement("picture");
                    const tileText = document.createElement("div");
                    tilePicture.setAttribute("slot", "tile-landscape-img");
                    tileText.setAttribute("slot", "tile-landscape-descp-text");

                    tilePicture.innerHTML = `
                    <source media="(max-width:600px)" srcset="https://loremflickr.com/450/800/tree"/>
                    <img alt="${title}" src="https://loremflickr.com/800/450/tree"/>
                    `;
                    tileText.innerHTML = `
                    <h3  style="display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;">${title}</h3><small><i>by user${userId}</i></small>
                    <p style="display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden;">${body}</p>
                    <small><b>${tags.join(", ")?.toUpperCase()}</b></small>
                    `;
                    articleTiles.append(tilePicture, tileText);
                    housingElement.appendChild(articleTiles);
                    articleTiles.associatedObject = articleEntry;
                }
            }
            else if (!housingElement) {
                console.log("Articles fetched!. Please assign return value to a variable to get the data.", articles);
            }
            return articles;
        }
        if (articlesList.status != 200) {
            throw new Error("Can't find any articles!");
        }
    }
    catch (error) {
        console.warn(error)
    }
}

//will return an array containing objects storing book data: [{acquired:"2020-03",author,genre}]
export async function getBooks(startIdx = 0, limit = 20, specificGenre = 'all', order = 'descending') {
    const allBooks = [];
    try {
        const getBooks = await fetch("/jsonData/books_data.json");
        if (getBooks.status === 200) {
            const bookData = await getBooks.json();

            for (const [genre, bookArray] of Object.entries(bookData)) {
                if (genre === specificGenre || specificGenre === 'all') allBooks.push(...bookArray);
            }

            allBooks.sort((itemA, itemB) => {
                const acquiredA = new Date(itemA.acquired);
                const acquiredB = new Date(itemB.acquired);
                return order === 'descending' ? acquiredB - acquiredA : acquiredA - acquiredB;
            });
            const totalBooks = allBooks.length;
            const required = allBooks.splice(startIdx, limit);
            required.total = totalBooks;
            return required;
        }
        else if (getBooks.status != 200) {
            throw new Error("Books data file not found!");
        }
    }
    catch (error) {
        console.warn(error)
    }
}

export async function getSpecificBook(bookGenre,isbnCode){
    const allBooks = [];
    try {
        const getBooks = await fetch("/jsonData/books_data.json");
        if (getBooks.status === 200) {
            const bookData = await getBooks.json();

            for (const [genre, bookArray] of Object.entries(bookData)) {
                if (genre === bookGenre) allBooks.push(...bookArray);
            }
            const specificBook = allBooks.find((book)=>book.isbn === isbnCode);
            return specificBook;
        }
        else if (getBooks.status != 200) {
            throw new Error(`No book with ISBN No.${isbnCode} found within ${bookGenre} genre!`);
        }
    }
    catch (error) {
        console.warn(error)
    }
}