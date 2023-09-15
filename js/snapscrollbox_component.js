import isMobile from './mobile_check.js';

class SnapScrollBox extends HTMLElement {
    #nowInView;
    constructor() {
        super();
        this.#nowInView;
        const shadowDOM = this.attachShadow({ mode: 'open' });
        const linkElm = document.createElement("link");
        const snapScrollTemplate = document.createElement("template");
        snapScrollTemplate.innerHTML = `
        <div class="snap-container-Y">
            <slot name="snap-pages">
                <div>Page 1</div>
                <div>Page 2</div>
            </slot>
        </div>
        <div class="changeSnapPage Y">
            <button class="goBackward" disabled></button>
            <button class="goForward" disabled></button>
        </div>
        `;
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/snapscrollbox_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(snapScrollTemplate.content.cloneNode(true));
    }

    get #inView() {
        return this.#nowInView;
    }

    set #inView(elm) {
        this.#nowInView = elm;
    }

    #swapToAxis(axis) {
        const container = this.shadowRoot.querySelector("[class^='snap-container']");
        const pageChange = this.shadowRoot.querySelector("[class~=changeSnapPage]");
        if (axis.toLowerCase() === 'x') {
            container.className = `snap-container-X`;
            pageChange.classList.toggle('Y', false);
        }
        else if (axis.toLowerCase() === 'y') {
            container.className = `snap-container-Y`;
            pageChange.classList.toggle('Y', true);
        }
    }

    #activateButtons() {
        const thisElm = this;
        const snapDivs = this.querySelectorAll("[slot='snap-pages']");
        const container = this.shadowRoot.querySelector("[class^='snap-container']");
        const backwardBtn = this.shadowRoot.querySelector(".goBackward");
        const forwardBtn = this.shadowRoot.querySelector(".goForward");

        const backForth = function (event) {
            const toShow = event.target.classList.contains("goForward") ? thisElm.#inView.nextElementSibling : thisElm.#inView.previousElementSibling;
            if (toShow) toShow.scrollIntoView({behavior:'smooth',block:'end'});
        }
        backwardBtn.addEventListener("click", backForth);
        forwardBtn.addEventListener("click", backForth);

        const reportDisplayed = function (observedArr) {
            const observed = observedArr[0];
            //I guess because the slotted stuff are in static html, loaded & displayed split second before the css and other js stuff "grows" and hide them.
            //If iterate through the array, sometimes on load will say all divs visible, esp. clear cache reload
            if (observed.isIntersecting) {
                const intersected = observed.target;
                thisElm.#inView = intersected;
                const placement = Array.from(snapDivs).indexOf(intersected);
                if (placement === 0) backwardBtn.toggleAttribute("disabled", true);
                else if (placement > 0) backwardBtn.toggleAttribute("disabled", false);
                if (placement + 1 === snapDivs.length) forwardBtn.toggleAttribute("disabled", true);
                else if (placement + 1 <= snapDivs.length) forwardBtn.toggleAttribute("disabled", false);
            }
            // observedArr.forEach((observed) => {
            //     if (observed.isIntersecting) {
            //         const intersected = observed.target;
            //         const placement = Array.from(snapDivs).indexOf(intersected);
            //         console.log(intersected,placement);
            //     }
            // });
        }

        // For some reason, not every pixel of the inner divs are shown (if put 1px border, upper border might not show fully), so lower the threshold
        // unless block-size :99.9%
        const intersectOptions = { root: container, rootMargin: "0px", threshold: 0.95 };
        const intersectObserver = new IntersectionObserver(reportDisplayed, intersectOptions);
        snapDivs.forEach((snapdiv) => {
            intersectObserver.observe(snapdiv);
        })
    }

    connectedCallback() {
        if (isMobile) this.#swapToAxis('x');
        this.#activateButtons();
    }

}
customElements.define("snap-scroll", SnapScrollBox);