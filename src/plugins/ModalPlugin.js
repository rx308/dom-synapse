function ModalPlugin(domSynapse, options = {}) {
    const defaultOptions = {

        duration: 400,
        durationOut: null,
        easing: 'ease-out',
        easingOut: 'ease-in',
        fill: 'forwards',
        closeOnBackdropClick: true,
        closeOnEscape: true,
        preventScroll: true,
        storageKey: 'modal-states',
        onOpen: null,
        onClose: null,
        onBeforeOpen: null,
        onBeforeClose: null,
        
        animations: {
            open: [
                { opacity: 0, transform: 'translateY(30px) scale(0.95)' },
                { opacity: 1, transform: 'translateY(0) scale(1)' }
            ],
            close: [
                { opacity: 1, transform: 'translateY(0) scale(1)' },
                { opacity: 0, transform: 'translateY(30px) scale(0.95)' }
            ]
        },
        
        presets: {
            slideUp: {
                duration: 500,
                animations: {
                    open: [
                        { opacity: 0, transform: 'translateY(-5%)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ],
                    close: [
                        { opacity: 1, transform: 'translateY(0)' },
                        { opacity: 0, transform: 'translateY(-5%)' }
                    ]
                }
            },
            slideDown: {
                duration: 400,
                animations: {
                    open: [
                        { opacity: 0, transform: 'translateY(5%)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ],
                    close: [
                        { opacity: 1, transform: 'translateY(0)' },
                        { opacity: 0, transform: 'translateY(5%)' }
                    ]
                }
            },
            fade: {
                duration: 300,
                animations: {
                    open: [{ opacity: 0 }, { opacity: 1 }],
                    close: [{ opacity: 1 }, { opacity: 0 }]
                }
            },
            scale: {
                duration: 400,
                animations: {
                    open: [
                        { opacity: 0, transform: 'scale(0.5)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ],
                    close: [
                        { opacity: 1, transform: 'scale(1)' },
                        { opacity: 0, transform: 'scale(0.5)' }
                    ]
                }
            }
        }
    };

    const config = { ...defaultOptions, ...options };
    const modals = new Map();

    function disableScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
        window.onscroll = function() {
            window.scrollTo(scrollLeft, scrollTop);
        };
    }

    function enableScroll() {
        window.onscroll = null;
    }

    function getCallbackFromData(data, callbackName) {
        const callbackString = data[callbackName];
        if (callbackString && typeof callbackString === 'string') {
            try {
                const callback = new Function('return ' + callbackString)();
                if (typeof callback === 'function') {
                    return callback;
                }
            } catch (error) {
                console.warn(`ModalPlugin: Invalid callback function "${callbackName}":`, error);
            }
        }
        return null;
    }

    function executeCallback(callback, context, args = []) {
        if (typeof callback === 'function') {
            try {
                return callback.apply(context, args);
            } catch (error) {
                console.error('ModalPlugin: Callback execution error:', error);
            }
        }
        return null;
    }

    function getModalConfig(modalId, data = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) return { ...config };
        
        let modalConfig = { ...config };

        if (data.onOpen !== undefined) modalConfig.onOpen = data.onOpen;
        if (data.onClose !== undefined) modalConfig.onClose = data.onClose;
        if (data.onBeforeOpen !== undefined) modalConfig.onBeforeOpen = data.onBeforeOpen;
        if (data.onBeforeClose !== undefined) modalConfig.onBeforeClose = data.onBeforeClose;
        
        if (data.preset && config.presets[data.preset]) {
            modalConfig = { ...modalConfig, ...config.presets[data.preset] };
        }

        if (modal.dataset.modalDuration) {
            modalConfig.duration = parseInt(modal.dataset.modalDuration);
        }
        if (modal.dataset.modalOutDuration) {
            modalConfig.durationOut = parseInt(modal.dataset.modalOutDuration);
        }
        if (modal.dataset.modalEasing) {
            modalConfig.easing = modal.dataset.modalEasing;
        }
        if (modal.dataset.modalOutEasing) {
            modalConfig.easingOut = modal.dataset.modalOutEasing;
        }
        if (modal.dataset.modalFill) {
            modalConfig.fill = modal.dataset.modalFill;
        }
        
        if (data.duration) modalConfig.duration = parseInt(data.duration);
        if (data.outDuration) modalConfig.durationOut = parseInt(data.outDuration);
        if (data.easing) modalConfig.easing = data.easing;
        if (data.outEasing) modalConfig.easingOut = data.outEasing;
        if (data.fill) modalConfig.fill = data.fill;
        if (data.preset && config.presets[data.preset]) {
            modalConfig = { ...modalConfig, ...config.presets[data.preset] };
        }
        
        if (modal.dataset.modalAnimationOpen) {
            try {
                modalConfig.animations.open = JSON.parse(modal.dataset.modalAnimationOpen);
            } catch (error) {
                console.warn('ModalPlugin: Invalid modal animation open JSON:', error);
            }
        }
        
        if (modal.dataset.modalAnimationClose) {
            try {
                modalConfig.animations.close = JSON.parse(modal.dataset.modalAnimationClose);
            } catch (error) {
                console.warn('ModalPlugin: Invalid modal animation close JSON:', error);
            }
        }
        
        if (data.animationOpen) {
            try {
                modalConfig.animations.open = JSON.parse(data.animationOpen);
            } catch (error) {
                console.warn('ModalPlugin: Invalid animation open JSON from trigger:', error);
            }
        }
        
        if (data.animationClose) {
            try {
                modalConfig.animations.close = JSON.parse(data.animationClose);
            } catch (error) {
                console.warn('ModalPlugin: Invalid animation close JSON from trigger:', error);
            }
        }
        
        if (modalConfig.durationOut === null) {
            modalConfig.durationOut = modalConfig.duration - 100;
        }
        
        return modalConfig;
    }

    async function openModal(element, event, data) {
        const modalId = data.id || data.modalId;
        if (!modalId) {
            console.warn('ModalPlugin: No modal ID specified');
            return;
        }

        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`ModalPlugin: Modal with ID "${modalId}" not found`);
            return;
        }

        const modalConfig = getModalConfig(modalId, data);
        modals.set(modalId, { 
            modal, 
            config: modalConfig,
        });
        
        const onBeforeOpen = getCallbackFromData(data, 'onBeforeOpen') || modalConfig.onBeforeOpen;
        const onOpen = getCallbackFromData(data, 'onOpen') || modalConfig.onOpen;

        if (onBeforeOpen) {
            const shouldContinue = executeCallback(onBeforeOpen, null, [modal, element, data, modalConfig]);
            if (shouldContinue === false) return;
        }

        if (modalConfig.preventScroll) {
            disableScroll();
        }

        modal.showModal();

        const animation = modal.animate(modalConfig.animations.open, {
            duration: modalConfig.duration,
            easing: modalConfig.easing,
            fill: modalConfig.fill
        });

        if (modalConfig.closeOnBackdropClick) {
            const handleBackdropClick = (event) => {
                if (event.target === modal) {
                    closeModal(null, event, { id: modalId });
                    modal.removeEventListener('click', handleBackdropClick);
                }
            };
            modal.addEventListener('click', handleBackdropClick);
            modals.set(modalId, { modal, handleBackdropClick, config: modalConfig });
        }

        if (modalConfig.closeOnEscape) {
            const handleEscape = (event) => {
                if (event.key === 'Escape') {
                    closeModal(null, event, { id: modalId });
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            modals.set(modalId, { ...modals.get(modalId), handleEscape, config: modalConfig });
        }

        await animation.finished;

        if (onOpen) {
            executeCallback(onOpen, null, [modal, element, data, modalConfig]);
        }

        window.dispatchEvent(new CustomEvent('modal:open', { 
            detail: { modalId, modal, trigger: element, data, config: modalConfig } 
        }));
    }

    async function closeModal(element, event, data) {
        const modalId = data.id || data.modalId;
        if (!modalId) return;

        const modalData = modals.get(modalId);
        if (!modalData) return;

        const modal = modalData.modal;
        const modalConfig = modalData.config

        const onBeforeClose = getCallbackFromData(data, 'onBeforeClose') || modalConfig.onBeforeClose;
        const onClose = getCallbackFromData(data, 'onClose') || modalConfig.onClose;

        if (onBeforeClose) {
            const shouldContinue = executeCallback(onBeforeClose, null, [modal, element, data, modalConfig]);
            if (shouldContinue === false) return;
        }

        const anim = modal.animate(modalConfig.animations.close, {
            duration: modalConfig.durationOut,
            easing: modalConfig.easingOut,
            fill: modalConfig.fill
        });

        if (modalConfig.preventScroll) {
            enableScroll();
        }

        if (modalData) {
            if (modalData.handleBackdropClick) {
                modal.removeEventListener('click', modalData.handleBackdropClick);
            }
            if (modalData.handleEscape) {
                document.removeEventListener('keydown', modalData.handleEscape);
            }
            modals.delete(modalId);
        }

        await anim.finished;

        modal.close();

        if (onClose) {
            executeCallback(onClose, null, [modal, element, data, modalConfig]);
        }

        window.dispatchEvent(new CustomEvent('modal:close', { 
            detail: { modalId, modal, data, config: modalConfig } 
        }));
    }

    domSynapse
        .connect('modal.open', openModal)
        .connect('modal.close', closeModal)
        .connect('modal.toggle', (element, event, data) => {
            const modalId = data.id || data.modalId;
            const modal = document.getElementById(modalId);
            if (modal && modal.open) {
                closeModal(element, event, data);
            } else {
                openModal(element, event, data);
            }
        });

    return {
        open: (modalId, customData = {}) => openModal(null, null, { id: modalId, ...customData }),
        close: (modalId, customData = {}) => closeModal(null, null, { id: modalId, ...customData }),
        toggle: (modalId, customData = {}) => {
            const modal = document.getElementById(modalId);
            if (modal && modal.open) {
                closeModal(null, null, { id: modalId, ...customData });
            } else {
                openModal(null, null, { id: modalId, ...customData });
            }
        },
        
        updateConfig: (newConfig) => {
            Object.assign(config, newConfig);
        },
        addPreset: (name, presetConfig) => {
            config.presets[name] = presetConfig;
        },
        removePreset: (name) => {
            delete config.presets[name];
        },
        
        setOnOpen: (callback) => { config.onOpen = callback; },
        setOnClose: (callback) => { config.onClose = callback; },
        setOnBeforeOpen: (callback) => { config.onBeforeOpen = callback; },
        setOnBeforeClose: (callback) => { config.onBeforeClose = callback; },

        getConfig: () => ({ ...config }),
        getModalConfig: (modalId) => getModalConfig(modalId),
        
        getModal: (modalId) => document.getElementById(modalId),
        getAllModals: () => Array.from(document.querySelectorAll('dialog')),
        
        destroy: () => {
            domSynapse
                .disconnect('modal.open')
                .disconnect('modal.close')
                .disconnect('modal.toggle');
            
            modals.forEach((data, modalId) => {
                closeModal(null, null, { id: modalId });
            });
        }
    };
}

ModalPlugin.pluginName = 'ModalPlugin';

if (typeof window !== 'undefined') {
    window.ModalPlugin = ModalPlugin;
}

export { ModalPlugin };