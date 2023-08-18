export { TileContainer, TilePotrait, TileLandscape };
class TileContainer extends HTMLElement {
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: 'open' });
        const linkElm = document.createElement("link");
        const tileContainer = document.createElement("div");

        tileContainer.setAttribute("class", "tile-container");
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/tile_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(tileContainer);
    }

    static get observedAttributes() {
        return ['columns', 'maxwidth'];
    }

    get columns() {
        const col = Number.parseInt(this.getAttribute("columns"));
        if (Number.isNaN(col)) return null;
        else return col;
    }

    set columns(num) {
        if (typeof num !== 'number') return;
        this.setAttribute("columns", Number.parseInt(num));
    }

    get maxwidth() {
        const width = Number.parseInt(this.getAttribute("maxwidth"));
        if (Number.isNaN(width)) return null;
        else return width;
    }

    set maxwidth(maxW) {
        const width = Number.parseInt(maxW);
        if (Number.isNaN(width)) return;
        else this.setAttribute("maxwidth", width);
    }

    updateSlottedFlex() {
        const columns = Number.parseInt(this.getAttribute("columns"));
        const maxwidth = Number.parseInt(this.getAttribute("maxwidth"));
        const slottedElms = this.querySelectorAll("[slot^='tile-item']");
        slottedElms.forEach((slotted) => {
            slotted.style.cssText = `flex: 0 1 ${(maxwidth - (10 * (columns - 1))) / columns}px;`;
        })
    }

    syncSlots(injectedNodesArr) {
        const shadowRoot = this.shadowRoot;
        const tileContainer = shadowRoot.querySelector(".tile-container");
        const insertedTiles = injectedNodesArr ?? Array.from(this.children);

        insertedTiles.forEach((insertedElm) => {
            let currentSlotCount = shadowRoot.querySelectorAll("slot").length;
            const slotName = `tile-item-${currentSlotCount + 1}`;
            const slot = document.createElement("slot");
            slot.setAttribute("name", slotName);
            tileContainer.appendChild(slot);
            insertedElm.setAttribute("slot", slotName);
        })
    }

    connectedCallback() {
        this.syncSlots();
        this.updateSlottedFlex();
        const mutateObserveOpt = { subtree: true, childList: true };
        const mutationObserve = new MutationObserver((mutationArr) => {
            mutationArr.forEach((mutation) => {
                this.syncSlots(mutation.addedNodes);
            })
        });
        mutationObserve.observe(this, mutateObserveOpt)
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (attrName === 'columns' || attrName === 'maxwidth') {
            this.updateSlottedFlex();
        }
    }
}

class Tile extends HTMLElement {
    #underlyingObject;
    constructor() {
        super();
        this.#underlyingObject = null;
    }

    static get observedAttributes() {
        return ['reverse', 'bgcolor'];
    }

    get associatedObject() {
        return this.#underlyingObject;
    }

    set associatedObject(obj) {
        this.#underlyingObject = obj;
    }

    get reverse() {
        return this.hasAttribute("reverse");
    }

    set reverse(bool) {
        if (bool === 'true' || bool === true) this.setAttribute("reverse", '');
        else if (bool === 'false' || bool === false) this.removeAttribute("reverse");
    }

    get bgcolor() {
        return this.getAttribute("bgcolor");
    }

    #getWrapperElm() {
        return this.shadowRoot.querySelector(".tile-landscape") ?? this.shadowRoot.querySelector(".tile-potrait");
    }

    #getPictureElm() {
        return this.shadowRoot.querySelector(".tile-landscape-picture") ?? this.shadowRoot.querySelector(".tile-potrait-picture");
    }

    #getDescpDivElm() {
        return this.shadowRoot.querySelector(".tile-landscape-descp") ?? this.shadowRoot.querySelector(".tile-potrait-descp");
    }

    #reverseTile() {
        const pictureElmClasses = this.#getPictureElm().classList;
        if (this.reverse) {
            pictureElmClasses.toggle("reverse", true);
        }
        else if (!this.reverse) {
            pictureElmClasses.remove("reverse");
        }
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (attrName === 'reverse') {
            this.#reverseTile();
        }
        else if (attrName === 'bgcolor') {
            const hexColorCode = /^\#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?\b/;
            const validColorCode = hexColorCode.test(newValue);
            const shadowTileElm = this.#getWrapperElm();
            if (validColorCode) {
                shadowTileElm.style.backgroundColor = newValue;
            }
            else if (!validColorCode) {
                this.removeAttribute("bgcolor");
                shadowTileElm.style.backgroundColor = "";
            };
        }
    }

    // classListToggler(node, attribute) {
    //     console.log("Node class Toggler!")
    //     const elmClasses = node.classList;
    //     if (this[attribute]) {
    //         elmClasses.toggle(attribute, true);
    //     }
    //     else if (!this[attribute]) {
    //         elmClasses.remove(attribute);
    //     }
    // }
}

class TilePotrait extends Tile {
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: 'open' });
        const linkElm = document.createElement("link");
        const tileTemplate = document.createElement("template");
        tileTemplate.innerHTML = `
        <div class="tile-potrait">
            <picture class="tile-potrait-picture">
                <slot name="tile-potrait-img"><img src="/imgs/books/nocover.svg" /></slot>
            </picture>
            <div class="tile-potrait-descp">
                <slot name="tile-potrait-descp-text">
                    <small>Lorem</small>
                    <p>Lorem</p>
                    <small>Lorem</small>
                </slot>
            </div>
        </div>
        `;
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/tile_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(tileTemplate.content.cloneNode(true));
    }

    static get observedAttributes() {
        const inherited = super.observedAttributes;
        return ['unlockimgaspectratio', ...inherited];
    }

    get unlockimgaspectratio() {
        return this.hasAttribute("unlockimgaspectratio");
    }

    set unlockimgaspectratio(bool) {
        if (bool === 'true' || bool === true) this.setAttribute("unlockimgaspectratio", '');
        else if (bool === 'false' || bool === false) this.removeAttribute("unlockimgaspectratio");
    }

    #unlockAspectRatio() {
        const pictureElmClasses = this.shadowRoot.querySelector(".tile-potrait-picture").classList;
        if (this.unlockimgaspectratio) {
            pictureElmClasses.toggle("unlockimgaspectratio", true);
        }
        else if (!this.unlockimgaspectratio) {
            pictureElmClasses.remove("unlockimgaspectratio");
        }
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (attrName === 'unlockimgaspectratio') {
            this.#unlockAspectRatio();
        }
        else super.attributeChangedCallback(attrName, oldValue, newValue);
    }
}

class TileLandscape extends Tile {
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: 'open' });
        const linkElm = document.createElement("link");
        const tileTemplate = document.createElement("template");
        tileTemplate.innerHTML = `
        <div class="tile-landscape">
            <picture class="tile-landscape-picture">
                <slot name="tile-landscape-img">
                    <img width="100%" src="/imgs/placeholder/img-landscape.svg" srcset="/imgs/placeholder/img-landscape.svg 1920w, /imgs/placeholder/img-potrait.svg 1080w" sizes="(max-width:550px) 1080px ,1920px"/>
                </slot>
            </picture>
            <div class="tile-landscape-descp">
                <slot name="tile-landscape-descp-text"></slot>
            </div>
        </div>
        `;
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/tile_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(tileTemplate.content.cloneNode(true));
    }

    static get observedAttributes() {
        const inherited = super.observedAttributes;
        return ['enablewrap', ...inherited];
    }

    get enablewrap() {
        return this.hasAttribute("enablewrap");
    }

    set enablewrap(bool) {
        if (bool === 'true' || bool === true) this.setAttribute("enablewrap", '');
        else if (bool === 'false' || bool === false) this.removeAttribute("enablewrap");
    }

    #changeToWrap() {
        const wrapperElmClasses = this.shadowRoot.querySelector(".tile-landscape").classList;
        if (this.enablewrap) {
            wrapperElmClasses.toggle("wrap", true);
        }
        else if (!this.enablewrap) {
            wrapperElmClasses.remove("wrap");
        }
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (attrName === 'enablewrap') {
            this.#changeToWrap();
        }
        else super.attributeChangedCallback(attrName, oldValue, newValue);
    }
}

customElements.define("tile-container", TileContainer);
customElements.define("tile-potrait", TilePotrait);
customElements.define("tile-landscape", TileLandscape);