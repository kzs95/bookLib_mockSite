class Pagination extends HTMLElement {
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: 'open' });
        const linkElm = document.createElement("link");
        const paginationTemplate = document.createElement("template");
        paginationTemplate.innerHTML = `
        <div class="pagination">
            <span class="prevPage"></span>
            <slot name="pages"></slot>
            <span class="nextPage"></span>
            <slot name="additional-control"></slot>
        </div>
        `;
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/pagination_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(paginationTemplate.content.cloneNode(true));
    }

    autoPopulate(totalItems, itemsPerPage) {
        const shadowRoot = this.shadowRoot;
        const prevPage = shadowRoot.querySelector(".prevPage");
        const nextPage = shadowRoot.querySelector(".nextPage");
        const currentURL = new URL(document.location.href);
        const currentURLSearchParams = currentURL.searchParams;
        const currentURLSearchPage = currentURL.search.match(/(?<=(?:\?|\&)page\=)\w+/i);
        currentURLSearchParams.delete('page');
        // const currentURLSearchPage = document.location.href.match(/(?<=(?:\?|\&)page\=)\w+/i); //original
        const currentPage = currentURLSearchPage ? Math.max(Number.parseInt(currentURLSearchPage[0]), 1) : 1;
        const pageURL = new URL(document.location.pathname, document.location.origin);
        const searchParams = pageURL.searchParams;
        for (const [key,value] of currentURLSearchParams.entries()){
            searchParams.set(key,value);
        }

        //Test
        const showLimit = 10;
        const showLimitMidPt = Math.ceil(showLimit / 2);
        const requiredPages = Math.ceil(totalItems / itemsPerPage);
        const pageBarCount = Math.ceil(requiredPages / showLimit);//total no of pageBar
        const currentPageInPageBarCount = Math.ceil(currentPage / showLimit); //current page(url) is within which pageBar?
        const pageBarMax = showLimit * currentPageInPageBarCount;
        const pageBarMin = pageBarMax - showLimit + 1;

        //Create the next and previous page arrow
        if (currentPage < requiredPages) {
            const anchorNext = document.createElement("a");
            searchParams.set("page", currentPage + 1);
            anchorNext.href = pageURL.toString();
            nextPage.appendChild(anchorNext);
        }
        if (currentPage > 1) {
            const anchorPrev = document.createElement("a");
            searchParams.set("page", currentPage - 1);
            anchorPrev.href = pageURL.toString();
            prevPage.appendChild(anchorPrev);
        }

        // Display All Page Type
        // for (let i = 1; i <= requiredPages; i++) {
        //     searchParams.set("page", i);
        //     const anchor = document.createElement("a");
        //     anchor.setAttribute("slot", "pages");
        //     anchor.classList.add("pagesAnchor");
        //     if (i === currentPage) anchor.classList.add("currentPage");
        //     if (i !== currentPage) anchor.href = pageURL.toString();
        //     anchor.textContent = i.toString().padStart(2, " ");
        //     this.appendChild(anchor);
        // }

        // Display showLimit
        // for (let i = pageBarMin; i <= Math.min(pageBarMax, requiredPages); i++) {
        //     searchParams.set("page", i);
        //     const anchor = document.createElement("a");
        //     anchor.setAttribute("slot", "pages");
        //     anchor.classList.add("pagesAnchor");
        //     if (i === currentPage) anchor.classList.add("currentPage");
        //     if (i !== currentPage) anchor.href = pageURL.toString();
        //     anchor.textContent = i.toString().padStart(2, " ");
        //     this.appendChild(anchor);
        // }

        // Page count progress type
        let smallestPg = pageBarMin, biggestPg = pageBarMax;
        if (currentPage - pageBarMin > showLimitMidPt) {
            smallestPg = currentPage - showLimitMidPt;
            biggestPg = smallestPg + showLimit;
        }
        for (let i = smallestPg; i <= Math.min(requiredPages, biggestPg); i++) {
            searchParams.set("page", i);
            const anchor = document.createElement("a");
            anchor.setAttribute("slot", "pages");
            anchor.classList.add("pagesAnchor");
            if (i === currentPage) anchor.classList.add("currentPage");
            if (i !== currentPage) anchor.href = pageURL.toString();
            anchor.textContent = i.toString().padStart(2, " ");
            this.appendChild(anchor);
        }

        if (requiredPages > showLimit) {
            const pageSkipWrapper = document.createElement("div");
            const pageSkip = document.createElement("select");
            pageSkip.innerHTML = `<option value="">JumpTo</option>`;
            pageSkip.setAttribute("name", "pageSkip");
            for (let i = 1; i <= pageBarCount; i++) {
                const pageMax = i * showLimit;
                const option = document.createElement("option");
                option.setAttribute("value", i);
                option.textContent = `${pageMax - showLimit + 1} - ${Math.min(requiredPages, pageMax)}`;
                pageSkip.appendChild(option);
            }
            pageSkip.addEventListener("change", (event) => {
                const skip = event.target.value;
                if (!skip) return;
                searchParams.set("page", (skip * showLimit) - showLimit + 1);
                location.replace(pageURL);
            })
            pageSkipWrapper.appendChild(pageSkip);
            pageSkipWrapper.setAttribute("slot", "additional-control");
            this.appendChild(pageSkipWrapper);
        }
    }
}

customElements.define("page-link", Pagination);