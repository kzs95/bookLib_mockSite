import { getArticles, getBooks } from "./data_fetch.js";

document.addEventListener("DOMContentLoaded", () => {
    fetchFeaturedBooks();
    fetchHomeArticles();
    determinePosition();
});

async function fetchFeaturedBooks() {
    const featuredBookSection = document.querySelector("#home-newbooks");
    try {
        const bookTileContainer = document.createElement("tile-container");
        const featuredBooks = await getBooks(0, 4, 'all', 'descending');
        if (!featuredBooks) throw new Error("Problem accessing books data.");

        for (const featBook of featuredBooks) {
            const { genre, title, author, isbn } = featBook;
            const bookTile = document.createElement("tile-potrait");
            const genreText = document.createElement("small");
            const titleText = document.createElement("p");
            const authorText = document.createElement("small");
            const bookCover = new Image();
            bookCover.src = `/imgs/books/${isbn}.jpg`;
            bookCover.setAttribute("slot", "tile-potrait-img");
            [genreText, titleText, authorText].map((elm) => {
                elm.setAttribute("slot", "tile-potrait-descp-text");
            });
            genreText.textContent = genre;
            titleText.textContent = title;
            authorText.textContent = author;
            genreText.classList.add("uppercase");
            titleText.classList.add("bold", "large");
            bookTile.append(bookCover, genreText, titleText, authorText);
            bookTileContainer.appendChild(bookTile);
            bookTile.associatedObject = featBook; //not necessary
        }
        bookTileContainer.setAttribute("maxWidth", 1000);
        bookTileContainer.setAttribute("columns", 4);
        featuredBookSection.appendChild(bookTileContainer);
    }
    catch (error) {
        console.warn(error);
        const message = document.createElement("p");
        message.textContent = `No Featured Books.`;
        featuredBookSection.appendChild(message);
    }
    finally {
        const anchor = document.createElement("a");
        anchor.className = "page-preview-link";
        anchor.href = "/collection.html";
        anchor.textContent = "All Books";
        featuredBookSection.appendChild(anchor);
    }
}

async function fetchHomeArticles() {
    const randomSkip = Math.floor(Math.random() * 101);
    const featuredArticleSection = document.querySelector("#home-articles");
    try {
        const articlesData = await getArticles(randomSkip, 4, featuredArticleSection);
        if (!articlesData) throw new Error("No articles data found.");
    }
    catch (error) {
        console.warn(error);
        const message = document.createElement("p");
        message.textContent = `No Featured Articles.`;
        featuredArticleSection.appendChild(message);
    }
    finally {
        const anchor = document.createElement("a");
        anchor.className = "page-preview-link";
        anchor.href = "/articles.html";
        anchor.textContent = "All Articles";
        featuredArticleSection.appendChild(anchor);
    }
}

// Ignore everything below.

function determinePosition() {
    if ("geolocation" in navigator) {
        const geolocation = navigator.geolocation;
        const positioningOption = { maximumAge: 1000, timeout: 5000, enableHighAccuracy: true };
        geolocation.getCurrentPosition(fetchCondition, unableToLocate, positioningOption);
    }
    else { console.warn("Geolocation API not supported!"); }
}

function unableToLocate(geolocationPositionError) {
    console.warn(geolocationPositionError.message);
    console.log("Unable to pinpoint your location.")
}

async function fetchCondition(geolocationPosition) {
    const minLatitude = 4.187211;
    const maxLatitude = 4.203060;
    const minLongitude = 100.538210;
    const maxLongitude = 100.549118;
    const availableWeather = [0, 1, 2, 3, 45, 51, 53, 61];

    const { latitude, longitude } = geolocationPosition.coords;
    const timestamp = geolocationPosition.timestamp;
    const currentHour = new Date(timestamp).getHours();
    const currentMinute = new Date(timestamp).getMinutes();

    if (currentHour < 7 || currentHour >= 20) {
        const dayNight = currentHour >= 0 && currentHour < 12 ? "am" : "pm";
        console.warn(`Its ${currentHour % 12 === 0 ? 12 : currentHour % 12}:${currentMinute.toString().padStart(2,'0')} ${dayNight} now. Shouldn't you be doing something else rather than reading this?`);
    }
    if ((minLatitude <= latitude <= maxLatitude) && (minLongitude <= longitude <= maxLongitude)) {
        console.warn(`It seems that you are too far away from our location. Regret to say that we can't hand over books to you personally.`);
    }
    try {
        const getWeather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode&timezone=Asia%2FSingapore&forecast_days=7`);
        if (getWeather.status === 200) {
            const weatherData = await getWeather.json();
            const nextThreeDayForecast = weatherData.daily;
            const availableDay = nextThreeDayForecast.weathercode.reduce((possibile, weather, index) => {
                const day = new Date(Date.now());
                day.setDate(day.getDate() + index);
                if (availableWeather.includes(weather) && day.getDay() % 6 !== 0) {
                    possibile.okDate ??= [];
                    possibile.okDate.push(day.toDateString());
                }
                return { ...possibile };
            }, {});
            console.log(availableDay.okDate ? `After considering the weather, we are only available at ${availableDay.okDate.join(', ')}.` :
                `Not opening this week. Try coming 7 days later.`);
        }
        else if (getWeather.status != 200) {
            throw new Error("Encountered an error while fetching weather data!");
        }
    }
    catch (error) {
        console.warn(error)
    }
}