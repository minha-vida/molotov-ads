"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var smart_adslot_1 = require("../smartadserver/smart.adslot");
var logger_1 = require("../../modules/logger");
var viewport_1 = require("../../modules/viewport");
var autorefresh_1 = require("../../modules/autorefresh");
var SmartPrebidPlugIn = (function () {
    function SmartPrebidPlugIn() {
        this.name = "PrebidSmart";
        this.slots = {};
        this.PREBID_TIMEOUT = 700;
        this.options = {};
    }
    SmartPrebidPlugIn.prototype.init = function (options) {
        var self = this;
        this.slots = this.getSlots();
        this.PREBID_TIMEOUT = options.PREBID_TIMEOUT;
        this.options = options;
        return new Promise(function (resolve, reject) {
            window['sasCallback'] = function (event) {
                logger_1.Logger.logWithTime(sas.info[event].divId, 'finished slot rendering');
                var slot = self.slots[sas.info[event].divId];
                autorefresh_1.AutoRefresh.start(slot, options, self.autoRefresh);
                if (options.sasCallback)
                    options.sasCallback(event);
            };
            pbjs.que.push(function () {
                logger_1.Logger.infoWithTime("Adding adunits to prebid...");
                pbjs.addAdUnits(options.adUnits);
                logger_1.Logger.infoWithTime("Requesting bids...");
                pbjs.requestBids({
                    bidsBackHandler: function (bidResponses) {
                        sendAdserverRequest();
                    }
                });
            });
            setTimeout(function () {
                logger_1.Logger.infoWithTime("Timeout reached, will send ad server request");
                sendAdserverRequest();
            }, options.PREBID_TIMEOUT);
            self.onScrollRefreshLazyloadedSlots();
            function sendAdserverRequest() {
                if (pbjs.adserverRequestSent)
                    return;
                sas.cmd.push(function () {
                    sas.call("onecall", {
                        siteId: options.siteId,
                        pageId: options.pageId,
                        formatId: options.formatId,
                        target: options.target + self.getPbTarget(),
                    });
                });
                logger_1.Logger.infoWithTime("Sending ad server request");
                pbjs.adserverRequestSent = true;
                pbjs.que.push(function () {
                    if (options.sendAllBids) {
                        logger_1.Logger.infoWithTime("Enabling all bids");
                        pbjs.enableSendAllBids();
                    }
                    if (options.logBids) {
                        logger_1.Logger.infoWithTime("Bids returned, listing:");
                        logger_1.Logger.log(pbjs.getAdserverTargeting());
                    }
                    for (var slotName in self.slots) {
                        if (self.slots[slotName].lazyloadOffset) {
                            continue;
                        }
                        self.slots[slotName].render();
                        logger_1.Logger.log(self.name, 'ad slot rendered: ', self.slots[slotName]);
                    }
                    resolve();
                });
            }
        });
    };
    SmartPrebidPlugIn.prototype.getPbTarget = function () {
        var pbjsTargeting = pbjs.getAdserverTargeting();
        var smartTargeting = '';
        for (var unit in pbjsTargeting) {
            for (var b in pbjsTargeting[unit]) {
                if (pbjsTargeting[unit][b] != '') {
                    smartTargeting += unit + '_' + b + '=' + pbjsTargeting[unit][b] + ';';
                }
            }
        }
        return smartTargeting;
    };
    SmartPrebidPlugIn.prototype.onScrollRefreshLazyloadedSlots = function () {
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
    SmartPrebidPlugIn.prototype.autoRefresh = function (slot, options) {
        function getPbTarget() {
            var pbjsTargeting = pbjs.getAdserverTargeting();
            var smartTargeting = '';
            for (var unit in pbjsTargeting) {
                for (var b in pbjsTargeting[unit]) {
                    if (pbjsTargeting[unit][b] != '') {
                        smartTargeting += unit + '_' + b + '=' + pbjsTargeting[unit][b] + ';';
                    }
                }
            }
            return smartTargeting;
        }
        logger_1.Logger.logWithTime(slot.name, 'started refreshing');
        pbjs.que.push(function () {
            pbjs.requestBids({
                timeout: options.PREBID_TIMEOUT,
                adUnitCodes: [slot.smartAdId],
                bidsBackHandler: function () {
                    slot.std({
                        siteId: options.siteId,
                        pageId: options.pageId,
                        formatId: slot.smartAdId,
                        target: options.target + getPbTarget(),
                    });
                }
            });
        });
    };
    SmartPrebidPlugIn.prototype.getSlots = function () {
        var slots = {};
        for (var slot in window._molotovAds.slots) {
            var el = window._molotovAds.slots[slot].HTMLElement;
            if (el.dataset.madAdunit === '')
                continue;
            slots[el.id] = new smart_adslot_1.SmartAdSlot(el);
            window._molotovAds.slots[el.id] = slots[el.id];
        }
        return slots;
    };
    return SmartPrebidPlugIn;
}());
exports.SmartPrebidPlugIn = SmartPrebidPlugIn;
window._molotovAds.loadPlugin(new SmartPrebidPlugIn());
