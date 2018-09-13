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
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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

},{"../../modules/autorefresh":2,"../../modules/logger":3,"../../modules/viewport":4,"../doubleclick/doubleclick.adslot":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvZG91YmxlY2xpY2svZG91YmxlY2xpY2suYWRzbG90LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvcHJlYmlkLWRmcC9wcmViaWQuZGZwLnBsdWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBBZFNsb3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBBZFNsb3QoSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5sYXp5bG9hZEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmF1dG9SZWZyZXNoRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXV0b1JlZnJlc2hDb3VudGVyID0gMTtcclxuICAgIH1cclxuICAgIHJldHVybiBBZFNsb3Q7XHJcbn0oKSk7XHJcbmV4cG9ydHMuQWRTbG90ID0gQWRTbG90O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XHJcbnZhciB2aWV3cG9ydF8xID0gcmVxdWlyZShcIi4vdmlld3BvcnRcIik7XHJcbnZhciBBdXRvUmVmcmVzaDtcclxuKGZ1bmN0aW9uIChBdXRvUmVmcmVzaCkge1xyXG4gICAgZnVuY3Rpb24gc3RhcnQoc2xvdCwgb3B0aW9ucywgcmVmcmVzaEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cclxuICAgICAgICBpZiAoIXNsb3QuYXV0b1JlZnJlc2hFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyIDw9IHNsb3QuYXV0b1JlZnJlc2hMaW1pdCkge1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKHNsb3QubmFtZSwgJ3JlZnJlc2hpbmcgaW4nLCBzbG90LmF1dG9SZWZyZXNoVGltZSwgJ3NlY29uZHMgKCcsIHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyLCAnLycsIHNsb3QuYXV0b1JlZnJlc2hMaW1pdCwgJyknKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChyZWZyZXNoU2xvdEZvckF1dG9Sb3RhdGUsIHNsb3QuYXV0b1JlZnJlc2hUaW1lICogMTAwMCwgc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNsb3QuYXV0b1JlZnJlc2hFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAnYXV0byByZWZyZXNoIGVuZGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQXV0b1JlZnJlc2guc3RhcnQgPSBzdGFydDtcclxuICAgIGZ1bmN0aW9uIHJlZnJlc2hTbG90Rm9yQXV0b1JvdGF0ZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpIHtcclxuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnc3RhcnRpbmcgcmVmcmVzaCBmb3IgYXV0byByb3RhdGUnKTtcclxuICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmhpZGRlbikge1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnbWFya2VkIGZvciByZWZyZXNoIG9uIHZpc2liaWxpdHljaGFuZ2UnKTtcclxuICAgICAgICAgICAgdmFyIHZpc2liaWxpdHlCYWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgQXV0b1JlZnJlc2gucmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSA9IDUwO1xyXG4gICAgICAgIGlmICh2aWV3cG9ydF8xLlZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2Uoc2xvdC5IVE1MRWxlbWVudCkgPj0gbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIHJlZnJlc2hGdW5jdGlvbihzbG90LCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICd2aWV3YWJsaXR5IGxvd2VyIHRoYW4gNTAlLCBub3QgcmVmcmVzaGluZycpO1xyXG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWxGb3JSZWZyZXNoID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZpZXdwb3J0XzEuVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShzbG90LkhUTUxFbGVtZW50KSA+PSBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZyZXNoRnVuY3Rpb24oc2xvdCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEZvclJlZnJlc2gpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCA1MDAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZSA9IHJlZnJlc2hJZlZpZXdhYmxlO1xyXG59KShBdXRvUmVmcmVzaCA9IGV4cG9ydHMuQXV0b1JlZnJlc2ggfHwgKGV4cG9ydHMuQXV0b1JlZnJlc2ggPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgTG9nZ2VyO1xyXG4oZnVuY3Rpb24gKExvZ2dlcikge1xyXG4gICAgdmFyIGRldk1vZGVFbmFibGVkID0gbG9jYXRpb24uaGFzaC5pbmRleE9mKCdkZXZlbG9wbWVudCcpID49IDA7XHJcbiAgICBmdW5jdGlvbiBsb2coKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5sb2cgPSBsb2c7XHJcbiAgICBmdW5jdGlvbiBsb2dXaXRoVGltZSgpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2coZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSwgJy0+JywgaXRlbXMuam9pbignICcpKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5sb2dXaXRoVGltZSA9IGxvZ1dpdGhUaW1lO1xyXG4gICAgZnVuY3Rpb24gaW5mbygpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5pbmZvLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5pbmZvID0gaW5mbztcclxuICAgIGZ1bmN0aW9uIGluZm9XaXRoVGltZSgpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmZvKGdldEN1cnJlbnRUaW1lU3RyaW5nKCksICctPicsIGl0ZW1zLmpvaW4oJyAnKSk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuaW5mb1dpdGhUaW1lID0gaW5mb1dpdGhUaW1lO1xyXG4gICAgZnVuY3Rpb24gd2FybigpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci53YXJuID0gd2FybjtcclxuICAgIGZ1bmN0aW9uIGVycm9yKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmVycm9yLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5lcnJvciA9IGVycm9yO1xyXG4gICAgZnVuY3Rpb24gY29uc29sZVdlbGNvbWVNZXNzYWdlKCkge1xyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIiVjIF9fICAgICAgIF9fICAgX19fX19fICAgX19fX19fXyAgXFxufCAgXFxcXCAgICAgLyAgXFxcXCAvICAgICAgXFxcXCB8ICAgICAgIFxcXFwgXFxufCAkJFxcXFwgICAvICAkJHwgICQkJCQkJFxcXFx8ICQkJCQkJCRcXFxcXFxufCAkJCRcXFxcIC8gICQkJHwgJCRfX3wgJCR8ICQkICB8ICQkXFxufCAkJCQkXFxcXCAgJCQkJHwgJCQgICAgJCR8ICQkICB8ICQkXFxufCAkJFxcXFwkJCAkJCAkJHwgJCQkJCQkJCR8ICQkICB8ICQkXFxufCAkJCBcXFxcJCQkfCAkJHwgJCQgIHwgJCR8ICQkX18vICQkXFxufCAkJCAgXFxcXCQgfCAkJHwgJCQgIHwgJCR8ICQkICAgICQkXFxuIFxcXFwkJCAgICAgIFxcXFwkJCBcXFxcJCQgICBcXFxcJCQgXFxcXCQkJCQkJCRcXG5cXG5cIiwgXCJjb2xvcjpyZWQ7XCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCclY1xcbk1vbG90b3YgQWRzIC0gRGV2ZWxvcGVyIENvbnNvbGVcXG5cXG4nLCAnY29sb3I6Ymx1ZTsnKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5jb25zb2xlV2VsY29tZU1lc3NhZ2UgPSBjb25zb2xlV2VsY29tZU1lc3NhZ2U7XHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50VGltZVN0cmluZygpIHtcclxuICAgICAgICB2YXIgdGltZSA9IG5ldyBEYXRlKCkuZ2V0SG91cnMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0TWludXRlcygpICsgJzonICsgbmV3IERhdGUoKS5nZXRTZWNvbmRzKCkgKyAnLicgKyBuZXcgRGF0ZSgpLmdldE1pbGxpc2Vjb25kcygpO1xyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG4gICAgfVxyXG59KShMb2dnZXIgPSBleHBvcnRzLkxvZ2dlciB8fCAoZXhwb3J0cy5Mb2dnZXIgPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgVmlld3BvcnQ7XHJcbihmdW5jdGlvbiAoVmlld3BvcnQpIHtcclxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudEluVmlld3BvcnQoZWxlbWVudCwgdGhyZXNob2xkKSB7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHJldHVybiAocmVjdC50b3AgPj0gMCAmJlxyXG4gICAgICAgICAgICByZWN0LmxlZnQgPj0gMCAmJlxyXG4gICAgICAgICAgICByZWN0LmJvdHRvbSAtIHRocmVzaG9sZCA8PSAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpICYmXHJcbiAgICAgICAgICAgIHJlY3QucmlnaHQgPD0gKHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCkpO1xyXG4gICAgfVxyXG4gICAgVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydCA9IGlzRWxlbWVudEluVmlld3BvcnQ7XHJcbiAgICBmdW5jdGlvbiBpc0VsZW1lbnRWaXNpYmxlKGVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gISEoZWxlbWVudC5vZmZzZXRXaWR0aCB8fCBlbGVtZW50Lm9mZnNldEhlaWdodCB8fCBlbGVtZW50LmdldENsaWVudFJlY3RzKCkubGVuZ3RoKTtcclxuICAgIH1cclxuICAgIFZpZXdwb3J0LmlzRWxlbWVudFZpc2libGUgPSBpc0VsZW1lbnRWaXNpYmxlO1xyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIHJlY3RUb3AgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgICAgICB2YXIgdG9wID0gcmVjdFRvcCA+IDAgPyB3aW5kb3cuaW5uZXJIZWlnaHQgLSByZWN0VG9wIDogTWF0aC5hYnMocmVjdFRvcCk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRvcCAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIHJlc3VsdCA9IHJlY3RUb3AgPiAwID8gcmVzdWx0IDogMSAtIHJlc3VsdDtcclxuICAgICAgICBpZiAocmVzdWx0IDwgMClcclxuICAgICAgICAgICAgcmVzdWx0ID0gMDtcclxuICAgICAgICBpZiAocmVzdWx0ID4gMSlcclxuICAgICAgICAgICAgcmVzdWx0ID0gMTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0ICogMTAwO1xyXG4gICAgfVxyXG4gICAgVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZSA9IGdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2U7XHJcbn0pKFZpZXdwb3J0ID0gZXhwb3J0cy5WaWV3cG9ydCB8fCAoZXhwb3J0cy5WaWV3cG9ydCA9IHt9KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBhZHNsb3RfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2Fkc2xvdFwiKTtcclxudmFyIERvdWJsZUNsaWNrQWRTbG90ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKERvdWJsZUNsaWNrQWRTbG90LCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gRG91YmxlQ2xpY2tBZFNsb3QoSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBIVE1MRWxlbWVudCkgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5IVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHZhciBkcyA9IEhUTUxFbGVtZW50LmRhdGFzZXQ7XHJcbiAgICAgICAgdmFyIHNpemUgPSBldmFsKGRzWydtYWRTaXplJ10pO1xyXG4gICAgICAgIF90aGlzLmFkVW5pdCA9IGRzWydtYWRBZHVuaXQnXTtcclxuICAgICAgICBfdGhpcy5uYW1lID0gSFRNTEVsZW1lbnQuaWQ7XHJcbiAgICAgICAgX3RoaXMuc2l6ZSA9IHNpemU7XHJcbiAgICAgICAgX3RoaXMuaXNPdXRPZlBhZ2UgPSBCb29sZWFuKGRzWydtYWRPdXRPZlBhZ2UnXSk7XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hUaW1lID0gTnVtYmVyKGRzWydtYWRBdXRvUmVmcmVzaEluU2Vjb25kcyddKSB8fCAwO1xyXG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoTGltaXQgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoTGltaXQnXSkgfHwgMDtcclxuICAgICAgICBfdGhpcy5sYXp5bG9hZE9mZnNldCA9IE51bWJlcihkc1snbWFkTGF6eWxvYWRPZmZzZXQnXSk7XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hFbmFibGVkID0gX3RoaXMuYXV0b1JlZnJlc2hUaW1lID4gMDtcclxuICAgICAgICBpZiAoX3RoaXMubGF6eWxvYWRPZmZzZXQpIHtcclxuICAgICAgICAgICAgX3RoaXMubGF6eWxvYWRPZmZzZXQgPSBfdGhpcy5sYXp5bG9hZE9mZnNldCB8fCAwO1xyXG4gICAgICAgICAgICBfdGhpcy5sYXp5bG9hZEVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuZGVmaW5lU2xvdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5pc091dE9mUGFnZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90ID0gZ29vZ2xldGFnLmRlZmluZU91dE9mUGFnZVNsb3QodGhpcy5hZFVuaXQsIHRoaXMubmFtZSkuYWRkU2VydmljZShnb29nbGV0YWcucHViYWRzKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kb3VibGVjbGlja0FkU2xvdCA9IGdvb2dsZXRhZy5kZWZpbmVTbG90KHRoaXMuYWRVbml0LCB0aGlzLnNpemUsIHRoaXMubmFtZSkuYWRkU2VydmljZShnb29nbGV0YWcucHViYWRzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuYWRkU2l6ZU1hcHBpbmcgPSBmdW5jdGlvbiAoc2l6ZXMpIHtcclxuICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90LmRlZmluZVNpemVNYXBwaW5nKHNpemVzKTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuYWRkU2V0VGFyZ2V0aW5nID0gZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgIHRoaXMuZG91YmxlY2xpY2tBZFNsb3Quc2V0VGFyZ2V0aW5nKCdwb3NpdGlvbicsIHRhcmdldCk7XHJcbiAgICB9O1xyXG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLmFkZENvbGxhcHNlRW1wdHlEaXZzID0gZnVuY3Rpb24gKHZhbDEsIHZhbDIpIHtcclxuICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90LnNldENvbGxhcHNlRW1wdHlEaXYodmFsMSwgdmFsMik7XHJcbiAgICB9O1xyXG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLmRpc3BsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZ29vZ2xldGFnLmRpc3BsYXkodGhpcy5uYW1lKTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBnb29nbGV0YWcucHViYWRzKCkucmVmcmVzaChbdGhpcy5kb3VibGVjbGlja0FkU2xvdF0pO1xyXG4gICAgfTtcclxuICAgIERvdWJsZUNsaWNrQWRTbG90LnByb3RvdHlwZS5nZXREb3VibGVjbGlja0FkU2xvdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kb3VibGVjbGlja0FkU2xvdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gRG91YmxlQ2xpY2tBZFNsb3Q7XHJcbn0oYWRzbG90XzEuQWRTbG90KSk7XHJcbmV4cG9ydHMuRG91YmxlQ2xpY2tBZFNsb3QgPSBEb3VibGVDbGlja0FkU2xvdDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGRvdWJsZWNsaWNrX2Fkc2xvdF8xID0gcmVxdWlyZShcIi4uL2RvdWJsZWNsaWNrL2RvdWJsZWNsaWNrLmFkc2xvdFwiKTtcclxudmFyIGxvZ2dlcl8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvbG9nZ2VyXCIpO1xyXG52YXIgdmlld3BvcnRfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL3ZpZXdwb3J0XCIpO1xyXG52YXIgYXV0b3JlZnJlc2hfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2F1dG9yZWZyZXNoXCIpO1xyXG52YXIgUHJlYmlkRGZwUGx1Z0luID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gUHJlYmlkRGZwUGx1Z0luKCkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiUHJlYmlkRGZwXCI7XHJcbiAgICAgICAgdGhpcy5zbG90cyA9IHt9O1xyXG4gICAgICAgIHRoaXMuUFJFQklEX1RJTUVPVVQgPSAzMDAwO1xyXG4gICAgfVxyXG4gICAgUHJlYmlkRGZwUGx1Z0luLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHJlZnJlc2hTbG90cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuc2xvdHMgPSB0aGlzLmdldFNsb3RzKCk7XHJcbiAgICAgICAgdGhpcy5QUkVCSURfVElNRU9VVCA9IHBianMuZ2V0Q29uZmlnKCkuYmlkZGVyVGltZW91dDtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBnb29nbGV0YWcuY21kLnB1c2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLnB1YmFkcygpLmVuYWJsZVNpbmdsZVJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5kaXNhYmxlSW5pdGlhbExvYWQoKTtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvKCdlbmFibGluZyBzZXJ2aWNlcycpO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLmVuYWJsZVNlcnZpY2VzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBwYmpzLnF1ZS5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJBZGRpbmcgYWR1bml0cyB0byBwcmViaWQuLi5cIik7XHJcbiAgICAgICAgICAgICAgICBwYmpzLmFkZEFkVW5pdHMob3B0aW9ucy5hZFVuaXRzKTtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJSZXF1ZXN0aW5nIGJpZHMuLi5cIik7XHJcbiAgICAgICAgICAgICAgICBwYmpzLnJlcXVlc3RCaWRzKHtcclxuICAgICAgICAgICAgICAgICAgICBhZFVuaXRDb2Rlczogb3B0aW9ucy5pbml0aWFsQWRVbml0cyxcclxuICAgICAgICAgICAgICAgICAgICBiaWRzQmFja0hhbmRsZXI6IHNlbmRBZHNlcnZlclJlcXVlc3RcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKFwiVGltZW91dCByZWFjaGVkLCB3aWxsIHNlbmQgYWQgc2VydmVyIHJlcXVlc3RcIik7XHJcbiAgICAgICAgICAgICAgICBzZW5kQWRzZXJ2ZXJSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIH0sIHBianMuZ2V0Q29uZmlnKCkuYmlkZGVyVGltZW91dCk7XHJcbiAgICAgICAgICAgIGdvb2dsZXRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zbG90c1tzbG90TmFtZV0uZGVmaW5lU2xvdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2coc2VsZi5uYW1lLCAnYWQgc2xvdCBkZWZpbmVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2l6ZXNbc2xvdE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmFkZFNpemVNYXBwaW5nKG9wdGlvbnMuc2l6ZXNbc2xvdE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudGFyZ2V0W3Nsb3ROYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNsb3RzW3Nsb3ROYW1lXS5hZGRTZXRUYXJnZXRpbmcob3B0aW9ucy50YXJnZXRbc2xvdE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29sbGFwc2Vbc2xvdE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmFkZENvbGxhcHNlRW1wdHlEaXZzKHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zbG90c1tzbG90TmFtZV0uYWRkQ29sbGFwc2VFbXB0eURpdnModHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvcHRpb25zLmN1c3RvbVRhcmdldHMpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvcHRpb25zLmN1c3RvbVRhcmdldHNbaXRlbV07XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZygndGFyZ2V0aW5nJywgaXRlbSwgJ2FzJywgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5zZXRUYXJnZXRpbmcoaXRlbSwgW3ZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBnb29nbGV0YWcucHViYWRzKCkuYWRkRXZlbnRMaXN0ZW5lcignc2xvdFJlbmRlckVuZGVkJywgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKGV2ZW50LnNsb3QuZ2V0U2xvdEVsZW1lbnRJZCgpLCAnZmluaXNoZWQgc2xvdCByZW5kZXJpbmcnKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgc2xvdCA9IHNlbGYuc2xvdHNbZXZlbnQuc2xvdC5nZXRTbG90RWxlbWVudElkKCldO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGVja0xpc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGlkIGluIG9wdGlvbnMuZGlzYWJsZVJvdGF0ZUxpc3QubGluZUl0ZW1JZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmxpbmVJdGVtSWQgPT0gb3B0aW9ucy5kaXNhYmxlUm90YXRlTGlzdC5saW5lSXRlbUlkc1tpZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrTGlzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGlkIGluIG9wdGlvbnMuZGlzYWJsZVJvdGF0ZUxpc3Qub3JkZXJJZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNhbXBhaWduSWQgPT0gb3B0aW9ucy5kaXNhYmxlUm90YXRlTGlzdC5vcmRlcklkc1tpZF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrTGlzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja0xpc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b3JlZnJlc2hfMS5BdXRvUmVmcmVzaC5zdGFydChzbG90LCBvcHRpb25zLCBzZWxmLmF1dG9SZWZyZXNoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TbG90UmVuZGVyRW5kZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNsb3RSZW5kZXJFbmRlZChldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cyhvcHRpb25zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHNlbmRBZHNlcnZlclJlcXVlc3QoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGJqcy5hZHNlcnZlclJlcXVlc3RTZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJTZW5kaW5nIGFkIHNlcnZlciByZXF1ZXN0XCIpO1xyXG4gICAgICAgICAgICAgICAgcGJqcy5hZHNlcnZlclJlcXVlc3RTZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGJqcy5xdWUucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJzZXRUYXJnZXRpbmdGb3JHUFRBc3luYyBjYWxsZWRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBianMuc2V0VGFyZ2V0aW5nRm9yR1BUQXN5bmMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMubG9nQmlkcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShcIkJpZHMgcmV0dXJuZWQsIGxpc3Rpbmc6XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhwYmpzLmdldEFkc2VydmVyVGFyZ2V0aW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHNsb3ROYW1lIGluIHNlbGYuc2xvdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmRpc3BsYXkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzZWxmLnNsb3RzW3Nsb3ROYW1lXS5uYW1lLCAnc3RhcnRlZCBkaXNwbGF5aW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5zbG90c1tzbG90TmFtZV0ubGF6eWxvYWRFbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZyZXNoU2xvdHMucHVzaChzZWxmLnNsb3RzW3Nsb3ROYW1lXS5kb3VibGVjbGlja0FkU2xvdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZ29vZ2xldGFnLnB1YmFkcygpLnJlZnJlc2gocmVmcmVzaFNsb3RzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1hZFNsb3RMb2FkZWRcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzbG90ID0gZS5kZXRhaWw7XHJcbiAgICAgICAgICAgICAgICBzbG90ID0gc2VsZi5nZXRTaW5nbGVTbG90KHNsb3QpO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLmNtZC5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzbG90KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdID0gc2xvdFtzbG90TmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsb3Rbc2xvdE5hbWVdLmRlZmluZVNsb3QoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdhZCBzbG90IGRlZmluZWQ6ICcsIHNsb3Rbc2xvdE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2l6ZXNbc2xvdE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbG90W3Nsb3ROYW1lXS5hZGRTaXplTWFwcGluZyhvcHRpb25zLnNpemVzW3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudGFyZ2V0W3Nsb3ROYW1lXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2xvdFtzbG90TmFtZV0uYWRkU2V0VGFyZ2V0aW5nKG9wdGlvbnMudGFyZ2V0W3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29sbGFwc2Vbc2xvdE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbG90W3Nsb3ROYW1lXS5hZGRDb2xsYXBzZUVtcHR5RGl2cyh0cnVlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsb3Rbc2xvdE5hbWVdLmFkZENvbGxhcHNlRW1wdHlEaXZzKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsb3Rbc2xvdE5hbWVdLmRpc3BsYXkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hdXRvUmVmcmVzaChzbG90W3Nsb3ROYW1lXSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFByZWJpZERmcFBsdWdJbi5wcm90b3R5cGUub25TY3JvbGxSZWZyZXNoTGF6eWxvYWRlZFNsb3RzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uIHJlZnJlc2hBZHNJZkl0SXNJblZpZXdwb3J0KGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHZhciBfbG9vcF8xID0gZnVuY3Rpb24gKHNsb3ROYW1lKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2xvdCA9IHNlbGYuc2xvdHNbc2xvdE5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNsb3QubGF6eWxvYWRFbmFibGVkICYmIHZpZXdwb3J0XzEuVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydChzbG90LkhUTUxFbGVtZW50LCBzbG90Lmxhenlsb2FkT2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBianMucXVlLnB1c2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYmpzLnJlcXVlc3RCaWRzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkVW5pdENvZGVzOiBbc2xvdC5uYW1lXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpZHNCYWNrSGFuZGxlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBianMuc2V0VGFyZ2V0aW5nRm9yR1BUQXN5bmMoW3Nsb3QubmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsb3QucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBzbG90Lmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICBfbG9vcF8xKHNsb3ROYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFByZWJpZERmcFBsdWdJbi5wcm90b3R5cGUuYXV0b1JlZnJlc2ggPSBmdW5jdGlvbiAoc2xvdCwgb3B0aW9ucykge1xyXG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGVkIHJlZnJlc2hpbmcnKTtcclxuICAgICAgICBwYmpzLnF1ZS5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcGJqcy5yZXF1ZXN0Qmlkcyh7XHJcbiAgICAgICAgICAgICAgICBhZFVuaXRDb2RlczogW3Nsb3QubmFtZV0sXHJcbiAgICAgICAgICAgICAgICBiaWRzQmFja0hhbmRsZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYmpzLnNldFRhcmdldGluZ0ZvckdQVEFzeW5jKFtzbG90Lm5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICBzbG90LnJlZnJlc2goKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgUHJlYmlkRGZwUGx1Z0luLnByb3RvdHlwZS5nZXRTaW5nbGVTbG90ID0gZnVuY3Rpb24gKHNsb3QpIHtcclxuICAgICAgICB2YXIgc2xvdHMgPSB7fTtcclxuICAgICAgICB2YXIgZWwgPSBzbG90LkhUTUxFbGVtZW50O1xyXG4gICAgICAgIHNsb3RzW2VsLmlkXSA9IG5ldyBkb3VibGVjbGlja19hZHNsb3RfMS5Eb3VibGVDbGlja0FkU2xvdChlbCk7XHJcbiAgICAgICAgd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW2VsLmlkXSA9IHNsb3RzW2VsLmlkXTtcclxuICAgICAgICByZXR1cm4gc2xvdHM7XHJcbiAgICB9O1xyXG4gICAgUHJlYmlkRGZwUGx1Z0luLnByb3RvdHlwZS5nZXRTbG90cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2xvdHMgPSB7fTtcclxuICAgICAgICBmb3IgKHZhciBzbG90IGluIHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90cykge1xyXG4gICAgICAgICAgICB2YXIgZWwgPSB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHNbc2xvdF0uSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIGlmIChlbC5kYXRhc2V0Lm1hZEFkdW5pdCA9PT0gJycpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgc2xvdHNbZWwuaWRdID0gbmV3IGRvdWJsZWNsaWNrX2Fkc2xvdF8xLkRvdWJsZUNsaWNrQWRTbG90KGVsKTtcclxuICAgICAgICAgICAgd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW2VsLmlkXSA9IHNsb3RzW2VsLmlkXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNsb3RzO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBQcmViaWREZnBQbHVnSW47XHJcbn0oKSk7XHJcbmV4cG9ydHMuUHJlYmlkRGZwUGx1Z0luID0gUHJlYmlkRGZwUGx1Z0luO1xyXG53aW5kb3cuX21vbG90b3ZBZHMubG9hZFBsdWdpbihuZXcgUHJlYmlkRGZwUGx1Z0luKCkpO1xyXG4iXX0=
