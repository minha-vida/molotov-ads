"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var doubleclick_adslot_1 = require("./doubleclick.adslot");
var logger_1 = require("../../modules/logger");
var viewport_1 = require("../../modules/viewport");
var autorefresh_1 = require("../../modules/autorefresh");
var DoubleClickPlugIn = /** @class */ (function () {
    function DoubleClickPlugIn() {
        this.name = "DoubleClick";
        this.slots = {};
    }
    DoubleClickPlugIn.prototype.init = function (options) {
        var self = this;
        this.slots = this.getSlots();
        return new Promise(function (resolve, reject) {
            googletag.cmd.push(function () {
                for (var slotName in self.slots) {
                    self.slots[slotName].defineSlot();
                    logger_1.Logger.log(self.name, 'ad slot defined: ', self.slots[slotName]);
                    if (options.sizes[slotName]) {
                        self.slots[slotName].addSizeMapping(options.sizes[slotName]);
                    }
                    if (options.target[slotName]) {
                        self.slots[slotName].addSetTargeting(options.target[slotName]);
                    }
                }
                for (var item in options.customTargets) {
                    var value = options.customTargets[item];
                    logger_1.Logger.log('targeting', item, 'as', value);
                    googletag.pubads().setTargeting(item, [value]);
                }
                googletag.pubads().addEventListener('slotRenderEnded', function (event) {
                    logger_1.Logger.logWithTime(event.slot.getSlotElementId(), 'finished slot rendering');
                    var slot = self.slots[event.slot.getSlotElementId()];
                    autorefresh_1.AutoRefresh.start(slot, options, self.autoRefresh);
                    if (options.onSlotRenderEnded)
                        options.onSlotRenderEnded(event);
                });
                logger_1.Logger.info('enabling services');
                googletag.pubads().disableInitialLoad();
                googletag.enableServices();
                for (var slotName in self.slots) {
                    self.slots[slotName].display();
                    logger_1.Logger.logWithTime(self.slots[slotName].name, 'started displaying');
                }
                self.onScrollRefreshLazyloadedSlots();
                resolve();
            });
        });
    };
    DoubleClickPlugIn.prototype.onScrollRefreshLazyloadedSlots = function () {
        var self = this;
        window.addEventListener('scroll', function refreshAdsIfItIsInViewport(event) {
            for (var slotName in self.slots) {
                var slot = self.slots[slotName];
                if (slot.lazyloadEnabled && viewport_1.Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
                    slot.refresh();
                    slot.lazyloadEnabled = false;
                }
            }
        });
    };
    DoubleClickPlugIn.prototype.autoRefresh = function (slot, options) {
        logger_1.Logger.logWithTime(slot.name, 'started refreshing');
        slot.refresh();
    };
    DoubleClickPlugIn.prototype.getSlots = function () {
        var slots = {};
        for (var slot in window._molotovAds.slots) {
            var el = window._molotovAds.slots[slot].HTMLElement;
            if (el.dataset.madAdunit === '')
                continue;
            slots[el.id] = new doubleclick_adslot_1.DoubleClickAdSlot(el);
            window._molotovAds.slots[el.id] = slots[el.id];
        }
        return slots;
    };
    return DoubleClickPlugIn;
}());
exports.DoubleClickPlugIn = DoubleClickPlugIn;
window._molotovAds.loadPlugin(new DoubleClickPlugIn());
