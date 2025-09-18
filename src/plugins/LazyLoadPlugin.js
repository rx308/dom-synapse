function LazyLoadPlugin(domSynapse, options = {}) {
    const defaultOptions = {
        rootMargin: '200px 0px',
        threshold: 0.01,
        autoInit: true,
        selectors: [
            'img[data-src]',
            'img[data-srcset]',
            'source[data-srcset]',
            'iframe[data-src]',
            'video[data-src]',
            '[data-bg]'
        ]
    };

    const config = { ...defaultOptions, ...options };
    let observer = null;
    const observedElements = new Set();

    function loadElement(element) {
        if (!element || !element.isConnected) return;

        if (element.tagName === 'IMG') {
            return loadImageElement(element);
        }

        return loadOtherElement(element);
    }

    function loadImageElement(imgElement) {
        return new Promise((resolve) => {
            const originalSrc = imgElement.dataset.src;
            const originalSrcset = imgElement.dataset.srcset;

            if (!originalSrc && !originalSrcset) {
                resolve(false);
                return;
            }

            const onLoad = () => {

                imgElement.classList.remove('lazy-loading');
                imgElement.classList.add('lazyloaded');

                imgElement.dispatchEvent(new CustomEvent('lazyload:complete', {
                    detail: { element: imgElement }
                }));

                cleanup();
                resolve(true);
            };

            const onError = () => {
                console.warn('LazyLoad: Failed to load image', originalSrc || originalSrcset);
                imgElement.classList.remove('lazy-loading');
                imgElement.classList.add('lazy-error');
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                imgElement.removeEventListener('load', onLoad);
                imgElement.removeEventListener('error', onError);
            };

            imgElement.addEventListener('load', onLoad, { once: true });
            imgElement.addEventListener('error', onError, { once: true });

            if (originalSrc) {
                imgElement.src = originalSrc;
                delete imgElement.dataset.src;
            }

            if (originalSrcset) {
                imgElement.srcset = originalSrcset;
                delete imgElement.dataset.srcset;
            }

            if (imgElement.complete && imgElement.naturalWidth !== 0) {
                onLoad();
            }
        });
    }

    function loadOtherElement(element) {
        if (element.tagName === 'SOURCE' && element.dataset.srcset) {
            element.srcset = element.dataset.srcset;
            delete element.dataset.srcset;
        }
        else if ((element.tagName === 'IFRAME' || element.tagName === 'VIDEO') && element.dataset.src) {
            element.src = element.dataset.src;
            delete element.dataset.src;
        }
        else if (element.dataset.bg) {
            element.style.backgroundImage = `url(${element.dataset.bg})`;
            delete element.dataset.bg;
        }
        else {
            return false;
        }

        element.classList.add('lazyloaded');
        element.dispatchEvent(new CustomEvent('lazyload:complete', {
            detail: { element }
        }));

        return true;
    }

    function initObserver() {
        if (observer) return;

        if (!('IntersectionObserver' in window)) {
            loadAllElements();
            return;
        }

        observer = new IntersectionObserver(async (entries, observer) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const success = await loadElement(element);

                    if (success) {
                        observer.unobserve(element);
                        observedElements.delete(element);
                    }
                }
            }
        }, {
            rootMargin: config.rootMargin,
            threshold: config.threshold
        });
    }

    function loadAllElements() {
        const elements = getLazyElements();
        elements.forEach(element => {
            loadElement(element);
            if (observer) {
                observer.unobserve(element);
            }
            observedElements.delete(element);
        });
    }

    function getLazyElements(container = document) {
        const selector = config.selectors.join(', ');
        return Array.from(container.querySelectorAll(selector));
    }

    function observeElements(elements = null) {
        initObserver();
        
        const elementsToObserve = elements || getLazyElements();
        
        elementsToObserve.forEach(element => {
            if (!observedElements.has(element)) {
                if (element.tagName === 'IMG') {
                    element.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjwvc3ZnPg==";
                }
                element.classList.add('lazy-loading');
                observer.observe(element);
                observedElements.add(element);
            }
        });
    }

    function unobserveElements(elements = null) {
        if (!observer) return;
        
        const elementsToUnobserve = elements || Array.from(observedElements);
        
        elementsToUnobserve.forEach(element => {
            if (observedElements.has(element)) {
                observer.unobserve(element);
                observedElements.delete(element);
            }
        });
    }


    domSynapse
        .connect('lazyload', (element, event, data) => {
            const target = data.target ? document.querySelector(data.target) : element;
            if (target) loadElement(target);
        })
        .connect('lazyload-all', (element, event, data) => {
            const container = data.container ? document.querySelector(data.container) : document;
            const elements = getLazyElements(container);
            elements.forEach(loadElement);
        })
        .connect('lazyload-observe', (element, event, data) => {
            const container = data.container ? document.querySelector(data.container) : document;
            observeElements(getLazyElements(container));
        });

    function init() {
        initObserver();
        
        if (config.autoInit) {
            observeElements();
        }

        return this;
    }

    if (config.autoInit) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    return {
        init,
        load: loadElement,
        loadAll: loadAllElements,
        observe: observeElements,
        unobserve: unobserveElements,
        getObservedElements: () => Array.from(observedElements),
        getLazyElements,
        updateConfig: (newConfig) => {
            Object.assign(config, newConfig);
            if (observer) {
                const currentElements = Array.from(observedElements);
                unobserveElements();
                initObserver();
                observeElements(currentElements);
            }
        },
        destroy: () => {
            if (observer) {
                unobserveElements();
                observer.disconnect();
                observer = null;
            }
            observedElements.clear();
            
            domSynapse
                .disconnect('lazyload')
                .disconnect('lazyload-all')
                .disconnect('lazyload-observe');
        }
    };
}

if (typeof window !== 'undefined') {
    window.LazyLoadPlugin = LazyLoadPlugin;
}

export { LazyLoadPlugin };