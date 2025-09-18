class b {
  #e = /* @__PURE__ */ new Map();
  // хранит обработчики по типам событий: { eventType: { eventName: [handlers] } }
  #n = /* @__PURE__ */ new Map();
  #o = null;
  #t = /* @__PURE__ */ new Map();
  constructor() {
    this.selector = "[data-synapse]", this.#o = this.#r.bind(this);
  }
  connect(i, c, a = "click") {
    if (typeof i != "string" || typeof c != "function")
      return this;
    this.#e.has(a) || this.#e.set(a, /* @__PURE__ */ new Map());
    const l = this.#e.get(a);
    return l.has(i) || l.set(i, []), l.get(i).push(c), this;
  }
  disconnect(i, c = null, a = "click") {
    if (!this.#e.has(a)) return this;
    const l = this.#e.get(a);
    if (!l.has(i)) return this;
    if (!c)
      l.delete(i);
    else {
      const u = l.get(i), f = u.indexOf(c);
      f > -1 && u.splice(f, 1), u.length === 0 && l.delete(i);
    }
    return this;
  }
  #r(i) {
    const c = i.target.closest(this.selector);
    if (!c) return;
    const a = `data-synapse-${i.type}`, l = c.getAttribute(a) || c.getAttribute("data-synapse");
    if (!l || !this.#e.has(i.type)) return;
    const u = this.#e.get(i.type);
    if (!u.has(l)) return;
    const f = u.get(l);
    for (const m of f)
      try {
        m(c, i, c.dataset);
      } catch (v) {
        console.error(`DomSynapse error in "${l}" handler for "${i.type}":`, v);
      }
  }
  #s() {
    document.querySelectorAll("[data-synapse-load]").forEach((c) => {
      const a = c.getAttribute("data-synapse-load");
      if (a && this.#e.has("load")) {
        const l = this.#e.get("load");
        l.has(a) && l.get(a).forEach((f) => {
          try {
            f(c, new Event("load"), c.dataset);
          } catch (m) {
            console.error(`DomSynapse auto-load error in "${a}" handler:`, m);
          }
        });
      }
    });
  }
  observe(i = document, c = ["click"]) {
    this.disconnectAll();
    for (const a of c)
      i.addEventListener(a, this.#o), this.#n.set(a, { root: i, handler: this.#o });
    return document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.#s()) : this.#s(), this;
  }
  observeEvent(i, c = document) {
    return c.addEventListener(i, this.#o), this.#n.set(i, { root: c, handler: this.#o }), this;
  }
  disconnectAll() {
    for (const [i, { root: c, handler: a }] of this.#n)
      c && a && c.removeEventListener(i, a);
    return this.#n.clear(), this;
  }
  disconnectEvent(i) {
    const c = this.#n.get(i);
    return c && c.root && c.handler && (c.root.removeEventListener(i, c.handler), this.#n.delete(i)), this;
  }
  setSelector(i) {
    return typeof i == "string" && (this.selector = i), this;
  }
  getObservedEvents() {
    return Array.from(this.#n.keys());
  }
  isObserving() {
    return this.#n.size > 0;
  }
  use(i, c = {}) {
    if (typeof i != "function")
      return this;
    const a = i.pluginName || i.name || `plugin_${this.#t.size + 1}`;
    if (this.#t.has(a))
      return this;
    try {
      const l = i(this, c);
      this.#t.set(a, l);
    } catch (l) {
      console.error(`DomSynapse: Failed to load plugin "${a}":`, l);
    }
    return this;
  }
  getPlugin(i) {
    return this.#t.get(i);
  }
  removePlugin(i) {
    const c = this.#t.get(i);
    return c && typeof c.destroy == "function" && c.destroy(), this.#t.delete(i), this;
  }
  static get version() {
    return "0.0.1";
  }
  static create() {
    return new b();
  }
}
typeof window < "u" && (window.DomSynapse = b);
function L(y, i = {}) {
  const a = { ...{
    duration: 400,
    durationOut: null,
    easing: "ease-out",
    easingOut: "ease-in",
    fill: "forwards",
    closeOnBackdropClick: !0,
    closeOnEscape: !0,
    preventScroll: !0,
    storageKey: "modal-states",
    onOpen: null,
    onClose: null,
    onBeforeOpen: null,
    onBeforeClose: null,
    animations: {
      open: [
        { opacity: 0, transform: "translateY(30px) scale(0.95)" },
        { opacity: 1, transform: "translateY(0) scale(1)" }
      ],
      close: [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(30px) scale(0.95)" }
      ]
    },
    presets: {
      slideUp: {
        duration: 500,
        animations: {
          open: [
            { opacity: 0, transform: "translateY(-5%)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          close: [
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(-5%)" }
          ]
        }
      },
      slideDown: {
        duration: 400,
        animations: {
          open: [
            { opacity: 0, transform: "translateY(5%)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          close: [
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(5%)" }
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
            { opacity: 0, transform: "scale(0.5)" },
            { opacity: 1, transform: "scale(1)" }
          ],
          close: [
            { opacity: 1, transform: "scale(1)" },
            { opacity: 0, transform: "scale(0.5)" }
          ]
        }
      }
    }
  }, ...i }, l = /* @__PURE__ */ new Map();
  function u() {
    const t = window.pageYOffset || document.documentElement.scrollTop, n = window.pageXOffset || document.documentElement.scrollLeft;
    window.onscroll = function() {
      window.scrollTo(n, t);
    };
  }
  function f() {
    window.onscroll = null;
  }
  function m(t, n) {
    const o = t[n];
    if (o && typeof o == "string")
      try {
        const e = new Function("return " + o)();
        if (typeof e == "function")
          return e;
      } catch (e) {
        console.warn(`ModalPlugin: Invalid callback function "${n}":`, e);
      }
    return null;
  }
  function v(t, n, o = []) {
    if (typeof t == "function")
      try {
        return t.apply(n, o);
      } catch (e) {
        console.error("ModalPlugin: Callback execution error:", e);
      }
    return null;
  }
  function E(t, n = {}) {
    const o = document.getElementById(t);
    if (!o) return { ...a };
    let e = { ...a };
    if (n.onOpen !== void 0 && (e.onOpen = n.onOpen), n.onClose !== void 0 && (e.onClose = n.onClose), n.onBeforeOpen !== void 0 && (e.onBeforeOpen = n.onBeforeOpen), n.onBeforeClose !== void 0 && (e.onBeforeClose = n.onBeforeClose), n.preset && a.presets[n.preset] && (e = { ...e, ...a.presets[n.preset] }), o.dataset.modalDuration && (e.duration = parseInt(o.dataset.modalDuration)), o.dataset.modalOutDuration && (e.durationOut = parseInt(o.dataset.modalOutDuration)), o.dataset.modalEasing && (e.easing = o.dataset.modalEasing), o.dataset.modalOutEasing && (e.easingOut = o.dataset.modalOutEasing), o.dataset.modalFill && (e.fill = o.dataset.modalFill), n.duration && (e.duration = parseInt(n.duration)), n.outDuration && (e.durationOut = parseInt(n.outDuration)), n.easing && (e.easing = n.easing), n.outEasing && (e.easingOut = n.outEasing), n.fill && (e.fill = n.fill), n.preset && a.presets[n.preset] && (e = { ...e, ...a.presets[n.preset] }), o.dataset.modalAnimationOpen)
      try {
        e.animations.open = JSON.parse(o.dataset.modalAnimationOpen);
      } catch (s) {
        console.warn("ModalPlugin: Invalid modal animation open JSON:", s);
      }
    if (o.dataset.modalAnimationClose)
      try {
        e.animations.close = JSON.parse(o.dataset.modalAnimationClose);
      } catch (s) {
        console.warn("ModalPlugin: Invalid modal animation close JSON:", s);
      }
    if (n.animationOpen)
      try {
        e.animations.open = JSON.parse(n.animationOpen);
      } catch (s) {
        console.warn("ModalPlugin: Invalid animation open JSON from trigger:", s);
      }
    if (n.animationClose)
      try {
        e.animations.close = JSON.parse(n.animationClose);
      } catch (s) {
        console.warn("ModalPlugin: Invalid animation close JSON from trigger:", s);
      }
    return e.durationOut === null && (e.durationOut = e.duration - 100), e;
  }
  async function O(t, n, o) {
    const e = o.id || o.modalId;
    if (!e) {
      console.warn("ModalPlugin: No modal ID specified");
      return;
    }
    const s = document.getElementById(e);
    if (!s) {
      console.warn(`ModalPlugin: Modal with ID "${e}" not found`);
      return;
    }
    const r = E(e, o);
    l.set(e, {
      modal: s,
      config: r
    });
    const d = m(o, "onBeforeOpen") || r.onBeforeOpen, h = m(o, "onOpen") || r.onOpen;
    if (d && v(d, null, [s, t, o, r]) === !1)
      return;
    r.preventScroll && u(), s.showModal();
    const w = s.animate(r.animations.open, {
      duration: r.duration,
      easing: r.easing,
      fill: r.fill
    });
    if (r.closeOnBackdropClick) {
      const g = (C) => {
        C.target === s && (p(null, C, { id: e }), s.removeEventListener("click", g));
      };
      s.addEventListener("click", g), l.set(e, { modal: s, handleBackdropClick: g, config: r });
    }
    if (r.closeOnEscape) {
      const g = (C) => {
        C.key === "Escape" && (p(null, C, { id: e }), document.removeEventListener("keydown", g));
      };
      document.addEventListener("keydown", g), l.set(e, { ...l.get(e), handleEscape: g, config: r });
    }
    await w.finished, h && v(h, null, [s, t, o, r]), window.dispatchEvent(new CustomEvent("modal:open", {
      detail: { modalId: e, modal: s, trigger: t, data: o, config: r }
    }));
  }
  async function p(t, n, o) {
    const e = o.id || o.modalId;
    if (!e) return;
    const s = l.get(e);
    if (!s) return;
    const r = s.modal, d = s.config, h = m(o, "onBeforeClose") || d.onBeforeClose, w = m(o, "onClose") || d.onClose;
    if (h && v(h, null, [r, t, o, d]) === !1)
      return;
    const g = r.animate(d.animations.close, {
      duration: d.durationOut,
      easing: d.easingOut,
      fill: d.fill
    });
    d.preventScroll && f(), s && (s.handleBackdropClick && r.removeEventListener("click", s.handleBackdropClick), s.handleEscape && document.removeEventListener("keydown", s.handleEscape), l.delete(e)), await g.finished, r.close(), w && v(w, null, [r, t, o, d]), window.dispatchEvent(new CustomEvent("modal:close", {
      detail: { modalId: e, modal: r, data: o, config: d }
    }));
  }
  return y.connect("modal.open", O).connect("modal.close", p).connect("modal.toggle", (t, n, o) => {
    const e = o.id || o.modalId, s = document.getElementById(e);
    s && s.open ? p(t, n, o) : O(t, n, o);
  }), {
    open: (t, n = {}) => O(null, null, { id: t, ...n }),
    close: (t, n = {}) => p(null, null, { id: t, ...n }),
    toggle: (t, n = {}) => {
      const o = document.getElementById(t);
      o && o.open ? p(null, null, { id: t, ...n }) : O(null, null, { id: t, ...n });
    },
    updateConfig: (t) => {
      Object.assign(a, t);
    },
    addPreset: (t, n) => {
      a.presets[t] = n;
    },
    removePreset: (t) => {
      delete a.presets[t];
    },
    setOnOpen: (t) => {
      a.onOpen = t;
    },
    setOnClose: (t) => {
      a.onClose = t;
    },
    setOnBeforeOpen: (t) => {
      a.onBeforeOpen = t;
    },
    setOnBeforeClose: (t) => {
      a.onBeforeClose = t;
    },
    getConfig: () => ({ ...a }),
    getModalConfig: (t) => E(t),
    getModal: (t) => document.getElementById(t),
    getAllModals: () => Array.from(document.querySelectorAll("dialog")),
    destroy: () => {
      y.disconnect("modal.open").disconnect("modal.close").disconnect("modal.toggle"), l.forEach((t, n) => {
        p(null, null, { id: n });
      });
    }
  };
}
L.pluginName = "ModalPlugin";
typeof window < "u" && (window.ModalPlugin = L);
function M(y, i = {}) {
  const a = { ...{
    rootMargin: "200px 0px",
    threshold: 0.01,
    autoInit: !0,
    selectors: [
      "img[data-src]",
      "img[data-srcset]",
      "source[data-srcset]",
      "iframe[data-src]",
      "video[data-src]",
      "[data-bg]"
    ]
  }, ...i };
  let l = null;
  const u = /* @__PURE__ */ new Set();
  function f(e) {
    if (!(!e || !e.isConnected))
      return e.tagName === "IMG" ? m(e) : v(e);
  }
  function m(e) {
    return new Promise((s) => {
      const r = e.dataset.src, d = e.dataset.srcset;
      if (!r && !d) {
        s(!1);
        return;
      }
      const h = () => {
        e.classList.remove("lazy-loading"), e.classList.add("lazyloaded"), e.dispatchEvent(new CustomEvent("lazyload:complete", {
          detail: { element: e }
        })), g(), s(!0);
      }, w = () => {
        console.warn("LazyLoad: Failed to load image", r || d), e.classList.remove("lazy-loading"), e.classList.add("lazy-error"), g(), s(!1);
      }, g = () => {
        e.removeEventListener("load", h), e.removeEventListener("error", w);
      };
      e.addEventListener("load", h, { once: !0 }), e.addEventListener("error", w, { once: !0 }), r && (e.src = r, delete e.dataset.src), d && (e.srcset = d, delete e.dataset.srcset), e.complete && e.naturalWidth !== 0 && h();
    });
  }
  function v(e) {
    if (e.tagName === "SOURCE" && e.dataset.srcset)
      e.srcset = e.dataset.srcset, delete e.dataset.srcset;
    else if ((e.tagName === "IFRAME" || e.tagName === "VIDEO") && e.dataset.src)
      e.src = e.dataset.src, delete e.dataset.src;
    else if (e.dataset.bg)
      e.style.backgroundImage = `url(${e.dataset.bg})`, delete e.dataset.bg;
    else
      return !1;
    return e.classList.add("lazyloaded"), e.dispatchEvent(new CustomEvent("lazyload:complete", {
      detail: { element: e }
    })), !0;
  }
  function E() {
    if (!l) {
      if (!("IntersectionObserver" in window)) {
        O();
        return;
      }
      l = new IntersectionObserver(async (e, s) => {
        for (const r of e)
          if (r.isIntersecting) {
            const d = r.target;
            await f(d) && (s.unobserve(d), u.delete(d));
          }
      }, {
        rootMargin: a.rootMargin,
        threshold: a.threshold
      });
    }
  }
  function O() {
    p().forEach((s) => {
      f(s), l && l.unobserve(s), u.delete(s);
    });
  }
  function p(e = document) {
    const s = a.selectors.join(", ");
    return Array.from(e.querySelectorAll(s));
  }
  function t(e = null) {
    E(), (e || p()).forEach((r) => {
      u.has(r) || (r.tagName === "IMG" && (r.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjwvc3ZnPg=="), r.classList.add("lazy-loading"), l.observe(r), u.add(r));
    });
  }
  function n(e = null) {
    if (!l) return;
    (e || Array.from(u)).forEach((r) => {
      u.has(r) && (l.unobserve(r), u.delete(r));
    });
  }
  y.connect("lazyload", (e, s, r) => {
    const d = r.target ? document.querySelector(r.target) : e;
    d && f(d);
  }).connect("lazyload-all", (e, s, r) => {
    const d = r.container ? document.querySelector(r.container) : document;
    p(d).forEach(f);
  }).connect("lazyload-observe", (e, s, r) => {
    const d = r.container ? document.querySelector(r.container) : document;
    t(p(d));
  });
  function o() {
    return E(), a.autoInit && t(), this;
  }
  return a.autoInit && (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", o) : o()), {
    init: o,
    load: f,
    loadAll: O,
    observe: t,
    unobserve: n,
    getObservedElements: () => Array.from(u),
    getLazyElements: p,
    updateConfig: (e) => {
      if (Object.assign(a, e), l) {
        const s = Array.from(u);
        n(), E(), t(s);
      }
    },
    destroy: () => {
      l && (n(), l.disconnect(), l = null), u.clear(), y.disconnect("lazyload").disconnect("lazyload-all").disconnect("lazyload-observe");
    }
  };
}
typeof window < "u" && (window.LazyLoadPlugin = M);
b.prototype.useModal = function(y = {}) {
  return this.use(L, y).getPlugin("ModalPlugin");
};
b.prototype.useLazyLoad = function(y = {}) {
  return this.use(M, y).getPlugin("LazyLoadPlugin")?.init();
};
export {
  b as DomSynapse,
  M as LazyLoadPlugin,
  L as ModalPlugin,
  b as default
};
