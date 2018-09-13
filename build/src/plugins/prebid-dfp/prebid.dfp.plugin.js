"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var doubleclick_adslot_1 = require("../doubleclick/doubleclick.adslot");
var logger_1 = require("../../modules/logger");
var viewport_1 = require("../../modules/viewport");
var autorefresh_1 = require("../../modules/autorefresh");
var PrebidDfpPlugIn = /** @class */ (function () {
    function PrebidDfpPlugIn() {
        this.name = "PrebidDfp";
        this.slots = {};
        this.PREBID_TIMEOUT = 3000;
    }
    PrebidDfpPlugIn.prototype.init = function (options) {
        var self = this;
        var refreshSlots = [];
        this.slots = this.getSlots();
        this.PREBID_TIMEOUT = pbjs.getConfig().bidderTimeout;
        return new Promise(function (resolve, reject) {
            googletag.cmd.push(function () {
                googletag.pubads().enableSingleRequest();
                googletag.pubads().disableInitialLoad();
                logger_1.Logger.info('enabling services');
                googletag.enableServices();
            });
            pbjs.que.push(function () {
                logger_1.Logger.infoWithTime("Adding adunits to prebid...");
                pbjs.addAdUnits(options.adUnits);
                logger_1.Logger.infoWithTime("Requesting bids...");
                pbjs.requestBids({
                    adUnitCodes: options.initialAdUnits,
                    bidsBackHandler: sendAdserverRequest
                });
            });
            setTimeout(function () {
                logger_1.Logger.infoWithTime("Timeout reached, will send ad server request");
                sendAdserverRequest();
            }, pbjs.getConfig().bidderTimeout);
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
                    if (options.collapse[slotName]) {
                        self.slots[slotName].addCollapseEmptyDivs(true, true);
                    }
                    else {
                        self.slots[slotName].addCollapseEmptyDivs(true);
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
                    var checkList = true;
                    for (var id in options.disableRotateList.lineItemIds) {
                        if (event.lineItemId == options.disableRotateList.lineItemIds[id]) {
                            checkList = false;
                        }
                    }
                    for (var id in options.disableRotateList.orderIds) {
                        if (event.campaignId == options.disableRotateList.orderIds[id]) {
                            checkList = false;
                        }
                    }
                    if (checkList) {
                        autorefresh_1.AutoRefresh.start(slot, options, self.autoRefresh);
                    }
                    if (options.onSlotRenderEnded) {
                        options.onSlotRenderEnded(event);
                    }
                });
                self.onScrollRefreshLazyloadedSlots(options);
            });
            function sendAdserverRequest() {
                if (pbjs.adserverRequestSent)
                    return;
                logger_1.Logger.infoWithTime("Sending ad server request");
                pbjs.adserverRequestSent = true;
                googletag.cmd.push(function () {
                    pbjs.que.push(function () {
                        logger_1.Logger.infoWithTime("setTargetingForGPTAsync called");
                        pbjs.setTargetingForGPTAsync();
                        if (options.logBids) {
                            logger_1.Logger.infoWithTime("Bids returned, listing:");
                            logger_1.Logger.log(pbjs.getAdserverTargeting());
                        }
                        for (var slotName in self.slots) {
                            self.slots[slotName].display();
                            logger_1.Logger.logWithTime(self.slots[slotName].name, 'started displaying');
                            if (self.slots[slotName].lazyloadEnabled) {
                            }
                            else {
                                refreshSlots.push(self.slots[slotName].doubleclickAdSlot);
                            }
                        }
                        googletag.pubads().refresh(refreshSlots);
                        resolve();
                    });
                });
            }
            document.addEventListener("madSlotLoaded", function (e) {
                var slot = e.detail;
                slot = self.getSingleSlot(slot);
                googletag.cmd.push(function () {
                    for (var slotName in slot) {
                        self.slots[slotName] = slot[slotName];
                        slot[slotName].defineSlot();
                        logger_1.Logger.log(self.name, 'ad slot defined: ', slot[slotName]);
                        if (options.sizes[slotName]) {
                            slot[slotName].addSizeMapping(options.sizes[slotName]);
                        }
                        if (options.target[slotName]) {
                            slot[slotName].addSetTargeting(options.target[slotName]);
                        }
                        if (options.collapse[slotName]) {
                            slot[slotName].addCollapseEmptyDivs(true, true);
                        }
                        else {
                            slot[slotName].addCollapseEmptyDivs(true);
                        }
                        slot[slotName].display();
                        self.autoRefresh(slot[slotName], options);
                    }
                });
            });
        });
    };
    PrebidDfpPlugIn.prototype.onScrollRefreshLazyloadedSlots = function (options) {
        var self = this;
        window.addEventListener('scroll', function refreshAdsIfItIsInViewport(event) {
            var _loop_1 = function (slotName) {
                var slot = self.slots[slotName];
                if (slot.lazyloadEnabled && viewport_1.Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
                    pbjs.que.push(function () {
                        pbjs.requestBids({
                            adUnitCodes: [slot.name],
                            bidsBackHandler: function () {
                                pbjs.setTargetingForGPTAsync([slot.name]);
                                slot.refresh();
                            }
                        });
                    });
                    slot.lazyloadEnabled = false;
                }
            };
            for (var slotName in self.slots) {
                _loop_1(slotName);
            }
        });
    };
    PrebidDfpPlugIn.prototype.autoRefresh = function (slot, options) {
        logger_1.Logger.logWithTime(slot.name, 'started refreshing');
        pbjs.que.push(function () {
            pbjs.requestBids({
                adUnitCodes: [slot.name],
                bidsBackHandler: function () {
                    pbjs.setTargetingForGPTAsync([slot.name]);
                    slot.refresh();
                }
            });
        });
    };
    PrebidDfpPlugIn.prototype.getSingleSlot = function (slot) {
        var slots = {};
        var el = slot.HTMLElement;
        slots[el.id] = new doubleclick_adslot_1.DoubleClickAdSlot(el);
        window._molotovAds.slots[el.id] = slots[el.id];
        return slots;
    };
    PrebidDfpPlugIn.prototype.getSlots = function () {
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
    return PrebidDfpPlugIn;
}());
exports.PrebidDfpPlugIn = PrebidDfpPlugIn;
window._molotovAds.loadPlugin(new PrebidDfpPlugIn());
