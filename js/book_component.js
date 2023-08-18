"use strict"

class BookLibHeader extends HTMLElement {
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: "open" });
        const header = document.createElement("header");
        const homeLink = document.createElement("div");
        const menuButton = document.createElement("button");
        const menuButtonWrapper = document.createElement("div");
        homeLink.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewbox="-1 0 220 100" id="storeHomeIcon" height="100%"
            preserveAspectRatio="xMinYMin meet">
            <defs>
                <g id="book">
                    <path id="page"
                        d="m0 15 v80 q25 -10, 50 0  q25 -10, 50 0 v-80 q-25 -10, -50 0 v80 v-80 q-25 -10, -50 0 z"
                        stroke="#002D62" stroke-width="2" fill="#B9D9EB" />
                    <path id="flip1" d="m50 15 q22.5 -10, 45 -5 v80 q-22.5 -5, -45 4 z" stroke="#002D62"
                        stroke-width="2" fill="#5D8AA8" />
                    <path id="flip2" d="m50 15 q20 -10, 40 -10 v80 q-20 -2.5, -40 9 z" stroke="#002D62"
                        stroke-width="2" fill="#76ABDF" />
                    <path id="flip3" d="m50 15 q17.5 -10, 35 -13 v80 q-17.5 -2, -35 11.5 z" stroke="#002D62"
                        stroke-width="2" fill="#E0FFFF" />
                    <path id="ribbon" d="m10 65 l7.5 -10 l7.5 10 v-56 c1 -1,-16 -1, -15 2 z" stroke="#00693E"
                        stroke-width="2" fill="#50C878" />
                </g>
                <g id="title">
                    <text x="110" y="45" font-size="30px" fill="#367588">Book</text>
                    <text x="110" y="75" font-size="30px" fill="#2E5090">Library</text>
                </g>
            </defs>
            <a href="/">
                <use href="#book"></use>
                <use href="#title"></use>
            </a>
        </svg>`;
        homeLink.setAttribute("id", "logoBanner");
        menuButton.setAttribute("id", "openMenuBtn");
        menuButtonWrapper.setAttribute("id", "openMenuBtnWrapper");
        menuButtonWrapper.appendChild(menuButton);

        header.append(homeLink, menuButtonWrapper);

        let requiredPages;
        const pageList = ['about.html', 'collection.html', 'articles.html', 'login.html', 'register.html'];
        const loggedInPages = ['/user/userpage.html', 'logout'];
        const token = document.cookie.match(/(?<=token\=)[^;]+(?=\;)?/);
        if (token) {
            pageList.splice(3);
            requiredPages = pageList.concat(loggedInPages);
        }
        else if (!token) requiredPages = pageList;

        for (const links of requiredPages) {
            const linkURL = new URL(links, document.location.origin);
            const anchor = document.createElement("a");
            const linkWrap = document.createElement("div");
            const [pageName] = links.match(/\w+(?=\.html\b)?/i);

            anchor.href = linkURL;
            anchor.textContent = `${pageName.charAt(0).toUpperCase()}${pageName.slice(1)}`;
            linkWrap.setAttribute("id", pageName);
            linkWrap.appendChild(anchor);
            header.appendChild(linkWrap);
        }
        const linkElm = document.createElement('link');
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/header_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(header);
    }

    connectedCallback() {
        const shadowRoot = this.shadowRoot;
        const openMenuBtn = shadowRoot.querySelector("#openMenuBtn");
        const logoutLink = shadowRoot.querySelector("#logout>a");
        const headerElm = shadowRoot.querySelector("header");
        openMenuBtn.addEventListener("click", openMenu);
        if (logoutLink) logoutLink.addEventListener("click", fakeLogout);

        function openMenu(event) {
            const buttonDiv = event.target.parentNode;
            const headerDivToMove = shadowRoot.querySelectorAll("header > div:not(#logoBanner,#openMenuBtnWrapper)");
            const menu = document.createElement("div");

            buttonDiv.classList.toggle("menuOpened");
            menu.setAttribute("id", "headerMenu");
            menu.append(...headerDivToMove);
            headerElm.appendChild(menu);
            openMenuBtn.removeEventListener("click", openMenu);
            openMenuBtn.addEventListener("click", closeMenu);
        }

        function closeMenu(event) {
            const buttonDiv = event.target.parentNode;
            const menu = shadowRoot.querySelector("#headerMenu");
            const menuItems = menu.children;

            buttonDiv.classList.toggle("menuOpened");
            headerElm.append(...menuItems);
            menu.remove();
            openMenuBtn.removeEventListener("click", closeMenu);
            openMenuBtn.addEventListener("click", openMenu);
        }

        async function fakeLogout(event) {
            event.preventDefault();
            try {
                const logoutStatus = await fetch("https://reqres.in/api/logout", {
                    method: "POST"
                });
                if (logoutStatus.status === 200) {
                    // const response = await logoutStatus.json();
                    document.cookie = `id=;path=/;max-age=0;expires=Thu, 01 Jan 1970 00:00:00 UTC`;
                    document.cookie = `username=;path=/;max-age=0;expires=Thu, 01 Jan 1970 00:00:00 UTC`;
                    document.cookie = `token=;path=/;max-age=0;expires=Thu, 01 Jan 1970 00:00:00 UTC`;
                    document.location.replace("/");
                }
                if (logoutStatus.status !== 200) {
                    throw new Error("There's a problem logging out.");
                }
            }
            catch (error) {
                console.warn(error);
            }
        }

        shadowRoot.addEventListener("click", (event) => {
            if (event.target === shadowRoot.querySelector("#headerMenu")) {
                openMenuBtn.click();
            }
        });

        const resizeObserve = new ResizeObserver(createMenu);
        resizeObserve.observe(document.body, { box: "border-box" });
        function createMenu(resizeEntryArr, observer) {
            resizeEntryArr.forEach((resizeEntry) => {
                const body = resizeEntry.target;
                const { blockSize, inlineSize } = resizeEntry.borderBoxSize[0];//block elm.. probably ever 1
                const menu = shadowRoot.querySelector("#headerMenu");
                if (inlineSize >= 680 && menu) {
                    openMenuBtn.click();
                }
            });
        } //will execute closeMenu function if user resize while menu's up!
    }
}

class BookLibFooter extends HTMLElement {
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: 'open' });
        const footer = document.createElement("footer");
        footer.innerHTML = `
        <div class="footer-subscribe">
            <span>Subscribe To Our Newsletter</span>
            <form name="subscribe" method="post" action="">
                <input type="email" name="subs-email" id="subs-email" placeholder="email@domain.com" required>
                <input type="submit" value="Subscribe" disabled>
            </form>
        </div>
        <div class="footer-misc">
            <div id="address">
                <img id="footer-logo" src="/imgs/logo/page-logo_150px.svg">
                <address>No.180, Jalan Bunga, Taman Daun Biru, 30000 Ipoh, Perak.</address>
            </div>
            <div id="anchors">
                <a href="about.html">About</a>
                <a href="collection.html">Collection</a>
                <a href="articles.html">Articles</a>
            </div>
            <div id="disclaimer">
                <small><b>Book Library &trade; 1995 - <span id="currentYear"></span>. Book Library does not exists.</b><br />This page has no commercial
                    purposes. Contents of all the books shown are the property of their respective owners. 
                    All books shown are from personal collection, owned and scanned by author of this page. All book
                    genre icons are the property of their respective creators. 
                    &copy; <a target="_blank" href="https://www.flaticon.com/">Flaticon</a>. Remaining graphics are
                    either self-work or from <a target="_blank" href="https://fonts.google.com/icons">Google Fonts</a>.
                </small>
            </div>
        </div>
        `;
        const linkElm = document.createElement('link');
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/footer_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(footer);
    }

    connectedCallback() {
        const shadowRoot = this.shadowRoot;
        const currentYear = shadowRoot.querySelector("#currentYear");
        const subscribeForm = shadowRoot.querySelector("form");
        const submitBtn = shadowRoot.querySelector("input[type='submit']");
        const emailInput = shadowRoot.querySelector("input[type='email']");

        currentYear.textContent = new Date().getFullYear();
        subscribeForm.addEventListener("submit", (event) => {
            event.preventDefault();
            event.target.reportValidity();
            const formData = new FormData(event.target);

            //Remove
            const pop = document.createElement("p");
            pop.style.cssText = `position:fixed;top:90%;right:0%;background-color:lavender;padding:.5rem;border:1px solid pink;`;
            pop.innerText = `Sorry, no server side code.`
            event.target.parentNode.appendChild(pop);
            setTimeout(() => { pop.remove(); }, 1000)
        });
        emailInput.addEventListener("input", (event) => {
            const valid = event.target.checkValidity();
            if (valid) {
                submitBtn.toggleAttribute("disabled", false);
            }
            else if (!valid) {
                submitBtn.toggleAttribute("disabled", true);
            }
        })
    }
}

class Product extends HTMLElement {
    #underlyingObject;
    constructor(category) {
        super();
        this.category = category;
        this.#underlyingObject = null;
    }

    getAssociatedObject() {
        return this.#underlyingObject;
    }

    setAssociatedObject(object, renderCallback) {
        if (!renderCallback || typeof renderCallback !== 'function') throw new Error("No rendering callback provided.");
        this.#underlyingObject = object;
        renderCallback();
    }
}

class BookList extends Product {
    constructor() {
        super("Book");
        const shadowDOM = this.attachShadow({ mode: "open" });
        const booklistTemplate = document.createElement("template");
        booklistTemplate.innerHTML = `
        <div class="bookList">
            <div class="bookCoverImg">
                <slot name="book-front-cover"><img src="imgs/books/nocover.svg" /></slot>
            </div>
            <div class="bookInfo">
                <slot name="book-title"><h3>BOOK TITLE</h3></slot>
                <slot name="book-details"></slot>
                <hr/>
                <slot name="book-synopsis"><p>SYNOPSIS</p></slot>
            </div>
        </div>`;
        const linkElm = document.createElement('link');
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/book_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(booklistTemplate.content.cloneNode(true));
    }

    setBook(bookIns) {
        const callback = this.#displayBookList.bind(this);
        super.setAssociatedObject(bookIns, callback);
    }

    #displayBookList() {
        const bookObj = super.getAssociatedObject();
        const { title, isbn, synopsis, genre } = bookObj;
        const bookInfoURL = new URL('/bookinfo/bookinfo.html', document.location.origin);
        bookInfoURL.searchParams.set("genre", genre);
        bookInfoURL.searchParams.set("book", isbn);
        const bookData = document.createElement("book-data");
        const prevSlotted = this.querySelectorAll("[slot]");
        prevSlotted.forEach((elm) => elm.remove());
        this.innerHTML = `
        <img slot="book-front-cover" src='/imgs/books/${isbn}.jpg'>
        <h3 slot="book-title"><a class='book-page-link' href='${bookInfoURL}'>${title ?? 'No Title'}</a></h3>
        <p slot="book-synopsis">${synopsis ?? 'No Synopsis Available.'}</p>
        `;
        bookData.setAttribute("slot", "book-details")
        bookData.setBookData(bookObj);
        this.appendChild(bookData);
    }
}

class BookListData extends HTMLElement {
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: "open" });
        const linkElm = document.createElement("link");
        const list = document.createElement("ul");
        list.setAttribute("class", "book-details");
        list.innerHTML = `
        <li class="book-author" title="Author">${this.getAttribute("author") ?? 'Unknown Author'}</li>
        <li class="book-publisher" title="Publisher">${this.getAttribute("publisher") ?? 'Unknown Publisher'}</li>
        <li class="book-published" title="Publishing Year">${this.getAttribute("published") ?? 'Unknown Publishing Year'}</li>
        <li class="book-isbn" title="ISBN">${this.getAttribute("isbn") ?? 'No ISBN Data'}</li>
        `;
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/book_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(list);
    }

    static get observedAttributes() {
        return ['author', 'publisher', 'published', 'isbn'];
    }

    attributeChangedCallback(attrName, newValue, oldValue) {
        if (BookListData.observedAttributes.includes(attrName)) this.#updateListItem(attrName);
    }

    setBookData(bookIns) {
        BookListData.observedAttributes.forEach((attr) => {
            if (attr in bookIns) this.setAttribute(attr, bookIns[attr]);
        })
    }

    #updateListItem(attributeText) {
        const li = this.shadowRoot.querySelector(`.book-${attributeText}`);
        li.textContent = this.getAttribute(attributeText);
    }
}

class BookInfo extends Product {
    constructor() {
        super("Book");
        const shadowDOM = this.attachShadow({ mode: "open" });
        const bookTemplate = document.createElement("template");
        bookTemplate.innerHTML = `
        <section class="bookinfo-overview">
            <slot name="overview"></slot>
        </section>
        <section class="bookinfo-description">
            <h1>Description</h1>
            <slot name="description"></slot>
        </section>
        <section class="bookinfo-gallery">
            <h1>Gallery</h1>
            <slot name="gallery"><p>No preview images available for this book.</p></slot>
        </section>
        <section class="bookinfo-contents">
            <h1>Table of Contents</h1>
            <slot name="toc"><p>No table of contents available for this book.</p></slot>
        </section>
        `;
        const linkElm = document.createElement('link');
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/book_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(bookTemplate.content.cloneNode(true));
    }

    setBook(bookIns) {
        const callback = this.#displayBook.bind(this);
        super.setAssociatedObject(bookIns, callback);
    }

    async #displayBook() {
        let toc;
        const bookObj = super.getAssociatedObject();
        try {
            const getTOC = await fetch(`/bookinfo/data/${bookObj.isbn}_toc.txt`);
            if (getTOC.status === 200) {
                const tocText = await getTOC.text();
                toc = tocText;
            }
            else if (getTOC.status !== 200) {
                throw new Error("No TOC data available");
            }
        }
        catch (error) {
            console.warn(error);
        }
        const prevSlotted = this.querySelectorAll("[slot]");
        prevSlotted.forEach((elm) => elm.remove());
        this.innerHTML = `
        <p slot="description">${bookObj.synopsis}</p>
        `;

        const overviewtile = document.createElement("tile-landscape");
        overviewtile.enablewrap = true;
        overviewtile.innerHTML = `
        <img height="400" slot="tile-landscape-img" src="/imgs/books/${bookObj.isbn}.jpg"/>
        <div slot="tile-landscape-descp-text">
            <h1>${bookObj.title}</h1>
            <table class="overview-table">
            <colgroup>
            <col class="overview-criteria">
            </colgroup>
                <tbody>
                    <tr>
                        <th>Author</th>
                        <td>${bookObj.author}</td>
                    </tr>
                    <tr>
                        <th>Publisher</th>
                        <td>${bookObj.publisher}</td>
                    </tr>
                    <tr>
                        <th>Publishing Year</th>
                        <td>${bookObj.published}</td>
                    </tr>
                    <tr>
                        <th>ISBN</th>
                        <td>${bookObj.isbn}</td>
                    </tr>
                    <tr>
                        <th>In Possession</th>
                        <td>${bookObj.held}</td>
                    </tr>
                    <tr>
                        <th>Attached Media</th>
                        <td>${bookObj.media === "" ? "N/A" : bookObj.media.toUpperCase()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        `;
        overviewtile.setAttribute("slot", "overview");
        this.appendChild(overviewtile);

        const imgGallery = document.createElement("img-gallery");
        imgGallery.setAttribute("slot", "gallery");
        if ("coverImgs" in bookObj) {
            const coverImgsArr = bookObj.coverImgs;
            this.#generateTwoSideImg(imgGallery, coverImgsArr);
        }
        if ("dustjacketImgs" in bookObj) {
            const jacketImgsArr = bookObj.dustjacketImgs;
            this.#generateTwoSideImg(imgGallery, jacketImgsArr);
        }
        if ("previewImgs" in bookObj) {
            const previewImgsArr = bookObj.previewImgs;
            previewImgsArr.forEach((imgURL) => {
                const previewImg = new Image();
                previewImg.src = imgURL
                imgGallery.addGalleryItems(previewImg);
            });
        }
        imgGallery.imgheight = 450;
        this.appendChild(imgGallery);

        if (toc) {
            const tocContent = document.createElement("p");
            tocContent.setAttribute("slot", "toc")
            tocContent.innerText = toc;
            this.appendChild(tocContent)
        }
    }

    #generateTwoSideImg(galleryIns, imgArray, needDialogBtn = true, needModalBtn = false, slotImgWidth, slotImgHeight) {
        const imgsObj = imgArray.reduce((obj, imgURL) => {
            const img = new Image(slotImgWidth, slotImgHeight);
            img.src = imgURL;
            if (/\_front/i.test(imgURL)) obj.front = img;
            else if (/\_back/i.test(imgURL)) obj.back = img;
            else {
                if (!obj.front) obj.front = img;
                else if (obj.front) obj.back = img;
            } //not sure will work or nt... suppossedly for messed up names (fail regexp)
            return { ...obj };
        }, { front: null, back: null, __proto__: null });
        const twoSideImg = document.createElement("two-side-img");
        twoSideImg.setImages(imgsObj.front, imgsObj.back);
        if (needModalBtn) twoSideImg.addOpenModalButton();
        if (needDialogBtn) twoSideImg.addOpenDialogButton();
        galleryIns.addGalleryItems(twoSideImg);
    }
}

class UserInfo extends HTMLElement {
    #user;
    constructor() {
        super();
        this.#user;
        const shadowDOM = this.attachShadow({ mode: 'open' });
        const userInfoTemplate = document.createElement("template");
        userInfoTemplate.innerHTML = `
        <div class="user-info-wrapper">
            <div class="user-img">
                <slot name="avatar-img"><img src="/imgs/placeholder/avatar.png"/></slot>
            </div>
            <div class="user-data">
                <div class="user-data-entry">
                    <span>ID</span>
                    <slot name="id"><span>No Data!</span><slot>
                </div>
                <div class="user-data-entry">
                    <span>Username</span>
                    <slot name="username">No Data!</slot>
                </div>
                <div class="user-data-entry">
                    <span>Full Name</span>
                    <slot name="firstName">No </slot>
                    <slot name="lastName">Data!</slot>
                </div>
                <div class="user-data-entry">
                    <span>Email</span>
                    <slot name="email"><span>No Data!</span><slot>
                </div>
                <div class="user-data-entry">
                    <span>Phone</span>
                    <slot name="phone"><span>No Data!</span><slot>
                </div>
                <div class="user-data-entry">
                    <span>Address</span>
                    <slot name="address"><span>No Data!</span><slot>
                </div>
            </div>
        </div>
        `;

        const linkElm = document.createElement('link');
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/book_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(userInfoTemplate.content.cloneNode(true));
    }

    setUser(userData) {
        const prevSlotted = this.querySelectorAll("[slot]");
        prevSlotted.forEach((elm) => elm.remove());
        const avatarImg = new Image();
        avatarImg.src = userData.image;
        avatarImg.setAttribute("slot", "avatar-img");
        this.appendChild(avatarImg);
        for (const [key, value] of Object.entries(userData)) {
            let address;
            const entry = document.createElement("span");
            if (key === 'address') address = `${value.address}, ${value.city}, ${value.postalCode} ${value.state}`
            entry.setAttribute("slot", key);
            entry.textContent = address ?? value;
            this.append(entry);
        }
        this.#user = userData;
    }
}

customElements.define("book-list", BookList);
customElements.define("book-data", BookListData);
customElements.define("book-info", BookInfo);
customElements.define("booklib-header", BookLibHeader);
customElements.define("booklib-footer", BookLibFooter);
customElements.define("user-info", UserInfo);

