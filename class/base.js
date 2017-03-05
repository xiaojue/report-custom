import $ from 'jQuery';

let base = ( supperclass ) => class extends supperclass {
    constructor() {
        super();
        this.doc = $(document);
        this.initializeElements();
    }
    bindEvent() {
        this._scanEventsMap(this.eventsMap, true);
    }
    unbindEvent() {
        this._scanEventsMap(this.eventsMap);
    }
    _scanEventsMap(maps, isOn) {
        var delegateEventSplitter = /^(\S+)\s*(.*)$/;
        var bind = isOn ? this._delegate : this._undelegate;
        for (var keys in maps) {
            if (maps.hasOwnProperty(keys)) {
                var matchs = keys.match(delegateEventSplitter);
                bind(matchs[1], matchs[2], maps[keys].bind(this));
            }
        }
    }
    _delegate(name, selector, func) {
        this.doc.on(name, selector, func);
    }
    _undelegate(name, selector, func) {
        this.doc.off(name, selector, func);
    }
    initializeElements(eles) {
        for (var name in eles) {
            if (eles.hasOwnProperty(name)) {
                this[name] = $(eles[name]);
            }
        }
    }
    destroy() {
        this.unbindEvent();
    }
};

export default base;
