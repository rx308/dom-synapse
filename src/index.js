import DomSynapse from './DomSynapse.js';

import { ModalPlugin } from './plugins/ModalPlugin.js';
import { LazyLoadPlugin } from './plugins/LazyLoadPlugin.js';

DomSynapse.prototype.useModal = function(options = {}) {
    return this.use(ModalPlugin, options).getPlugin('ModalPlugin');
};

DomSynapse.prototype.useLazyLoad = function(options = {}) {
    return this.use(LazyLoadPlugin, options).getPlugin('LazyLoadPlugin')?.init();
};

export { DomSynapse, ModalPlugin, LazyLoadPlugin };
export default DomSynapse;