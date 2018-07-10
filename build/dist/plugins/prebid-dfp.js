(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AdSlot = /** @class */ (function () {
    function AdSlot(HTMLElement) {
        this.HTMLElement = HTMLElement;
        this.lazyloadEnabled = false;
        this.autoRefreshEnabled = false;
        this.autoRefreshCounter = 1;
    }
    return AdSlot;
}());
exports.AdSlot = AdSlot;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var viewport_1 = require("./viewport");
var AutoRefresh;
(function (AutoRefresh) {
    function start(slot, options, refreshFunction) {
        if (options === void 0) { options = {}; }
        if (!slot.autoRefreshEnabled)
            return;
        if (slot.autoRefreshCounter <= slot.autoRefreshLimit) {
            logger_1.Logger.infoWithTime(slot.name, 'refreshing in', slot.autoRefreshTime, 'seconds (', slot.autoRefreshCounter, '/', slot.autoRefreshLimit, ')');
            setTimeout(refreshSlotForAutoRotate, slot.autoRefreshTime * 1000, slot, refreshFunction, options);
            slot.autoRefreshCounter++;
        }
        else {
            slot.autoRefreshEnabled = false;
            logger_1.Logger.infoWithTime(slot.name, 'auto refresh ended');
        }
    }
    AutoRefresh.start = start;
    function refreshSlotForAutoRotate(slot, refreshFunction, options) {
        logger_1.Logger.logWithTime(slot.name, 'starting refresh for auto rotate');
        AutoRefresh.refreshIfViewable(slot, refreshFunction, options);
    }
    function refreshIfViewable(slot, refreshFunction, options) {
        if (document.hidden) {
            logger_1.Logger.logWithTime(slot.name, 'marked for refresh on visibilitychange');
            var visibilityBack = function () {
                AutoRefresh.refreshIfViewable(slot, refreshFunction, options);
                document.removeEventListener('visibilitychange', visibilityBack);
            };
            document.addEventListener('visibilitychange', visibilityBack);
            return;
        }
        var neededViewabilityPercentage = 50;
        if (viewport_1.Viewport.getCurrentViewabilityPercentage(slot.HTMLElement) >= neededViewabilityPercentage) {
            refreshFunction(slot, options);
        }
        else {
            logger_1.Logger.logWithTime(slot.name, 'viewablity lower than 50%, not refreshing');
            var intervalForRefresh = setInterval(function () {
                if (viewport_1.Viewport.getCurrentViewabilityPercentage(slot.HTMLElement) >= neededViewabilityPercentage) {
                    refreshFunction(slot, options);
                    clearInterval(intervalForRefresh);
                }
            }, 5000);
        }
    }
    AutoRefresh.refreshIfViewable = refreshIfViewable;
})(AutoRefresh = exports.AutoRefresh || (exports.AutoRefresh = {}));

},{"./logger":3,"./viewport":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logger;
(function (Logger) {
    var devModeEnabled = location.hash.indexOf('development') >= 0;
    function log() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!devModeEnabled)
            return;
        console.log.apply(console, items);
    }
    Logger.log = log;
    function logWithTime() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        log(getCurrentTimeString(), '->', items.join(' '));
    }
    Logger.logWithTime = logWithTime;
    function info() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!devModeEnabled)
            return;
        console.info.apply(console, items);
    }
    Logger.info = info;
    function infoWithTime() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        info(getCurrentTimeString(), '->', items.join(' '));
    }
    Logger.infoWithTime = infoWithTime;
    function warn() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!devModeEnabled)
            return;
        console.warn.apply(console, items);
    }
    Logger.warn = warn;
    function error() {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!devModeEnabled)
            return;
        console.error.apply(console, items);
    }
    Logger.error = error;
    function consoleWelcomeMessage() {
        if (!devModeEnabled)
            return;
        console.log("%c __       __   ______   _______  \n|  \\     /  \\ /      \\ |       \\ \n| $$\\   /  $$|  $$$$$$\\| $$$$$$$\\\n| $$$\\ /  $$$| $$__| $$| $$  | $$\n| $$$$\\  $$$$| $$    $$| $$  | $$\n| $$\\$$ $$ $$| $$$$$$$$| $$  | $$\n| $$ \\$$$| $$| $$  | $$| $$__/ $$\n| $$  \\$ | $$| $$  | $$| $$    $$\n \\$$      \\$$ \\$$   \\$$ \\$$$$$$$\n\n", "color:red;");
        console.log('%c\nMolotov Ads - Developer Console\n\n', 'color:blue;');
    }
    Logger.consoleWelcomeMessage = consoleWelcomeMessage;
    function getCurrentTimeString() {
        var time = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + '.' + new Date().getMilliseconds();
        return time;
    }
})(Logger = exports.Logger || (exports.Logger = {}));

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Viewport;
(function (Viewport) {
    function isElementInViewport(element, threshold) {
        var rect = element.getBoundingClientRect();
        return (rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom - threshold <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    }
    Viewport.isElementInViewport = isElementInViewport;
    function isElementVisible(element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }
    Viewport.isElementVisible = isElementVisible;
    function getCurrentViewabilityPercentage(element) {
        var rectTop = element.getBoundingClientRect().top;
        var top = rectTop > 0 ? window.innerHeight - rectTop : Math.abs(rectTop);
        var result = top / element.clientHeight;
        result = rectTop > 0 ? result : 1 - result;
        if (result < 0)
            result = 0;
        if (result > 1)
            result = 1;
        return result * 100;
    }
    Viewport.getCurrentViewabilityPercentage = getCurrentViewabilityPercentage;
})(Viewport = exports.Viewport || (exports.Viewport = {}));

},{}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var adslot_1 = require("../../modules/adslot");
var DoubleClickAdSlot = /** @class */ (function (_super) {
    __extends(DoubleClickAdSlot, _super);
    function DoubleClickAdSlot(HTMLElement) {
        var _this = _super.call(this, HTMLElement) || this;
        _this.HTMLElement = HTMLElement;
        var ds = HTMLElement.dataset;
        var size = eval(ds['madSize']);
        _this.adUnit = ds['madAdunit'];
        _this.name = HTMLElement.id;
        _this.size = size;
        _this.isOutOfPage = Boolean(ds['madOutOfPage']);
        _this.autoRefreshTime = Number(ds['madAutoRefreshInSeconds']) || 0;
        _this.autoRefreshLimit = Number(ds['madAutoRefreshLimit']) || 0;
        _this.lazyloadOffset = Number(ds['madLazyloadOffset']);
        _this.autoRefreshEnabled = _this.autoRefreshTime > 0;
        if (_this.lazyloadOffset) {
            _this.lazyloadOffset = _this.lazyloadOffset || 0;
            _this.lazyloadEnabled = true;
        }
        return _this;
    }
    DoubleClickAdSlot.prototype.defineSlot = function () {
        if (this.isOutOfPage) {
            this.doubleclickAdSlot = googletag.defineOutOfPageSlot(this.adUnit, this.name).addService(googletag.pubads());
        }
        else {
            this.doubleclickAdSlot = googletag.defineSlot(this.adUnit, this.size, this.name).addService(googletag.pubads());
        }
    };
    DoubleClickAdSlot.prototype.addSizeMapping = function (sizes) {
        this.doubleclickAdSlot.defineSizeMapping(sizes);
    };
    DoubleClickAdSlot.prototype.addSetTargeting = function (target) {
        this.doubleclickAdSlot.setTargeting('position', target);
    };
    DoubleClickAdSlot.prototype.addCollapseEmptyDivs = function (val1, val2) {
        this.doubleclickAdSlot.setCollapseEmptyDiv(val1, val2);
    };
    DoubleClickAdSlot.prototype.display = function () {
        googletag.display(this.name);
    };
    DoubleClickAdSlot.prototype.refresh = function () {
        googletag.pubads().refresh([this.doubleclickAdSlot]);
    };
    DoubleClickAdSlot.prototype.getDoubleclickAdSlot = function () {
        return this.doubleclickAdSlot;
    };
    return DoubleClickAdSlot;
}(adslot_1.AdSlot));
exports.DoubleClickAdSlot = DoubleClickAdSlot;

},{"../../modules/adslot":1}],6:[function(require,module,exports){
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
        this.PREBID_TIMEOUT = 400;
    }
    PrebidDfpPlugIn.prototype.init = function (options) {
        var self = this;
        var refreshSlots = [];
        this.slots = this.getSlots();
        this.PREBID_TIMEOUT = options.PREBID_TIMEOUT;
        return new Promise(function (resolve, reject) {
            googletag.cmd.push(function () {
                googletag.pubads().enableSingleRequest();
                googletag.pubads().disableInitialLoad();
                logger_1.Logger.info('enabling services');
                googletag.enableServices();
            });
            pbjs.que.push(function () {
                logger_1.Logger.infoWithTime("Set config of prebid");
                pbjs.setConfig({
                    debug: options.debug,
                    priceGranularity: options.granularity,
                    enableSendAllBids: options.sendAllBids,
                    bidderSequence: options.sequence,
                    bidderTimeout: options.PREBID_TIMEOUT,
                    publisherDomain: options.domain,
                    pageOptions: options.pageOptions,
                });
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
            }, options.PREBID_TIMEOUT);
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
                        slot[slotName].refresh();
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

},{"../../modules/autorefresh":2,"../../modules/logger":3,"../../modules/viewport":4,"../doubleclick/doubleclick.adslot":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvZG91YmxlY2xpY2svZG91YmxlY2xpY2suYWRzbG90LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvcHJlYmlkLWRmcC9wcmViaWQuZGZwLnBsdWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIEFkU2xvdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEFkU2xvdChIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXV0b1JlZnJlc2hFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hdXRvUmVmcmVzaENvdW50ZXIgPSAxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEFkU2xvdDtcclxufSgpKTtcclxuZXhwb3J0cy5BZFNsb3QgPSBBZFNsb3Q7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcclxudmFyIHZpZXdwb3J0XzEgPSByZXF1aXJlKFwiLi92aWV3cG9ydFwiKTtcclxudmFyIEF1dG9SZWZyZXNoO1xyXG4oZnVuY3Rpb24gKEF1dG9SZWZyZXNoKSB7XHJcbiAgICBmdW5jdGlvbiBzdGFydChzbG90LCBvcHRpb25zLCByZWZyZXNoRnVuY3Rpb24pIHtcclxuICAgICAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxyXG4gICAgICAgIGlmICghc2xvdC5hdXRvUmVmcmVzaEVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIgPD0gc2xvdC5hdXRvUmVmcmVzaExpbWl0KSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAncmVmcmVzaGluZyBpbicsIHNsb3QuYXV0b1JlZnJlc2hUaW1lLCAnc2Vjb25kcyAoJywgc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIsICcvJywgc2xvdC5hdXRvUmVmcmVzaExpbWl0LCAnKScpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJlZnJlc2hTbG90Rm9yQXV0b1JvdGF0ZSwgc2xvdC5hdXRvUmVmcmVzaFRpbWUgKiAxMDAwLCBzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBzbG90LmF1dG9SZWZyZXNoQ291bnRlcisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2xvdC5hdXRvUmVmcmVzaEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShzbG90Lm5hbWUsICdhdXRvIHJlZnJlc2ggZW5kZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBBdXRvUmVmcmVzaC5zdGFydCA9IHN0YXJ0O1xyXG4gICAgZnVuY3Rpb24gcmVmcmVzaFNsb3RGb3JBdXRvUm90YXRlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbiwgb3B0aW9ucykge1xyXG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGluZyByZWZyZXNoIGZvciBhdXRvIHJvdGF0ZScpO1xyXG4gICAgICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbiwgb3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdtYXJrZWQgZm9yIHJlZnJlc2ggb24gdmlzaWJpbGl0eWNoYW5nZScpO1xyXG4gICAgICAgICAgICB2YXIgdmlzaWJpbGl0eUJhY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlCYWNrKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlCYWNrKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlID0gNTA7XHJcbiAgICAgICAgaWYgKHZpZXdwb3J0XzEuVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShzbG90LkhUTUxFbGVtZW50KSA+PSBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgcmVmcmVzaEZ1bmN0aW9uKHNsb3QsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNsb3QubmFtZSwgJ3ZpZXdhYmxpdHkgbG93ZXIgdGhhbiA1MCUsIG5vdCByZWZyZXNoaW5nJyk7XHJcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbEZvclJlZnJlc2ggPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmlld3BvcnRfMS5WaWV3cG9ydC5nZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKHNsb3QuSFRNTEVsZW1lbnQpID49IG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZnJlc2hGdW5jdGlvbihzbG90LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsRm9yUmVmcmVzaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDUwMDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlID0gcmVmcmVzaElmVmlld2FibGU7XHJcbn0pKEF1dG9SZWZyZXNoID0gZXhwb3J0cy5BdXRvUmVmcmVzaCB8fCAoZXhwb3J0cy5BdXRvUmVmcmVzaCA9IHt9KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBMb2dnZXI7XHJcbihmdW5jdGlvbiAoTG9nZ2VyKSB7XHJcbiAgICB2YXIgZGV2TW9kZUVuYWJsZWQgPSBsb2NhdGlvbi5oYXNoLmluZGV4T2YoJ2RldmVsb3BtZW50JykgPj0gMDtcclxuICAgIGZ1bmN0aW9uIGxvZygpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgaXRlbXMpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmxvZyA9IGxvZztcclxuICAgIGZ1bmN0aW9uIGxvZ1dpdGhUaW1lKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxvZyhnZXRDdXJyZW50VGltZVN0cmluZygpLCAnLT4nLCBpdGVtcy5qb2luKCcgJykpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmxvZ1dpdGhUaW1lID0gbG9nV2l0aFRpbWU7XHJcbiAgICBmdW5jdGlvbiBpbmZvKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmluZm8uYXBwbHkoY29uc29sZSwgaXRlbXMpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmluZm8gPSBpbmZvO1xyXG4gICAgZnVuY3Rpb24gaW5mb1dpdGhUaW1lKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZm8oZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSwgJy0+JywgaXRlbXMuam9pbignICcpKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5pbmZvV2l0aFRpbWUgPSBpbmZvV2l0aFRpbWU7XHJcbiAgICBmdW5jdGlvbiB3YXJuKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLndhcm4uYXBwbHkoY29uc29sZSwgaXRlbXMpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLndhcm4gPSB3YXJuO1xyXG4gICAgZnVuY3Rpb24gZXJyb3IoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkoY29uc29sZSwgaXRlbXMpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmVycm9yID0gZXJyb3I7XHJcbiAgICBmdW5jdGlvbiBjb25zb2xlV2VsY29tZU1lc3NhZ2UoKSB7XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiJWMgX18gICAgICAgX18gICBfX19fX18gICBfX19fX19fICBcXG58ICBcXFxcICAgICAvICBcXFxcIC8gICAgICBcXFxcIHwgICAgICAgXFxcXCBcXG58ICQkXFxcXCAgIC8gICQkfCAgJCQkJCQkXFxcXHwgJCQkJCQkJFxcXFxcXG58ICQkJFxcXFwgLyAgJCQkfCAkJF9ffCAkJHwgJCQgIHwgJCRcXG58ICQkJCRcXFxcICAkJCQkfCAkJCAgICAkJHwgJCQgIHwgJCRcXG58ICQkXFxcXCQkICQkICQkfCAkJCQkJCQkJHwgJCQgIHwgJCRcXG58ICQkIFxcXFwkJCR8ICQkfCAkJCAgfCAkJHwgJCRfXy8gJCRcXG58ICQkICBcXFxcJCB8ICQkfCAkJCAgfCAkJHwgJCQgICAgJCRcXG4gXFxcXCQkICAgICAgXFxcXCQkIFxcXFwkJCAgIFxcXFwkJCBcXFxcJCQkJCQkJFxcblxcblwiLCBcImNvbG9yOnJlZDtcIik7XHJcbiAgICAgICAgY29uc29sZS5sb2coJyVjXFxuTW9sb3RvdiBBZHMgLSBEZXZlbG9wZXIgQ29uc29sZVxcblxcbicsICdjb2xvcjpibHVlOycpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmNvbnNvbGVXZWxjb21lTWVzc2FnZSA9IGNvbnNvbGVXZWxjb21lTWVzc2FnZTtcclxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRUaW1lU3RyaW5nKCkge1xyXG4gICAgICAgIHZhciB0aW1lID0gbmV3IERhdGUoKS5nZXRIb3VycygpICsgJzonICsgbmV3IERhdGUoKS5nZXRNaW51dGVzKCkgKyAnOicgKyBuZXcgRGF0ZSgpLmdldFNlY29uZHMoKSArICcuJyArIG5ldyBEYXRlKCkuZ2V0TWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgcmV0dXJuIHRpbWU7XHJcbiAgICB9XHJcbn0pKExvZ2dlciA9IGV4cG9ydHMuTG9nZ2VyIHx8IChleHBvcnRzLkxvZ2dlciA9IHt9KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBWaWV3cG9ydDtcclxuKGZ1bmN0aW9uIChWaWV3cG9ydCkge1xyXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50SW5WaWV3cG9ydChlbGVtZW50LCB0aHJlc2hvbGQpIHtcclxuICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgcmV0dXJuIChyZWN0LnRvcCA+PSAwICYmXHJcbiAgICAgICAgICAgIHJlY3QubGVmdCA+PSAwICYmXHJcbiAgICAgICAgICAgIHJlY3QuYm90dG9tIC0gdGhyZXNob2xkIDw9ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkgJiZcclxuICAgICAgICAgICAgcmVjdC5yaWdodCA8PSAod2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSk7XHJcbiAgICB9XHJcbiAgICBWaWV3cG9ydC5pc0VsZW1lbnRJblZpZXdwb3J0ID0gaXNFbGVtZW50SW5WaWV3cG9ydDtcclxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudFZpc2libGUoZWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiAhIShlbGVtZW50Lm9mZnNldFdpZHRoIHx8IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgVmlld3BvcnQuaXNFbGVtZW50VmlzaWJsZSA9IGlzRWxlbWVudFZpc2libGU7XHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgcmVjdFRvcCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgICAgIHZhciB0b3AgPSByZWN0VG9wID4gMCA/IHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3RUb3AgOiBNYXRoLmFicyhyZWN0VG9wKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdG9wIC8gZWxlbWVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgcmVzdWx0ID0gcmVjdFRvcCA+IDAgPyByZXN1bHQgOiAxIC0gcmVzdWx0O1xyXG4gICAgICAgIGlmIChyZXN1bHQgPCAwKVxyXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xyXG4gICAgICAgIGlmIChyZXN1bHQgPiAxKVxyXG4gICAgICAgICAgICByZXN1bHQgPSAxO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQgKiAxMDA7XHJcbiAgICB9XHJcbiAgICBWaWV3cG9ydC5nZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlID0gZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZTtcclxufSkoVmlld3BvcnQgPSBleHBvcnRzLlZpZXdwb3J0IHx8IChleHBvcnRzLlZpZXdwb3J0ID0ge30pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBhZHNsb3RfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2Fkc2xvdFwiKTtcclxudmFyIERvdWJsZUNsaWNrQWRTbG90ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKERvdWJsZUNsaWNrQWRTbG90LCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gRG91YmxlQ2xpY2tBZFNsb3QoSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBIVE1MRWxlbWVudCkgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5IVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHZhciBkcyA9IEhUTUxFbGVtZW50LmRhdGFzZXQ7XHJcbiAgICAgICAgdmFyIHNpemUgPSBldmFsKGRzWydtYWRTaXplJ10pO1xyXG4gICAgICAgIF90aGlzLmFkVW5pdCA9IGRzWydtYWRBZHVuaXQnXTtcclxuICAgICAgICBfdGhpcy5uYW1lID0gSFRNTEVsZW1lbnQuaWQ7XHJcbiAgICAgICAgX3RoaXMuc2l6ZSA9IHNpemU7XHJcbiAgICAgICAgX3RoaXMuaXNPdXRPZlBhZ2UgPSBCb29sZWFuKGRzWydtYWRPdXRPZlBhZ2UnXSk7XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hUaW1lID0gTnVtYmVyKGRzWydtYWRBdXRvUmVmcmVzaEluU2Vjb25kcyddKSB8fCAwO1xyXG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoTGltaXQgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoTGltaXQnXSkgfHwgMDtcclxuICAgICAgICBfdGhpcy5sYXp5bG9hZE9mZnNldCA9IE51bWJlcihkc1snbWFkTGF6eWxvYWRPZmZzZXQnXSk7XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hFbmFibGVkID0gX3RoaXMuYXV0b1JlZnJlc2hUaW1lID4gMDtcclxuICAgICAgICBpZiAoX3RoaXMubGF6eWxvYWRPZmZzZXQpIHtcclxuICAgICAgICAgICAgX3RoaXMubGF6eWxvYWRPZmZzZXQgPSBfdGhpcy5sYXp5bG9hZE9mZnNldCB8fCAwO1xyXG4gICAgICAgICAgICBfdGhpcy5sYXp5bG9hZEVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuZGVmaW5lU2xvdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5pc091dE9mUGFnZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90ID0gZ29vZ2xldGFnLmRlZmluZU91dE9mUGFnZVNsb3QodGhpcy5hZFVuaXQsIHRoaXMubmFtZSkuYWRkU2VydmljZShnb29nbGV0YWcucHViYWRzKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kb3VibGVjbGlja0FkU2xvdCA9IGdvb2dsZXRhZy5kZWZpbmVTbG90KHRoaXMuYWRVbml0LCB0aGlzLnNpemUsIHRoaXMubmFtZSkuYWRkU2VydmljZShnb29nbGV0YWcucHViYWRzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuYWRkU2l6ZU1hcHBpbmcgPSBmdW5jdGlvbiAoc2l6ZXMpIHtcclxuICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90LmRlZmluZVNpemVNYXBwaW5nKHNpemVzKTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuYWRkU2V0VGFyZ2V0aW5nID0gZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgIHRoaXMuZG91YmxlY2xpY2tBZFNsb3Quc2V0VGFyZ2V0aW5nKCdwb3NpdGlvbicsIHRhcmdldCk7XHJcbiAgICB9O1xyXG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLmFkZENvbGxhcHNlRW1wdHlEaXZzID0gZnVuY3Rpb24gKHZhbDEsIHZhbDIpIHtcclxuICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90LnNldENvbGxhcHNlRW1wdHlEaXYodmFsMSwgdmFsMik7XHJcbiAgICB9O1xyXG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLmRpc3BsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZ29vZ2xldGFnLmRpc3BsYXkodGhpcy5uYW1lKTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBnb29nbGV0YWcucHViYWRzKCkucmVmcmVzaChbdGhpcy5kb3VibGVjbGlja0FkU2xvdF0pO1xyXG4gICAgfTtcclxuICAgIERvdWJsZUNsaWNrQWRTbG90LnByb3RvdHlwZS5nZXREb3VibGVjbGlja0FkU2xvdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kb3VibGVjbGlja0FkU2xvdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gRG91YmxlQ2xpY2tBZFNsb3Q7XHJcbn0oYWRzbG90XzEuQWRTbG90KSk7XHJcbmV4cG9ydHMuRG91YmxlQ2xpY2tBZFNsb3QgPSBEb3VibGVDbGlja0FkU2xvdDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGRvdWJsZWNsaWNrX2Fkc2xvdF8xID0gcmVxdWlyZShcIi4uL2RvdWJsZWNsaWNrL2RvdWJsZWNsaWNrLmFkc2xvdFwiKTtcclxudmFyIGxvZ2dlcl8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvbG9nZ2VyXCIpO1xyXG52YXIgdmlld3BvcnRfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL3ZpZXdwb3J0XCIpO1xyXG52YXIgYXV0b3JlZnJlc2hfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2F1dG9yZWZyZXNoXCIpO1xyXG52YXIgUHJlYmlkRGZwUGx1Z0luID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUHJlYmlkRGZwUGx1Z0luKCkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiUHJlYmlkRGZwXCI7XHJcbiAgICAgICAgdGhpcy5zbG90cyA9IHt9O1xyXG4gICAgICAgIHRoaXMuUFJFQklEX1RJTUVPVVQgPSA0MDA7XHJcbiAgICB9XHJcbiAgICBQcmViaWREZnBQbHVnSW4ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgcmVmcmVzaFNsb3RzID0gW107XHJcbiAgICAgICAgdGhpcy5zbG90cyA9IHRoaXMuZ2V0U2xvdHMoKTtcclxuICAgICAgICB0aGlzLlBSRUJJRF9USU1FT1VUID0gb3B0aW9ucy5QUkVCSURfVElNRU9VVDtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBnb29nbGV0YWcuY21kLnB1c2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLnB1YmFkcygpLmVuYWJsZVNpbmdsZVJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5kaXNhYmxlSW5pdGlhbExvYWQoKTtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvKCdlbmFibGluZyBzZXJ2aWNlcycpO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLmVuYWJsZVNlcnZpY2VzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBwYmpzLnF1ZS5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJTZXQgY29uZmlnIG9mIHByZWJpZFwiKTtcclxuICAgICAgICAgICAgICAgIHBianMuc2V0Q29uZmlnKHtcclxuICAgICAgICAgICAgICAgICAgICBkZWJ1Zzogb3B0aW9ucy5kZWJ1ZyxcclxuICAgICAgICAgICAgICAgICAgICBwcmljZUdyYW51bGFyaXR5OiBvcHRpb25zLmdyYW51bGFyaXR5LFxyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZVNlbmRBbGxCaWRzOiBvcHRpb25zLnNlbmRBbGxCaWRzLFxyXG4gICAgICAgICAgICAgICAgICAgIGJpZGRlclNlcXVlbmNlOiBvcHRpb25zLnNlcXVlbmNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGJpZGRlclRpbWVvdXQ6IG9wdGlvbnMuUFJFQklEX1RJTUVPVVQsXHJcbiAgICAgICAgICAgICAgICAgICAgcHVibGlzaGVyRG9tYWluOiBvcHRpb25zLmRvbWFpbixcclxuICAgICAgICAgICAgICAgICAgICBwYWdlT3B0aW9uczogb3B0aW9ucy5wYWdlT3B0aW9ucyxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShcIkFkZGluZyBhZHVuaXRzIHRvIHByZWJpZC4uLlwiKTtcclxuICAgICAgICAgICAgICAgIHBianMuYWRkQWRVbml0cyhvcHRpb25zLmFkVW5pdHMpO1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShcIlJlcXVlc3RpbmcgYmlkcy4uLlwiKTtcclxuICAgICAgICAgICAgICAgIHBianMucmVxdWVzdEJpZHMoe1xyXG4gICAgICAgICAgICAgICAgICAgIGFkVW5pdENvZGVzOiBvcHRpb25zLmluaXRpYWxBZFVuaXRzLFxyXG4gICAgICAgICAgICAgICAgICAgIGJpZHNCYWNrSGFuZGxlcjogc2VuZEFkc2VydmVyUmVxdWVzdFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJUaW1lb3V0IHJlYWNoZWQsIHdpbGwgc2VuZCBhZCBzZXJ2ZXIgcmVxdWVzdFwiKTtcclxuICAgICAgICAgICAgICAgIHNlbmRBZHNlcnZlclJlcXVlc3QoKTtcclxuICAgICAgICAgICAgfSwgb3B0aW9ucy5QUkVCSURfVElNRU9VVCk7XHJcbiAgICAgICAgICAgIGdvb2dsZXRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zbG90c1tzbG90TmFtZV0uZGVmaW5lU2xvdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2coc2VsZi5uYW1lLCAnYWQgc2xvdCBkZWZpbmVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2l6ZXNbc2xvdE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmFkZFNpemVNYXBwaW5nKG9wdGlvbnMuc2l6ZXNbc2xvdE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudGFyZ2V0W3Nsb3ROYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNsb3RzW3Nsb3ROYW1lXS5hZGRTZXRUYXJnZXRpbmcob3B0aW9ucy50YXJnZXRbc2xvdE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29sbGFwc2Vbc2xvdE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmFkZENvbGxhcHNlRW1wdHlEaXZzKHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zbG90c1tzbG90TmFtZV0uYWRkQ29sbGFwc2VFbXB0eURpdnModHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvcHRpb25zLmN1c3RvbVRhcmdldHMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvcHRpb25zLmN1c3RvbVRhcmdldHNbaXRlbV07XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZygndGFyZ2V0aW5nJywgaXRlbSwgJ2FzJywgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5zZXRUYXJnZXRpbmcoaXRlbSwgW3ZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBnb29nbGV0YWcucHViYWRzKCkuYWRkRXZlbnRMaXN0ZW5lcignc2xvdFJlbmRlckVuZGVkJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKGV2ZW50LnNsb3QuZ2V0U2xvdEVsZW1lbnRJZCgpLCAnZmluaXNoZWQgc2xvdCByZW5kZXJpbmcnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2xvdCA9IHNlbGYuc2xvdHNbZXZlbnQuc2xvdC5nZXRTbG90RWxlbWVudElkKCldO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGVja0xpc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGlkIGluIG9wdGlvbnMuZGlzYWJsZVJvdGF0ZUxpc3QubGluZUl0ZW1JZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmxpbmVJdGVtSWQgPT0gb3B0aW9ucy5kaXNhYmxlUm90YXRlTGlzdC5saW5lSXRlbUlkc1tpZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrTGlzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGlkIGluIG9wdGlvbnMuZGlzYWJsZVJvdGF0ZUxpc3Qub3JkZXJJZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNhbXBhaWduSWQgPT0gb3B0aW9ucy5kaXNhYmxlUm90YXRlTGlzdC5vcmRlcklkc1tpZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrTGlzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja0xpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b3JlZnJlc2hfMS5BdXRvUmVmcmVzaC5zdGFydChzbG90LCBvcHRpb25zLCBzZWxmLmF1dG9SZWZyZXNoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TbG90UmVuZGVyRW5kZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNsb3RSZW5kZXJFbmRlZChldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cyhvcHRpb25zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNlbmRBZHNlcnZlclJlcXVlc3QoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGJqcy5hZHNlcnZlclJlcXVlc3RTZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJTZW5kaW5nIGFkIHNlcnZlciByZXF1ZXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgcGJqcy5hZHNlcnZlclJlcXVlc3RTZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGJqcy5xdWUucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJzZXRUYXJnZXRpbmdGb3JHUFRBc3luYyBjYWxsZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBianMuc2V0VGFyZ2V0aW5nRm9yR1BUQXN5bmMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMubG9nQmlkcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShcIkJpZHMgcmV0dXJuZWQsIGxpc3Rpbmc6XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhwYmpzLmdldEFkc2VydmVyVGFyZ2V0aW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHNsb3ROYW1lIGluIHNlbGYuc2xvdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmRpc3BsYXkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzZWxmLnNsb3RzW3Nsb3ROYW1lXS5uYW1lLCAnc3RhcnRlZCBkaXNwbGF5aW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5zbG90c1tzbG90TmFtZV0ubGF6eWxvYWRFbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZyZXNoU2xvdHMucHVzaChzZWxmLnNsb3RzW3Nsb3ROYW1lXS5kb3VibGVjbGlja0FkU2xvdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xldGFnLnB1YmFkcygpLnJlZnJlc2gocmVmcmVzaFNsb3RzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1hZFNsb3RMb2FkZWRcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzbG90ID0gZS5kZXRhaWw7XHJcbiAgICAgICAgICAgICAgICBzbG90ID0gc2VsZi5nZXRTaW5nbGVTbG90KHNsb3QpO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLmNtZC5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzbG90KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdID0gc2xvdFtzbG90TmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsb3Rbc2xvdE5hbWVdLmRlZmluZVNsb3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdhZCBzbG90IGRlZmluZWQ6ICcsIHNsb3Rbc2xvdE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2l6ZXNbc2xvdE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbG90W3Nsb3ROYW1lXS5hZGRTaXplTWFwcGluZyhvcHRpb25zLnNpemVzW3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudGFyZ2V0W3Nsb3ROYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2xvdFtzbG90TmFtZV0uYWRkU2V0VGFyZ2V0aW5nKG9wdGlvbnMudGFyZ2V0W3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29sbGFwc2Vbc2xvdE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbG90W3Nsb3ROYW1lXS5hZGRDb2xsYXBzZUVtcHR5RGl2cyh0cnVlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsb3Rbc2xvdE5hbWVdLmFkZENvbGxhcHNlRW1wdHlEaXZzKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsb3Rbc2xvdE5hbWVdLmRpc3BsYXkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2xvdFtzbG90TmFtZV0ucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBQcmViaWREZnBQbHVnSW4ucHJvdG90eXBlLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbiByZWZyZXNoQWRzSWZJdElzSW5WaWV3cG9ydChldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChzbG90TmFtZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNsb3QgPSBzZWxmLnNsb3RzW3Nsb3ROYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChzbG90Lmxhenlsb2FkRW5hYmxlZCAmJiB2aWV3cG9ydF8xLlZpZXdwb3J0LmlzRWxlbWVudEluVmlld3BvcnQoc2xvdC5IVE1MRWxlbWVudCwgc2xvdC5sYXp5bG9hZE9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYmpzLnF1ZS5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGJqcy5yZXF1ZXN0Qmlkcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZFVuaXRDb2RlczogW3Nsb3QubmFtZV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaWRzQmFja0hhbmRsZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYmpzLnNldFRhcmdldGluZ0ZvckdQVEFzeW5jKFtzbG90Lm5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbG90LnJlZnJlc2goKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5sYXp5bG9hZEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gc2VsZi5zbG90cykge1xyXG4gICAgICAgICAgICAgICAgX2xvb3BfMShzbG90TmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBQcmViaWREZnBQbHVnSW4ucHJvdG90eXBlLmF1dG9SZWZyZXNoID0gZnVuY3Rpb24gKHNsb3QsIG9wdGlvbnMpIHtcclxuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnc3RhcnRlZCByZWZyZXNoaW5nJyk7XHJcbiAgICAgICAgcGJqcy5xdWUucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHBianMucmVxdWVzdEJpZHMoe1xyXG4gICAgICAgICAgICAgICAgYWRVbml0Q29kZXM6IFtzbG90Lm5hbWVdLFxyXG4gICAgICAgICAgICAgICAgYmlkc0JhY2tIYW5kbGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGJqcy5zZXRUYXJnZXRpbmdGb3JHUFRBc3luYyhbc2xvdC5uYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5yZWZyZXNoKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFByZWJpZERmcFBsdWdJbi5wcm90b3R5cGUuZ2V0U2luZ2xlU2xvdCA9IGZ1bmN0aW9uIChzbG90KSB7XHJcbiAgICAgICAgdmFyIHNsb3RzID0ge307XHJcbiAgICAgICAgdmFyIGVsID0gc2xvdC5IVE1MRWxlbWVudDtcclxuICAgICAgICBzbG90c1tlbC5pZF0gPSBuZXcgZG91YmxlY2xpY2tfYWRzbG90XzEuRG91YmxlQ2xpY2tBZFNsb3QoZWwpO1xyXG4gICAgICAgIHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tlbC5pZF0gPSBzbG90c1tlbC5pZF07XHJcbiAgICAgICAgcmV0dXJuIHNsb3RzO1xyXG4gICAgfTtcclxuICAgIFByZWJpZERmcFBsdWdJbi5wcm90b3R5cGUuZ2V0U2xvdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNsb3RzID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgc2xvdCBpbiB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHMpIHtcclxuICAgICAgICAgICAgdmFyIGVsID0gd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW3Nsb3RdLkhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICBpZiAoZWwuZGF0YXNldC5tYWRBZHVuaXQgPT09ICcnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIHNsb3RzW2VsLmlkXSA9IG5ldyBkb3VibGVjbGlja19hZHNsb3RfMS5Eb3VibGVDbGlja0FkU2xvdChlbCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tlbC5pZF0gPSBzbG90c1tlbC5pZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzbG90cztcclxuICAgIH07XHJcbiAgICByZXR1cm4gUHJlYmlkRGZwUGx1Z0luO1xyXG59KCkpO1xyXG5leHBvcnRzLlByZWJpZERmcFBsdWdJbiA9IFByZWJpZERmcFBsdWdJbjtcclxud2luZG93Ll9tb2xvdG92QWRzLmxvYWRQbHVnaW4obmV3IFByZWJpZERmcFBsdWdJbigpKTtcclxuIl19
