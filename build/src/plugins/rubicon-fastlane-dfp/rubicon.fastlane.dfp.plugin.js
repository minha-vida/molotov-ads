"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viewport_1 = require("../../modules/viewport");
var rubicon_fastlane_dfp_adslot_1 = require("./rubicon.fastlane.dfp.adslot");
var logger_1 = require("../../modules/logger");
var autorefresh_1 = require("../../modules/autorefresh");
var RubiconFastlaneDfp = /** @class */ (function () {
    function RubiconFastlaneDfp() {
        this.name = "RubiconFastlaneDfp";
        this.slots = {};
        this.loaded = false;
    }
    RubiconFastlaneDfp.prototype.init = function (options) {
        this.slots = this.getSlots();
        var self = this;
        return new Promise(function (resolve, reject) {
            googletag.cmd.push(function () {
                googletag.pubads().disableInitialLoad();
            });
            rubicontag.cmd.push(function () {
                for (var slotName in self.slots) {
                    if (!self.slots[slotName].rubiconPosition)
                        continue;
                    self.slots[slotName].defineSlot();
                    logger_1.Logger.log(self.name, 'Rubicon ad slot defined: ', self.slots[slotName]);
                }
                for (var item in options.setFPI) {
                    var value = options.setFPI[item];
                    logger_1.Logger.log(self.name, 'targeting FPI', item, 'as', value);
                    rubicontag.setFPI(item, value);
                }
                for (var item in options.setFPV) {
                    var value = options.setFPV[item];
                    logger_1.Logger.log(self.name, 'targeting FPV', item, 'as', value);
                    rubicontag.setFPV(item, value);
                }
                rubicontag.run(function () {
                    if (options.rubicontagRun)
                        options.rubicontagRun();
                    self.refreshAds();
                    self.loaded = true;
                });
                googletag.cmd.push(function () {
                    for (var slotName in self.slots) {
                        self.slots[slotName].defineSlotDoubleclick();
                        logger_1.Logger.log(self.name, 'DFP ad slot defined: ', self.slots[slotName]);
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
                    googletag.enableServices();
                    for (var slotName in self.slots) {
                        googletag.display(self.slots[slotName].name);
                        logger_1.Logger.logWithTime(self.slots[slotName].name, 'started displaying');
                    }
                    self.onScrollRefreshLazyloadedSlots();
                    setTimeout(function () {
                        if (self.loaded)
                            return;
                        self.refreshAds();
                    }, 1500);
                    resolve();
                });
            });
        });
    };
    RubiconFastlaneDfp.prototype.refreshAds = function () {
        for (var slotName in this.slots) {
            var slot = this.slots[slotName];
            if (slot.lazyloadEnabled)
                continue;
            slot.setTargetingForGPTSlot();
            slot.refresh();
        }
    };
    RubiconFastlaneDfp.prototype.onScrollRefreshLazyloadedSlots = function () {
        var self = this;
        window.addEventListener('scroll', function refreshAdsIfItIsInViewport(event) {
            for (var slotName in self.slots) {
                var slot = self.slots[slotName];
                if (slot.lazyloadEnabled && viewport_1.Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
                    slot.setTargetingForGPTSlot();
                    slot.refresh();
                    slot.lazyloadEnabled = false;
                }
            }
        });
    };
    RubiconFastlaneDfp.prototype.autoRefresh = function (slot, options) {
        logger_1.Logger.logWithTime(slot.name, 'started refreshing');
        if (slot.rubiconPosition) {
            rubicontag.cmd.push(function () {
                slot.defineSlot();
                logger_1.Logger.log(self.name, 'Rubicon ad slot defined: ', slot);
                rubicontag.run(function () {
                    slot.setTargetingForGPTSlot();
                    slot.refresh();
                }, { slots: [slot.rubiconAdSlot] });
            });
        }
        else {
            slot.refresh();
        }
    };
    RubiconFastlaneDfp.prototype.getSlots = function () {
        var slots = {};
        for (var slot in window._molotovAds.slots) {
            var el = window._molotovAds.slots[slot].HTMLElement;
            if (!el.dataset.madAdunit && !el.dataset.madRubicon)
                continue;
            slots[el.id] = new rubicon_fastlane_dfp_adslot_1.RubiconFastlaneDfpAdSlot(el);
            window._molotovAds.slots[el.id] = slots[el.id];
        }
        return slots;
    };
    return RubiconFastlaneDfp;
}());
exports.RubiconFastlaneDfp = RubiconFastlaneDfp;
window._molotovAds.loadPlugin(new RubiconFastlaneDfp());
