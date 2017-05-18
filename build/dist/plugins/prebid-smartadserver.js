(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AdSlot = (function () {
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
            sas.cmd.push(function () {
                sas.call("onecall", {
                    siteId: options.siteId,
                    pageId: options.pageId,
                    formatId: options.formatId,
                    target: options.target
                });
            });
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
                        self.slots[slotName].std({
                            siteId: options.siteId,
                            pageId: options.pageId,
                            formatId: self.slots[slotName].smartAdId,
                            target: options.target + self.getPbTarget(),
                        });
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
                    slot.std({
                        siteId: self.options.siteId,
                        pageId: self.options.pageId,
                        formatId: slot.smartAdId,
                        target: self.options.target + self.getPbTarget(),
                    });
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

},{"../../modules/autorefresh":2,"../../modules/logger":3,"../../modules/viewport":4,"../smartadserver/smart.adslot":6}],6:[function(require,module,exports){
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
var SmartAdSlot = (function (_super) {
    __extends(SmartAdSlot, _super);
    function SmartAdSlot(HTMLElement) {
        var _this = _super.call(this, HTMLElement) || this;
        _this.HTMLElement = HTMLElement;
        var ds = HTMLElement.dataset;
        _this.name = HTMLElement.id;
        _this.smartAdId = ds['madSmartadId'];
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
    SmartAdSlot.prototype.refresh = function () {
        sas.refresh(this.smartAdId);
    };
    SmartAdSlot.prototype.render = function () {
        if (this.lazyloadEnabled)
            return;
        sas.render(this.smartAdId);
    };
    SmartAdSlot.prototype.std = function (options) {
        sas.cmd.push(function () {
            sas.call("std", options);
        });
    };
    return SmartAdSlot;
}(adslot_1.AdSlot));
exports.SmartAdSlot = SmartAdSlot;

},{"../../modules/adslot":1}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvcHJlYmlkLXNtYXJ0YWRzZXJ2ZXIvc21hcnQucHJlYmlkLnBsdWdpbi5qcyIsImJ1aWxkL3NyYy9wbHVnaW5zL3NtYXJ0YWRzZXJ2ZXIvc21hcnQuYWRzbG90LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIEFkU2xvdCA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBBZFNsb3QoSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5sYXp5bG9hZEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmF1dG9SZWZyZXNoRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXV0b1JlZnJlc2hDb3VudGVyID0gMTtcclxuICAgIH1cclxuICAgIHJldHVybiBBZFNsb3Q7XHJcbn0oKSk7XHJcbmV4cG9ydHMuQWRTbG90ID0gQWRTbG90O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XHJcbnZhciB2aWV3cG9ydF8xID0gcmVxdWlyZShcIi4vdmlld3BvcnRcIik7XHJcbnZhciBBdXRvUmVmcmVzaDtcclxuKGZ1bmN0aW9uIChBdXRvUmVmcmVzaCkge1xyXG4gICAgZnVuY3Rpb24gc3RhcnQoc2xvdCwgb3B0aW9ucywgcmVmcmVzaEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cclxuICAgICAgICBpZiAoIXNsb3QuYXV0b1JlZnJlc2hFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyIDw9IHNsb3QuYXV0b1JlZnJlc2hMaW1pdCkge1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKHNsb3QubmFtZSwgJ3JlZnJlc2hpbmcgaW4nLCBzbG90LmF1dG9SZWZyZXNoVGltZSwgJ3NlY29uZHMgKCcsIHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyLCAnLycsIHNsb3QuYXV0b1JlZnJlc2hMaW1pdCwgJyknKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChyZWZyZXNoU2xvdEZvckF1dG9Sb3RhdGUsIHNsb3QuYXV0b1JlZnJlc2hUaW1lICogMTAwMCwgc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNsb3QuYXV0b1JlZnJlc2hFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAnYXV0byByZWZyZXNoIGVuZGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQXV0b1JlZnJlc2guc3RhcnQgPSBzdGFydDtcclxuICAgIGZ1bmN0aW9uIHJlZnJlc2hTbG90Rm9yQXV0b1JvdGF0ZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpIHtcclxuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnc3RhcnRpbmcgcmVmcmVzaCBmb3IgYXV0byByb3RhdGUnKTtcclxuICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmhpZGRlbikge1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnbWFya2VkIGZvciByZWZyZXNoIG9uIHZpc2liaWxpdHljaGFuZ2UnKTtcclxuICAgICAgICAgICAgdmFyIHZpc2liaWxpdHlCYWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgQXV0b1JlZnJlc2gucmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSA9IDUwO1xyXG4gICAgICAgIGlmICh2aWV3cG9ydF8xLlZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2Uoc2xvdC5IVE1MRWxlbWVudCkgPj0gbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIHJlZnJlc2hGdW5jdGlvbihzbG90LCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICd2aWV3YWJsaXR5IGxvd2VyIHRoYW4gNTAlLCBub3QgcmVmcmVzaGluZycpO1xyXG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWxGb3JSZWZyZXNoID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZpZXdwb3J0XzEuVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShzbG90LkhUTUxFbGVtZW50KSA+PSBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZyZXNoRnVuY3Rpb24oc2xvdCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEZvclJlZnJlc2gpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCA1MDAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZSA9IHJlZnJlc2hJZlZpZXdhYmxlO1xyXG59KShBdXRvUmVmcmVzaCA9IGV4cG9ydHMuQXV0b1JlZnJlc2ggfHwgKGV4cG9ydHMuQXV0b1JlZnJlc2ggPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgTG9nZ2VyO1xyXG4oZnVuY3Rpb24gKExvZ2dlcikge1xyXG4gICAgdmFyIGRldk1vZGVFbmFibGVkID0gbG9jYXRpb24uaGFzaC5pbmRleE9mKCdkZXZlbG9wbWVudCcpID49IDA7XHJcbiAgICBmdW5jdGlvbiBsb2coKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5sb2cgPSBsb2c7XHJcbiAgICBmdW5jdGlvbiBsb2dXaXRoVGltZSgpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2coZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSwgJy0+JywgaXRlbXMuam9pbignICcpKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5sb2dXaXRoVGltZSA9IGxvZ1dpdGhUaW1lO1xyXG4gICAgZnVuY3Rpb24gaW5mbygpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5pbmZvLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5pbmZvID0gaW5mbztcclxuICAgIGZ1bmN0aW9uIGluZm9XaXRoVGltZSgpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmZvKGdldEN1cnJlbnRUaW1lU3RyaW5nKCksICctPicsIGl0ZW1zLmpvaW4oJyAnKSk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuaW5mb1dpdGhUaW1lID0gaW5mb1dpdGhUaW1lO1xyXG4gICAgZnVuY3Rpb24gd2FybigpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci53YXJuID0gd2FybjtcclxuICAgIGZ1bmN0aW9uIGVycm9yKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmVycm9yLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5lcnJvciA9IGVycm9yO1xyXG4gICAgZnVuY3Rpb24gY29uc29sZVdlbGNvbWVNZXNzYWdlKCkge1xyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIiVjIF9fICAgICAgIF9fICAgX19fX19fICAgX19fX19fXyAgXFxufCAgXFxcXCAgICAgLyAgXFxcXCAvICAgICAgXFxcXCB8ICAgICAgIFxcXFwgXFxufCAkJFxcXFwgICAvICAkJHwgICQkJCQkJFxcXFx8ICQkJCQkJCRcXFxcXFxufCAkJCRcXFxcIC8gICQkJHwgJCRfX3wgJCR8ICQkICB8ICQkXFxufCAkJCQkXFxcXCAgJCQkJHwgJCQgICAgJCR8ICQkICB8ICQkXFxufCAkJFxcXFwkJCAkJCAkJHwgJCQkJCQkJCR8ICQkICB8ICQkXFxufCAkJCBcXFxcJCQkfCAkJHwgJCQgIHwgJCR8ICQkX18vICQkXFxufCAkJCAgXFxcXCQgfCAkJHwgJCQgIHwgJCR8ICQkICAgICQkXFxuIFxcXFwkJCAgICAgIFxcXFwkJCBcXFxcJCQgICBcXFxcJCQgXFxcXCQkJCQkJCRcXG5cXG5cIiwgXCJjb2xvcjpyZWQ7XCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCclY1xcbk1vbG90b3YgQWRzIC0gRGV2ZWxvcGVyIENvbnNvbGVcXG5cXG4nLCAnY29sb3I6Ymx1ZTsnKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5jb25zb2xlV2VsY29tZU1lc3NhZ2UgPSBjb25zb2xlV2VsY29tZU1lc3NhZ2U7XHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50VGltZVN0cmluZygpIHtcclxuICAgICAgICB2YXIgdGltZSA9IG5ldyBEYXRlKCkuZ2V0SG91cnMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0TWludXRlcygpICsgJzonICsgbmV3IERhdGUoKS5nZXRTZWNvbmRzKCkgKyAnLicgKyBuZXcgRGF0ZSgpLmdldE1pbGxpc2Vjb25kcygpO1xyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG4gICAgfVxyXG59KShMb2dnZXIgPSBleHBvcnRzLkxvZ2dlciB8fCAoZXhwb3J0cy5Mb2dnZXIgPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgVmlld3BvcnQ7XHJcbihmdW5jdGlvbiAoVmlld3BvcnQpIHtcclxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudEluVmlld3BvcnQoZWxlbWVudCwgdGhyZXNob2xkKSB7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHJldHVybiAocmVjdC50b3AgPj0gMCAmJlxyXG4gICAgICAgICAgICByZWN0LmxlZnQgPj0gMCAmJlxyXG4gICAgICAgICAgICByZWN0LmJvdHRvbSAtIHRocmVzaG9sZCA8PSAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpICYmXHJcbiAgICAgICAgICAgIHJlY3QucmlnaHQgPD0gKHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCkpO1xyXG4gICAgfVxyXG4gICAgVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydCA9IGlzRWxlbWVudEluVmlld3BvcnQ7XHJcbiAgICBmdW5jdGlvbiBpc0VsZW1lbnRWaXNpYmxlKGVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gISEoZWxlbWVudC5vZmZzZXRXaWR0aCB8fCBlbGVtZW50Lm9mZnNldEhlaWdodCB8fCBlbGVtZW50LmdldENsaWVudFJlY3RzKCkubGVuZ3RoKTtcclxuICAgIH1cclxuICAgIFZpZXdwb3J0LmlzRWxlbWVudFZpc2libGUgPSBpc0VsZW1lbnRWaXNpYmxlO1xyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIHJlY3RUb3AgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgICAgICB2YXIgdG9wID0gcmVjdFRvcCA+IDAgPyB3aW5kb3cuaW5uZXJIZWlnaHQgLSByZWN0VG9wIDogTWF0aC5hYnMocmVjdFRvcCk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRvcCAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIHJlc3VsdCA9IHJlY3RUb3AgPiAwID8gcmVzdWx0IDogMSAtIHJlc3VsdDtcclxuICAgICAgICBpZiAocmVzdWx0IDwgMClcclxuICAgICAgICAgICAgcmVzdWx0ID0gMDtcclxuICAgICAgICBpZiAocmVzdWx0ID4gMSlcclxuICAgICAgICAgICAgcmVzdWx0ID0gMTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0ICogMTAwO1xyXG4gICAgfVxyXG4gICAgVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZSA9IGdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2U7XHJcbn0pKFZpZXdwb3J0ID0gZXhwb3J0cy5WaWV3cG9ydCB8fCAoZXhwb3J0cy5WaWV3cG9ydCA9IHt9KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBzbWFydF9hZHNsb3RfMSA9IHJlcXVpcmUoXCIuLi9zbWFydGFkc2VydmVyL3NtYXJ0LmFkc2xvdFwiKTtcclxudmFyIGxvZ2dlcl8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvbG9nZ2VyXCIpO1xyXG52YXIgdmlld3BvcnRfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL3ZpZXdwb3J0XCIpO1xyXG52YXIgYXV0b3JlZnJlc2hfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2F1dG9yZWZyZXNoXCIpO1xyXG52YXIgU21hcnRQcmViaWRQbHVnSW4gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gU21hcnRQcmViaWRQbHVnSW4oKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJQcmViaWRTbWFydFwiO1xyXG4gICAgICAgIHRoaXMuc2xvdHMgPSB7fTtcclxuICAgICAgICB0aGlzLlBSRUJJRF9USU1FT1VUID0gNzAwO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xyXG4gICAgfVxyXG4gICAgU21hcnRQcmViaWRQbHVnSW4ucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLnNsb3RzID0gdGhpcy5nZXRTbG90cygpO1xyXG4gICAgICAgIHRoaXMuUFJFQklEX1RJTUVPVVQgPSBvcHRpb25zLlBSRUJJRF9USU1FT1VUO1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgc2FzLmNtZC5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHNhcy5jYWxsKFwib25lY2FsbFwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2l0ZUlkOiBvcHRpb25zLnNpdGVJZCxcclxuICAgICAgICAgICAgICAgICAgICBwYWdlSWQ6IG9wdGlvbnMucGFnZUlkLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdElkOiBvcHRpb25zLmZvcm1hdElkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogb3B0aW9ucy50YXJnZXRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgd2luZG93WydzYXNDYWxsYmFjayddID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2FzLmluZm9bZXZlbnRdLmRpdklkLCAnZmluaXNoZWQgc2xvdCByZW5kZXJpbmcnKTtcclxuICAgICAgICAgICAgICAgIHZhciBzbG90ID0gc2VsZi5zbG90c1tzYXMuaW5mb1tldmVudF0uZGl2SWRdO1xyXG4gICAgICAgICAgICAgICAgYXV0b3JlZnJlc2hfMS5BdXRvUmVmcmVzaC5zdGFydChzbG90LCBvcHRpb25zLCBzZWxmLmF1dG9SZWZyZXNoKTtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnNhc0NhbGxiYWNrKVxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc2FzQ2FsbGJhY2soZXZlbnQpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBwYmpzLnF1ZS5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJBZGRpbmcgYWR1bml0cyB0byBwcmViaWQuLi5cIik7XHJcbiAgICAgICAgICAgICAgICBwYmpzLmFkZEFkVW5pdHMob3B0aW9ucy5hZFVuaXRzKTtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJSZXF1ZXN0aW5nIGJpZHMuLi5cIik7XHJcbiAgICAgICAgICAgICAgICBwYmpzLnJlcXVlc3RCaWRzKHtcclxuICAgICAgICAgICAgICAgICAgICBiaWRzQmFja0hhbmRsZXI6IGZ1bmN0aW9uIChiaWRSZXNwb25zZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VuZEFkc2VydmVyUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKFwiVGltZW91dCByZWFjaGVkLCB3aWxsIHNlbmQgYWQgc2VydmVyIHJlcXVlc3RcIik7XHJcbiAgICAgICAgICAgICAgICBzZW5kQWRzZXJ2ZXJSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIH0sIG9wdGlvbnMuUFJFQklEX1RJTUVPVVQpO1xyXG4gICAgICAgICAgICBzZWxmLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cygpO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBzZW5kQWRzZXJ2ZXJSZXF1ZXN0KCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBianMuYWRzZXJ2ZXJSZXF1ZXN0U2VudClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKFwiU2VuZGluZyBhZCBzZXJ2ZXIgcmVxdWVzdFwiKTtcclxuICAgICAgICAgICAgICAgIHBianMuYWRzZXJ2ZXJSZXF1ZXN0U2VudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBwYmpzLnF1ZS5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zZW5kQWxsQmlkcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKFwiRW5hYmxpbmcgYWxsIGJpZHNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBianMuZW5hYmxlU2VuZEFsbEJpZHMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMubG9nQmlkcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKFwiQmlkcyByZXR1cm5lZCwgbGlzdGluZzpcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2cocGJqcy5nZXRBZHNlcnZlclRhcmdldGluZygpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gc2VsZi5zbG90cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5zbG90c1tzbG90TmFtZV0ubGF6eWxvYWRPZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLnN0ZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXRlSWQ6IG9wdGlvbnMuc2l0ZUlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZUlkOiBvcHRpb25zLnBhZ2VJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdElkOiBzZWxmLnNsb3RzW3Nsb3ROYW1lXS5zbWFydEFkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnMudGFyZ2V0ICsgc2VsZi5nZXRQYlRhcmdldCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdhZCBzbG90IHJlbmRlcmVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgU21hcnRQcmViaWRQbHVnSW4ucHJvdG90eXBlLmdldFBiVGFyZ2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBwYmpzVGFyZ2V0aW5nID0gcGJqcy5nZXRBZHNlcnZlclRhcmdldGluZygpO1xyXG4gICAgICAgIHZhciBzbWFydFRhcmdldGluZyA9ICcnO1xyXG4gICAgICAgIGZvciAodmFyIHVuaXQgaW4gcGJqc1RhcmdldGluZykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBiIGluIHBianNUYXJnZXRpbmdbdW5pdF0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChwYmpzVGFyZ2V0aW5nW3VuaXRdW2JdICE9ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc21hcnRUYXJnZXRpbmcgKz0gdW5pdCArICdfJyArIGIgKyAnPScgKyBwYmpzVGFyZ2V0aW5nW3VuaXRdW2JdICsgJzsnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzbWFydFRhcmdldGluZztcclxuICAgIH07XHJcbiAgICBTbWFydFByZWJpZFBsdWdJbi5wcm90b3R5cGUub25TY3JvbGxSZWZyZXNoTGF6eWxvYWRlZFNsb3RzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24gcmVmcmVzaEFkc0lmSXRJc0luVmlld3BvcnQoZXZlbnQpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gc2VsZi5zbG90cykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNsb3QgPSBzZWxmLnNsb3RzW3Nsb3ROYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChzbG90Lmxhenlsb2FkRW5hYmxlZCAmJiB2aWV3cG9ydF8xLlZpZXdwb3J0LmlzRWxlbWVudEluVmlld3BvcnQoc2xvdC5IVE1MRWxlbWVudCwgc2xvdC5sYXp5bG9hZE9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbG90LnN0ZCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpdGVJZDogc2VsZi5vcHRpb25zLnNpdGVJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZUlkOiBzZWxmLm9wdGlvbnMucGFnZUlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXRJZDogc2xvdC5zbWFydEFkSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDogc2VsZi5vcHRpb25zLnRhcmdldCArIHNlbGYuZ2V0UGJUYXJnZXQoKSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBzbG90Lmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgU21hcnRQcmViaWRQbHVnSW4ucHJvdG90eXBlLmF1dG9SZWZyZXNoID0gZnVuY3Rpb24gKHNsb3QsIG9wdGlvbnMpIHtcclxuICAgICAgICBmdW5jdGlvbiBnZXRQYlRhcmdldCgpIHtcclxuICAgICAgICAgICAgdmFyIHBianNUYXJnZXRpbmcgPSBwYmpzLmdldEFkc2VydmVyVGFyZ2V0aW5nKCk7XHJcbiAgICAgICAgICAgIHZhciBzbWFydFRhcmdldGluZyA9ICcnO1xyXG4gICAgICAgICAgICBmb3IgKHZhciB1bml0IGluIHBianNUYXJnZXRpbmcpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGIgaW4gcGJqc1RhcmdldGluZ1t1bml0XSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYmpzVGFyZ2V0aW5nW3VuaXRdW2JdICE9ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNtYXJ0VGFyZ2V0aW5nICs9IHVuaXQgKyAnXycgKyBiICsgJz0nICsgcGJqc1RhcmdldGluZ1t1bml0XVtiXSArICc7JztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNtYXJ0VGFyZ2V0aW5nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnc3RhcnRlZCByZWZyZXNoaW5nJyk7XHJcbiAgICAgICAgcGJqcy5xdWUucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHBianMucmVxdWVzdEJpZHMoe1xyXG4gICAgICAgICAgICAgICAgdGltZW91dDogb3B0aW9ucy5QUkVCSURfVElNRU9VVCxcclxuICAgICAgICAgICAgICAgIGJpZHNCYWNrSGFuZGxlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsb3Quc3RkKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2l0ZUlkOiBvcHRpb25zLnNpdGVJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZUlkOiBvcHRpb25zLnBhZ2VJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0SWQ6IHNsb3Quc21hcnRBZElkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IG9wdGlvbnMudGFyZ2V0ICsgZ2V0UGJUYXJnZXQoKSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgU21hcnRQcmViaWRQbHVnSW4ucHJvdG90eXBlLmdldFNsb3RzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzbG90cyA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIHNsb3QgaW4gd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzKSB7XHJcbiAgICAgICAgICAgIHZhciBlbCA9IHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tzbG90XS5IVE1MRWxlbWVudDtcclxuICAgICAgICAgICAgaWYgKGVsLmRhdGFzZXQubWFkQWR1bml0ID09PSAnJylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBzbG90c1tlbC5pZF0gPSBuZXcgc21hcnRfYWRzbG90XzEuU21hcnRBZFNsb3QoZWwpO1xyXG4gICAgICAgICAgICB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHNbZWwuaWRdID0gc2xvdHNbZWwuaWRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2xvdHM7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFNtYXJ0UHJlYmlkUGx1Z0luO1xyXG59KCkpO1xyXG5leHBvcnRzLlNtYXJ0UHJlYmlkUGx1Z0luID0gU21hcnRQcmViaWRQbHVnSW47XHJcbndpbmRvdy5fbW9sb3RvdkFkcy5sb2FkUGx1Z2luKG5ldyBTbWFydFByZWJpZFBsdWdJbigpKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBhZHNsb3RfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2Fkc2xvdFwiKTtcclxudmFyIFNtYXJ0QWRTbG90ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhTbWFydEFkU2xvdCwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIFNtYXJ0QWRTbG90KEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgSFRNTEVsZW1lbnQpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudDtcclxuICAgICAgICB2YXIgZHMgPSBIVE1MRWxlbWVudC5kYXRhc2V0O1xyXG4gICAgICAgIF90aGlzLm5hbWUgPSBIVE1MRWxlbWVudC5pZDtcclxuICAgICAgICBfdGhpcy5zbWFydEFkSWQgPSBkc1snbWFkU21hcnRhZElkJ107XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hUaW1lID0gTnVtYmVyKGRzWydtYWRBdXRvUmVmcmVzaEluU2Vjb25kcyddKSB8fCAwO1xyXG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoTGltaXQgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoTGltaXQnXSkgfHwgMDtcclxuICAgICAgICBfdGhpcy5sYXp5bG9hZE9mZnNldCA9IE51bWJlcihkc1snbWFkTGF6eWxvYWRPZmZzZXQnXSk7XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hFbmFibGVkID0gX3RoaXMuYXV0b1JlZnJlc2hUaW1lID4gMDtcclxuICAgICAgICBpZiAoX3RoaXMubGF6eWxvYWRPZmZzZXQpIHtcclxuICAgICAgICAgICAgX3RoaXMubGF6eWxvYWRPZmZzZXQgPSBfdGhpcy5sYXp5bG9hZE9mZnNldCB8fCAwO1xyXG4gICAgICAgICAgICBfdGhpcy5sYXp5bG9hZEVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBTbWFydEFkU2xvdC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzYXMucmVmcmVzaCh0aGlzLnNtYXJ0QWRJZCk7XHJcbiAgICB9O1xyXG4gICAgU21hcnRBZFNsb3QucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5sYXp5bG9hZEVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBzYXMucmVuZGVyKHRoaXMuc21hcnRBZElkKTtcclxuICAgIH07XHJcbiAgICBTbWFydEFkU2xvdC5wcm90b3R5cGUuc3RkID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICBzYXMuY21kLnB1c2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzYXMuY2FsbChcInN0ZFwiLCBvcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gU21hcnRBZFNsb3Q7XHJcbn0oYWRzbG90XzEuQWRTbG90KSk7XHJcbmV4cG9ydHMuU21hcnRBZFNsb3QgPSBTbWFydEFkU2xvdDtcclxuIl19
