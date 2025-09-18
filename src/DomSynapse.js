/**
 * DomSynapse v0.0.1 - Declarative DOM event delegation library
 * https://github.com/rx308/dom-synapse
 * MIT Licensed
 */

class DomSynapse {
    #handlers = new Map(); // хранит обработчики по типам событий: { eventType: { eventName: [handlers] } }
    #eventListeners = new Map();
    #boundHandleEvent = null;
    #plugins = new Map();

    constructor() {
        this.selector = '[data-synapse]';
        this.#boundHandleEvent = this.#handleEvent.bind(this);
    }

    connect(eventName, callback, eventType = 'click') {
        if (typeof eventName !== 'string' || typeof callback !== 'function') {
            return this;
        }

        if (!this.#handlers.has(eventType)) {
            this.#handlers.set(eventType, new Map());
        }

        const eventHandlers = this.#handlers.get(eventType);
        
        if (!eventHandlers.has(eventName)) {
            eventHandlers.set(eventName, []);
        }

        eventHandlers.get(eventName).push(callback);
        return this;
    }

    disconnect(eventName, callback = null, eventType = 'click') {
        if (!this.#handlers.has(eventType)) return this;
        
        const eventHandlers = this.#handlers.get(eventType);
        if (!eventHandlers.has(eventName)) return this;
    
        if (!callback) {
            eventHandlers.delete(eventName);
        } else {
            const handlers = eventHandlers.get(eventName);
            const index = handlers.indexOf(callback);

            if (index > -1) handlers.splice(index, 1);
      
            if (handlers.length === 0) {
                eventHandlers.delete(eventName);
            }
        }

        return this;
    }

    #handleEvent(event) {
        const target = event.target.closest(this.selector);
        if (!target) return;

        // Определяем имя события из атрибута, специфичного для типа события
        const eventSpecificAttr = `data-synapse-${event.type}`;
        const eventName = target.getAttribute(eventSpecificAttr) || target.getAttribute('data-synapse');

        if (!eventName || !this.#handlers.has(event.type)) return;
        
        const eventHandlers = this.#handlers.get(event.type);
        if (!eventHandlers.has(eventName)) return;

        const handlers = eventHandlers.get(eventName);
        for (const callback of handlers) {
            try {
                callback(target, event, target.dataset);
            } catch (error) {
                console.error(`DomSynapse error in "${eventName}" handler for "${event.type}":`, error);
            }
        }
    }

    #autoLoadHandlers() {
        const autoLoadElements = document.querySelectorAll('[data-synapse-load]');
        
        autoLoadElements.forEach(element => {
            const eventName = element.getAttribute('data-synapse-load');
            
            if (eventName && this.#handlers.has('load')) {
                const eventHandlers = this.#handlers.get('load');
                if (eventHandlers.has(eventName)) {
                    const handlers = eventHandlers.get(eventName);
                    handlers.forEach(handler => {
                        try {
                            handler(element, new Event('load'), element.dataset);
                        } catch (error) {
                            console.error(`DomSynapse auto-load error in "${eventName}" handler:`, error);
                        }
                    });
                }
            }
        });
    }

    observe(root = document, eventTypes = ['click']) {
        this.disconnectAll();

        for (const eventType of eventTypes) {
            root.addEventListener(eventType, this.#boundHandleEvent);
            this.#eventListeners.set(eventType, { root, handler: this.#boundHandleEvent });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#autoLoadHandlers());
        } else {
            this.#autoLoadHandlers();
        }

        return this;
    }

    observeEvent(eventType, root = document) {
        root.addEventListener(eventType, this.#boundHandleEvent);
        this.#eventListeners.set(eventType, { root, handler: this.#boundHandleEvent });
        
        return this;
    }

    disconnectAll() {
        for (const [eventType, { root, handler }] of this.#eventListeners) {
            if (root && handler) {
                root.removeEventListener(eventType, handler);
            }
        }
    
        this.#eventListeners.clear();
        return this;
    }

    disconnectEvent(eventType) {
        const listener = this.#eventListeners.get(eventType);
        
        if (listener && listener.root && listener.handler) {
            listener.root.removeEventListener(eventType, listener.handler);
            this.#eventListeners.delete(eventType);
        }
        
        return this;
    }

    setSelector(selector) {
        if (typeof selector === 'string') {
            this.selector = selector;
        }
        return this;
    }

    getObservedEvents() {
        return Array.from(this.#eventListeners.keys());
    }

    isObserving() {
        return this.#eventListeners.size > 0;
    }

    use(plugin, options = {}) {
        if (typeof plugin !== 'function') {
            return this;
        }

        const pluginName = plugin.pluginName || plugin.name || `plugin_${this.#plugins.size + 1}`;
        
        if (this.#plugins.has(pluginName)) {
            return this;
        }

        try {
            const pluginInstance = plugin(this, options);
            this.#plugins.set(pluginName, pluginInstance);
        } catch (error) {
            console.error(`DomSynapse: Failed to load plugin "${pluginName}":`, error);
        }

        return this;
    }

    getPlugin(name) {
        return this.#plugins.get(name);
    }

    removePlugin(name) {
        const plugin = this.#plugins.get(name);
        if (plugin && typeof plugin.destroy === 'function') {
            plugin.destroy();
        }
        this.#plugins.delete(name);
        return this;
    }

    static get version() {
        return '0.0.1';
    }

    static create() {
        return new DomSynapse();
    }
}

if (typeof window !== 'undefined') {
    window.DomSynapse = DomSynapse;
}

export default DomSynapse;