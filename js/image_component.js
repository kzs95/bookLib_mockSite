import isMobile from './mobile_check.js';

class TwoSideImage extends HTMLElement {
    // On its own, will occupy the maximum width and height is auto based on aspect ratio.
    // On its own, an control height via passing 3rd parameter to setImages() (more of a super tall image problem)
    // If housed, can control its height via whatever container it is housed (e.g. css div.a img: height:xxx px) or like above (whatever method to apply height attr)
    #frontElm;
    #backElm;
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: "open" });
        const twoSideImgTemplate = document.createElement("template");
        twoSideImgTemplate.innerHTML = `
        <div class="twoSideImgWrapper">
            <div class="slider">
                <span class="slider-left-arrow"></span>
                <span class="slider-right-arrow"></span>
            </div>
            <slot name="front-side-img"></slot>
            <slot name="back-side-img"></slot>
        </div>
        `;
        const linkElm = document.createElement('link');
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/image_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(twoSideImgTemplate.content.cloneNode(true));
    }

    get frontImg() {
        return this.#frontElm;
    }

    get backImg() {
        return this.#backElm;
    }

    setImages(frontImgElm, backImgElm, height) {
        if (frontImgElm.tagName !== 'IMG' || backImgElm.tagName !== 'IMG') throw new Error("Only compatible with <img> element!");
        const prevSlotted = this.querySelectorAll("[slot$='-side-img']");
        prevSlotted.forEach((elm) => elm.remove());
        frontImgElm.setAttribute("slot", "front-side-img");
        backImgElm.setAttribute("slot", "back-side-img");
        // if (height) {
        //     frontImgElm.setAttribute("height", height);
        //     backImgElm.setAttribute("height", height);
        // }
        this.#frontElm = frontImgElm;
        this.#backElm = backImgElm;
        this.append(frontImgElm, backImgElm);
    }

    //call if need additional functionality
    addOpenModalButton() {
        const existingBtn = this.shadowRoot.querySelector(".openModalBtn");
        if (existingBtn) return;
        const twoSideImgElm = this;
        const buttonWrapper = document.createElement("div");
        buttonWrapper.classList.add("openModalBtn");
        buttonWrapper.innerHTML = `
        <button class="front-btn">F</button>
        <button class="back-btn">B</button>
        `;
        const frontBackBtn = buttonWrapper.querySelectorAll(".openModalBtn>button");
        const openImgModal = function (event) {
            const side = event.currentTarget?.classList.contains("front-btn") ? "front" : "back";
            const image = twoSideImgElm.querySelector(`img[slot='${side}-side-img']`);
            const imgModal = document.createElement("img-modal");
            imgModal.setImage(image);
        }
        frontBackBtn.forEach((button) => {
            button.addEventListener("click", openImgModal);
        });
        this.shadowRoot.querySelector(".twoSideImgWrapper").appendChild(buttonWrapper);
    }

    addOpenDialogButton() {
        const existingBtn = this.shadowRoot.querySelector(".openDialogBtn");
        if (existingBtn) return;
        const twoSideImgElm = this;
        const openDialogBtn = document.createElement("button");
        openDialogBtn.classList.add("openDialogBtn");

        const openImgDialog = function () {
            const existingDialog = document.querySelector(".two-side-img-dialog");
            if (existingDialog) existingDialog.remove();

            const dialog = document.createElement("dialog");
            const closeDialog = document.createElement("button");
            dialog.classList.add("two-side-img-dialog");
            closeDialog.classList.add("two-side-img-dialog-close");

            const closeImgDialog = function () {
                if (document.body.classList.contains("modal-open")) document.body.classList.toggle("modal-open", false);
                dialog.remove();
            }

            closeDialog.addEventListener("click", closeImgDialog);

            dialog.append(closeDialog, twoSideImgElm.cloneNode(true));
            document.body.classList.toggle("modal-open", true);
            twoSideImgElm.shadowRoot.append(dialog);
            dialog.showModal();
        }
        openDialogBtn.addEventListener("click", openImgDialog);
        this.shadowRoot.querySelector(".twoSideImgWrapper").appendChild(openDialogBtn);
    }

    connectedCallback() {
        let oldTouctPtPos;
        let draggingSlider = false;
        const slider = this.shadowRoot.querySelector(".slider");
        const wrapper = this.shadowRoot.querySelector(".twoSideImgWrapper");
        const upperImg = this.frontImg ?? this.querySelector("[slot='front-side-img']");
        slider.style.left = "0px";

        const dragTrue = function () {
            draggingSlider = true;
        }
        const dragFalse = function () {
            draggingSlider = false;
        }
        const clipImg = function (event) {
            const { width: wrapperWidth } = wrapper.getBoundingClientRect();
            const { width: sliderWidth } = slider.getBoundingClientRect();
            const minLeftVal = -(sliderWidth / 2);
            const maxLeftVal = wrapperWidth - (sliderWidth / 2);
            if (draggingSlider) {
                let touchPt, touchPtPos;
                if (event.targetTouches) { //mobile
                    touchPt = event.targetTouches[0];
                    touchPtPos = touchPt.clientX;
                }
                let xPosChange = event.movementX ?? touchPtPos - (oldTouctPtPos ?? touchPtPos);
                let newLeftValue = Number.parseInt(slider.style.left) + xPosChange;
                if (newLeftValue < minLeftVal) newLeftValue = minLeftVal;
                else if (newLeftValue > maxLeftVal) newLeftValue = maxLeftVal;
                slider.style.left = `${newLeftValue}px`;
                upperImg.style.clipPath = `inset(0 0 0 ${newLeftValue + (sliderWidth / 2)}px)`;
                if (touchPt) oldTouctPtPos = touchPt.clientX;
            }
        };

        slider.addEventListener("touchstart", dragTrue);
        window.addEventListener("touchend", dragFalse);
        window.addEventListener("touchmove", clipImg);

        slider.addEventListener("mousedown", dragTrue);
        window.addEventListener("mouseup", dragFalse);
        window.addEventListener("mousemove", clipImg);

        const resetImgClip = function (resizeEntryArr) {
            resizeEntryArr.forEach((resizeEntry) => {
                slider.style.left = "0px";
                upperImg.style.clipPath = "inset(0px)";
            });
        };
        const resizeObserver = new ResizeObserver(resetImgClip);
        resizeObserver.observe(wrapper, { box: "border-box" });
        //This is to prevent the scenario whereby when resized (esp when making viewport smaller)
        //The pixel value (left, clippath) will become too large, causing the slider to be diasppear from view
        //Current solution is just reset it whenever resizing is detected
    }
}

class BannerCarousel extends HTMLElement {
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: "open" });
        const bannerTemplate = document.createElement("template");
        bannerTemplate.innerHTML = `
        <div class="bannerCarousel">
            <div class="bannerCarouselContent">
                <button class="chevron-navi previous"></button>
                <button class="chevron-navi next"></button>
            </div>
            <div class="bannerCarouselControl">
            </div>
        </div>
        `;

        for (let i = 1; i <= 5; i++) {
            const contentSlot = document.createElement("slot");
            contentSlot.setAttribute("name", `banner-item${i}`);
            bannerTemplate.content.querySelector(".bannerCarouselContent").insertAdjacentElement("afterbegin", contentSlot);
        }

        const linkElm = document.createElement('link');
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/image_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(bannerTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        const shadowRoot = this.shadowRoot;
        const carouselControls = shadowRoot.querySelector(".bannerCarouselControl");
        const slottedBannerContents = this.querySelectorAll("[slot^='banner-item']");
        const naviButtons = shadowRoot.querySelectorAll(".chevron-navi");
        let autoBannerSwap;

        //automatically run the banner changing function every 5s
        const resetBannerSawp = function () {
            return setInterval(swapBanner, 5000);
        }

        // Triggered everytime thumbnail/arrow is clicked. Also every 5s of inactivity.
        // If clicked thumbnail/arrow, clear the interval and restart it again;
        const swapBanner = function (event) {
            const clickedBtn = event?.currentTarget;
            const currentTop = Array.from(slottedBannerContents).findIndex((banner) => banner.classList.contains("topBanner"));
            let nextIndex;
            //looks horrible
            if (!clickedBtn) {
                nextIndex = currentTop + 1 === slottedBannerContents.length ? 0 : currentTop + 1;
            }
            else if (clickedBtn.classList.contains("chevron-navi")) {
                nextIndex = event.currentTarget.classList.contains("next") ?
                    (currentTop + 1 === slottedBannerContents.length ? 0 : currentTop + 1) : (currentTop - 1 < 0 ? slottedBannerContents.length - 1 : currentTop - 1);
                clearInterval(autoBannerSwap);
                autoBannerSwap = resetBannerSawp();
            }
            else if (clickedBtn.classList.contains("thumbnail-navi")) {
                nextIndex = Array.from(clickedBtn.parentNode.children).findIndex((thumbBtn) => thumbBtn === clickedBtn);
                clearInterval(autoBannerSwap);
                autoBannerSwap = resetBannerSawp();
            }
            slottedBannerContents[currentTop].classList.toggle("topBanner");
            slottedBannerContents[nextIndex].classList.toggle("topBanner");
        }

        autoBannerSwap = resetBannerSawp();

        //create the buttons for each anchor image
        slottedBannerContents.forEach((slottedBanner, index) => {
            if (index === 0) slottedBanner.classList.toggle("topBanner");
            const bannerImage = slottedBanner.querySelector("img")?.src;
            const swapBannerBtn = document.createElement("button");
            swapBannerBtn.setAttribute("class", "thumbnail-navi");
            swapBannerBtn.style.backgroundImage = `url(${bannerImage})`;
            swapBannerBtn.addEventListener("click", swapBanner)
            carouselControls.append(swapBannerBtn);
        });

        naviButtons.forEach((naviBtn) => {
            naviBtn.addEventListener("click", swapBanner);
        });
    }
}

class ImgGallery extends HTMLElement {
    #nowInView;
    constructor() {
        super();
        this.#nowInView;
        const shadowDOM = this.attachShadow({ mode: "open" });
        const galleryTemplate = document.createElement("template");
        galleryTemplate.innerHTML = `
        <div class="gallery-wrapper">
            <div class="gallery-main-area"></div>
            <div class="gallery-img-list"></div>
            <div class="gallery-img-list-scroller">
                <button class="scroll-left" disabled></button>
                <button class="scroll-right"></button>
            </div>
        </div>
        `;
        const linkElm = document.createElement('link');
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/image_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(galleryTemplate.content.cloneNode(true));
    }
    get #inView() {
        return this.#nowInView;
    }

    set #inView(elm) {
        const prevInView = this.#inView;
        if (prevInView) {
            prevInView.classList.toggle("topImage", false);
            prevInView.thumbElm.classList.toggle("active", false);
        }
        elm.classList.toggle("topImage", true);
        if (elm.thumbElm) elm.thumbElm.classList.toggle("active", true);
        this.#nowInView = elm;
    }
    get imgheight() {
        return this.getAttribute("imgheight");
    }

    set imgheight(height) {
        this.setAttribute("imgheight", height);
    }

    static get observedAttributes() {
        return ['imgheight'];
    }

    connectedCallback() {
        const imgList = this.shadowRoot.querySelector(".gallery-img-list");
        const imgListScroller = this.shadowRoot.querySelector(".gallery-img-list-scroller");
        const imgListScrollLeft = this.shadowRoot.querySelector(".gallery-img-list-scroller > button.scroll-left");
        const imgListScrollRight = this.shadowRoot.querySelector(".gallery-img-list-scroller > button.scroll-right");

        imgList.addEventListener("scroll", (event) => {
            const scrolled = event.target.scrollLeft;
            const scrollWidth = event.target.scrollWidth;
            const clientWidth = event.target.clientWidth;
            if (scrolled === 0) imgListScrollLeft.toggleAttribute("disabled", true);
            else if (scrolled >= 0) imgListScrollLeft.toggleAttribute("disabled", false);
            if (scrolled + clientWidth === scrollWidth) imgListScrollRight.toggleAttribute("disabled", true);
            else if (scrolled + clientWidth <= scrollWidth) imgListScrollRight.toggleAttribute("disabled", false);
        })
        imgListScrollLeft.addEventListener("click", (event) => {
            imgList.scrollBy({ top: 0, left: -imgList.clientWidth, behavior: "smooth" });
        })
        imgListScrollRight.addEventListener("click", (event) => {
            imgList.scrollBy({ top: 0, left: imgList.clientWidth, behavior: "smooth" });
        })

        const showScroller = function () {
            if (imgList.scrollWidth > imgList.clientWidth) {
                imgList.style.justifyContent = "flex-start";
                imgListScroller.style.display = "flex";
            }
            else if (imgList.scrollWidth <= imgList.clientWidth) {
                imgList.style.justifyContent = "";
                imgListScroller.style.display = "none";
                imgList.scrollLeft = 0;
                imgListScrollRight.toggleAttribute("disabled", false);
            };
        }
        const resizeObserve = new ResizeObserver(showScroller);
        resizeObserve.observe(imgList, { box: "content-box" });
        imgList.addEventListener("newthumbnailadded", showScroller);
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (attrName === 'imgheight') {
            const allImages = this.shadowRoot.querySelectorAll(".gallery-main-area img");
            allImages.forEach((image) => {
                image.style.maxHeight = `${this.getAttribute("imgheight")}px`;
            })
        }
    }

    removeGalleryItems(...images) {
        const thumbnails = this.shadowRoot.querySelectorAll("button.thumbnail-button");
        const removedItems = []; //in case need to retain a reference to it??
        images.forEach((elm) => {
            const elmThumb = Array.from(thumbnails).find((thumb) => thumb.imageElm === elm);
            removedItems.push(elm.cloneNode(true));
            elmThumb.remove();
            elm.remove();
        });
        return removedItems;
    }

    addGalleryItems(...images) {
        const galleryMain = this.shadowRoot.querySelector(".gallery-main-area");
        const addedItems = [];
        images.forEach((elm, index) => {
            const galleryItemContainer = document.createElement("div");
            galleryItemContainer.setAttribute("class", "gallery-img-container");
            galleryItemContainer.appendChild(elm);
            if (galleryMain.childElementCount === 0 && index === 0) {
                this.#inView = galleryItemContainer;
            }
            galleryMain.appendChild(galleryItemContainer);
            addedItems.push(galleryItemContainer);
            if (elm.tagName === "IMG") {
                elm.classList.add("willOpenModal");
                elm.addEventListener("click", (event) => {
                    const imgModal = document.createElement("img-modal");
                    imgModal.setImage(elm);
                });
                if (!isMobile) {
                    elm.addEventListener("mouseover", (event) => {
                        elm.style.objectFit = "none";
                    });
                    elm.addEventListener("mouseout", (event) => {
                        elm.style.objectFit = "";
                        elm.style.objectPosition = "";
                    });
                    elm.addEventListener("mousemove", (event) => {
                        const naturalWidth = elm.naturalWidth;
                        const naturalHeight = elm.naturalHeight;
                        const { width: displayedWidth, height: displayedHeight } = elm.getBoundingClientRect();
                        const maxWidthOffset = -(naturalWidth - displayedWidth);
                        const widthOffsetPerMove = naturalWidth / displayedWidth;
                        const widthOffset = Math.max(maxWidthOffset, -(event.offsetX * widthOffsetPerMove));
                        const maxHeightOffset = -(naturalHeight - displayedHeight);
                        const heightOffsetPerMove = naturalHeight / displayedHeight;
                        const heightOffset = Math.max(maxHeightOffset, -(event.offsetY * heightOffsetPerMove));
                        elm.style.objectPosition = `${widthOffset}px ${heightOffset}px`;
                    })
                }
            }
        });
        this.#generateThumbnails();
        return addedItems;
    }

    #generateThumbnails() {
        const imgList = this.shadowRoot.querySelector(".gallery-img-list");
        const galleryImgs = this.shadowRoot.querySelectorAll(".gallery-img-container");
        Array.from(galleryImgs).forEach((galleryImg) => {
            if (!galleryImg.thumbElm) {
                const elmImg = galleryImg.tagName === 'IMG' ? galleryImg : galleryImg.querySelector("img");
                const addedThumbEvent = new CustomEvent("newthumbnailadded", { bubbles: true, composed: true });
                const thumbnail = document.createElement("button");
                thumbnail.imageElm = galleryImg;
                galleryImg.thumbElm = thumbnail;
                if (thumbnail.imageElm === this.#inView) thumbnail.classList.add("active");
                thumbnail.classList.add("thumbnail-button");
                thumbnail.style.backgroundImage = `url(${elmImg.src})`;
                imgList.appendChild(thumbnail);
                imgList.dispatchEvent(addedThumbEvent);

                thumbnail.addEventListener("click", (event) => {
                    this.#inView = event.target.imageElm;
                })
            }
        })
    }
}

class ImgModal extends HTMLElement {
    constructor() {
        super();
        const shadowDOM = this.attachShadow({ mode: 'open' });
        const imageModalTemplate = document.createElement("template");
        imageModalTemplate.innerHTML = `
        <button class="close-modal-button"></button>
        <div class="img-modal-container">
            <slot name="img-modal-image"><img src="/imgs/placeholder/img-landscape.svg" /></slot>
        </div>
        `;
        const linkElm = document.createElement('link');
        linkElm.setAttribute('rel', 'stylesheet');
        linkElm.setAttribute('href', '/css/image_component_style.css');
        shadowDOM.appendChild(linkElm);
        shadowDOM.appendChild(imageModalTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        const thisImgModal = this;
        const closeBtn = this.shadowRoot.querySelector("button.close-modal-button");
        const removeModal = function () {
            thisImgModal.remove();
            if (document.body.classList.contains("modal-open")) document.body.classList.toggle("modal-open", false);
        }
        closeBtn.addEventListener("click", removeModal);
        this.addEventListener("click", removeModal);
    }
    //initially want to accept figure, picture... now not since can't control what sort of tags is in those two, and messy to read through them
    setImage(imgElm) {
        if (imgElm.tagName !== "IMG") {
            throw new Error("Invalid type! Only accept <img>!");
        }
        const clone = imgElm.cloneNode(true);
        const unwantedAttr = Array.from(clone.attributes).map((attrNode) => attrNode.name).filter((attrName) => attrName !== 'src');
        for (const attr of unwantedAttr) {
            //remove everything except src to prevent other styles from causing a mess!
            clone.removeAttribute(attr);
        };
        clone.setAttribute("slot", "img-modal-image");
        this.appendChild(clone);

        const prevImgModal = document.querySelector("img-modal");
        if (prevImgModal) prevImgModal.remove();
        document.body.classList.toggle("modal-open", true);
        document.body.append(this);
    }
}

customElements.define("two-side-img", TwoSideImage);
customElements.define("banner-carousel", BannerCarousel);
customElements.define("img-gallery", ImgGallery);
customElements.define("img-modal", ImgModal);
