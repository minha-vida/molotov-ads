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

},{"../../modules/autorefresh":2,"../../modules/logger":3,"../../modules/viewport":4,"./doubleclick.adslot":5}]},{},[5,6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvZG91YmxlY2xpY2svZG91YmxlY2xpY2suYWRzbG90LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvZG91YmxlY2xpY2svZG91YmxlY2xpY2sucGx1Z2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBBZFNsb3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBBZFNsb3QoSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5sYXp5bG9hZEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmF1dG9SZWZyZXNoRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXV0b1JlZnJlc2hDb3VudGVyID0gMTtcclxuICAgIH1cclxuICAgIHJldHVybiBBZFNsb3Q7XHJcbn0oKSk7XHJcbmV4cG9ydHMuQWRTbG90ID0gQWRTbG90O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XHJcbnZhciB2aWV3cG9ydF8xID0gcmVxdWlyZShcIi4vdmlld3BvcnRcIik7XHJcbnZhciBBdXRvUmVmcmVzaDtcclxuKGZ1bmN0aW9uIChBdXRvUmVmcmVzaCkge1xyXG4gICAgZnVuY3Rpb24gc3RhcnQoc2xvdCwgb3B0aW9ucywgcmVmcmVzaEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IHZvaWQgMCkgeyBvcHRpb25zID0ge307IH1cclxuICAgICAgICBpZiAoIXNsb3QuYXV0b1JlZnJlc2hFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyIDw9IHNsb3QuYXV0b1JlZnJlc2hMaW1pdCkge1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKHNsb3QubmFtZSwgJ3JlZnJlc2hpbmcgaW4nLCBzbG90LmF1dG9SZWZyZXNoVGltZSwgJ3NlY29uZHMgKCcsIHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyLCAnLycsIHNsb3QuYXV0b1JlZnJlc2hMaW1pdCwgJyknKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChyZWZyZXNoU2xvdEZvckF1dG9Sb3RhdGUsIHNsb3QuYXV0b1JlZnJlc2hUaW1lICogMTAwMCwgc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNsb3QuYXV0b1JlZnJlc2hFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAnYXV0byByZWZyZXNoIGVuZGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQXV0b1JlZnJlc2guc3RhcnQgPSBzdGFydDtcclxuICAgIGZ1bmN0aW9uIHJlZnJlc2hTbG90Rm9yQXV0b1JvdGF0ZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpIHtcclxuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnc3RhcnRpbmcgcmVmcmVzaCBmb3IgYXV0byByb3RhdGUnKTtcclxuICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmhpZGRlbikge1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnbWFya2VkIGZvciByZWZyZXNoIG9uIHZpc2liaWxpdHljaGFuZ2UnKTtcclxuICAgICAgICAgICAgdmFyIHZpc2liaWxpdHlCYWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgQXV0b1JlZnJlc2gucmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSA9IDUwO1xyXG4gICAgICAgIGlmICh2aWV3cG9ydF8xLlZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2Uoc2xvdC5IVE1MRWxlbWVudCkgPj0gbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIHJlZnJlc2hGdW5jdGlvbihzbG90LCBvcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICd2aWV3YWJsaXR5IGxvd2VyIHRoYW4gNTAlLCBub3QgcmVmcmVzaGluZycpO1xyXG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWxGb3JSZWZyZXNoID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZpZXdwb3J0XzEuVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShzbG90LkhUTUxFbGVtZW50KSA+PSBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZyZXNoRnVuY3Rpb24oc2xvdCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEZvclJlZnJlc2gpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCA1MDAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZSA9IHJlZnJlc2hJZlZpZXdhYmxlO1xyXG59KShBdXRvUmVmcmVzaCA9IGV4cG9ydHMuQXV0b1JlZnJlc2ggfHwgKGV4cG9ydHMuQXV0b1JlZnJlc2ggPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgTG9nZ2VyO1xyXG4oZnVuY3Rpb24gKExvZ2dlcikge1xyXG4gICAgdmFyIGRldk1vZGVFbmFibGVkID0gbG9jYXRpb24uaGFzaC5pbmRleE9mKCdkZXZlbG9wbWVudCcpID49IDA7XHJcbiAgICBmdW5jdGlvbiBsb2coKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5sb2cgPSBsb2c7XHJcbiAgICBmdW5jdGlvbiBsb2dXaXRoVGltZSgpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2coZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSwgJy0+JywgaXRlbXMuam9pbignICcpKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5sb2dXaXRoVGltZSA9IGxvZ1dpdGhUaW1lO1xyXG4gICAgZnVuY3Rpb24gaW5mbygpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5pbmZvLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5pbmZvID0gaW5mbztcclxuICAgIGZ1bmN0aW9uIGluZm9XaXRoVGltZSgpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmZvKGdldEN1cnJlbnRUaW1lU3RyaW5nKCksICctPicsIGl0ZW1zLmpvaW4oJyAnKSk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuaW5mb1dpdGhUaW1lID0gaW5mb1dpdGhUaW1lO1xyXG4gICAgZnVuY3Rpb24gd2FybigpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci53YXJuID0gd2FybjtcclxuICAgIGZ1bmN0aW9uIGVycm9yKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmVycm9yLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5lcnJvciA9IGVycm9yO1xyXG4gICAgZnVuY3Rpb24gY29uc29sZVdlbGNvbWVNZXNzYWdlKCkge1xyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIiVjIF9fICAgICAgIF9fICAgX19fX19fICAgX19fX19fXyAgXFxufCAgXFxcXCAgICAgLyAgXFxcXCAvICAgICAgXFxcXCB8ICAgICAgIFxcXFwgXFxufCAkJFxcXFwgICAvICAkJHwgICQkJCQkJFxcXFx8ICQkJCQkJCRcXFxcXFxufCAkJCRcXFxcIC8gICQkJHwgJCRfX3wgJCR8ICQkICB8ICQkXFxufCAkJCQkXFxcXCAgJCQkJHwgJCQgICAgJCR8ICQkICB8ICQkXFxufCAkJFxcXFwkJCAkJCAkJHwgJCQkJCQkJCR8ICQkICB8ICQkXFxufCAkJCBcXFxcJCQkfCAkJHwgJCQgIHwgJCR8ICQkX18vICQkXFxufCAkJCAgXFxcXCQgfCAkJHwgJCQgIHwgJCR8ICQkICAgICQkXFxuIFxcXFwkJCAgICAgIFxcXFwkJCBcXFxcJCQgICBcXFxcJCQgXFxcXCQkJCQkJCRcXG5cXG5cIiwgXCJjb2xvcjpyZWQ7XCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCclY1xcbk1vbG90b3YgQWRzIC0gRGV2ZWxvcGVyIENvbnNvbGVcXG5cXG4nLCAnY29sb3I6Ymx1ZTsnKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5jb25zb2xlV2VsY29tZU1lc3NhZ2UgPSBjb25zb2xlV2VsY29tZU1lc3NhZ2U7XHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50VGltZVN0cmluZygpIHtcclxuICAgICAgICB2YXIgdGltZSA9IG5ldyBEYXRlKCkuZ2V0SG91cnMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0TWludXRlcygpICsgJzonICsgbmV3IERhdGUoKS5nZXRTZWNvbmRzKCkgKyAnLicgKyBuZXcgRGF0ZSgpLmdldE1pbGxpc2Vjb25kcygpO1xyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG4gICAgfVxyXG59KShMb2dnZXIgPSBleHBvcnRzLkxvZ2dlciB8fCAoZXhwb3J0cy5Mb2dnZXIgPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgVmlld3BvcnQ7XHJcbihmdW5jdGlvbiAoVmlld3BvcnQpIHtcclxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudEluVmlld3BvcnQoZWxlbWVudCwgdGhyZXNob2xkKSB7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIHJldHVybiAocmVjdC50b3AgPj0gMCAmJlxyXG4gICAgICAgICAgICByZWN0LmxlZnQgPj0gMCAmJlxyXG4gICAgICAgICAgICByZWN0LmJvdHRvbSAtIHRocmVzaG9sZCA8PSAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpICYmXHJcbiAgICAgICAgICAgIHJlY3QucmlnaHQgPD0gKHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCkpO1xyXG4gICAgfVxyXG4gICAgVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydCA9IGlzRWxlbWVudEluVmlld3BvcnQ7XHJcbiAgICBmdW5jdGlvbiBpc0VsZW1lbnRWaXNpYmxlKGVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gISEoZWxlbWVudC5vZmZzZXRXaWR0aCB8fCBlbGVtZW50Lm9mZnNldEhlaWdodCB8fCBlbGVtZW50LmdldENsaWVudFJlY3RzKCkubGVuZ3RoKTtcclxuICAgIH1cclxuICAgIFZpZXdwb3J0LmlzRWxlbWVudFZpc2libGUgPSBpc0VsZW1lbnRWaXNpYmxlO1xyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIHJlY3RUb3AgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgICAgICB2YXIgdG9wID0gcmVjdFRvcCA+IDAgPyB3aW5kb3cuaW5uZXJIZWlnaHQgLSByZWN0VG9wIDogTWF0aC5hYnMocmVjdFRvcCk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRvcCAvIGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIHJlc3VsdCA9IHJlY3RUb3AgPiAwID8gcmVzdWx0IDogMSAtIHJlc3VsdDtcclxuICAgICAgICBpZiAocmVzdWx0IDwgMClcclxuICAgICAgICAgICAgcmVzdWx0ID0gMDtcclxuICAgICAgICBpZiAocmVzdWx0ID4gMSlcclxuICAgICAgICAgICAgcmVzdWx0ID0gMTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0ICogMTAwO1xyXG4gICAgfVxyXG4gICAgVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZSA9IGdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2U7XHJcbn0pKFZpZXdwb3J0ID0gZXhwb3J0cy5WaWV3cG9ydCB8fCAoZXhwb3J0cy5WaWV3cG9ydCA9IHt9KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBhZHNsb3RfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2Fkc2xvdFwiKTtcclxudmFyIERvdWJsZUNsaWNrQWRTbG90ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKERvdWJsZUNsaWNrQWRTbG90LCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gRG91YmxlQ2xpY2tBZFNsb3QoSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBIVE1MRWxlbWVudCkgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5IVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHZhciBkcyA9IEhUTUxFbGVtZW50LmRhdGFzZXQ7XHJcbiAgICAgICAgdmFyIHNpemUgPSBldmFsKGRzWydtYWRTaXplJ10pO1xyXG4gICAgICAgIF90aGlzLmFkVW5pdCA9IGRzWydtYWRBZHVuaXQnXTtcclxuICAgICAgICBfdGhpcy5uYW1lID0gSFRNTEVsZW1lbnQuaWQ7XHJcbiAgICAgICAgX3RoaXMuc2l6ZSA9IHNpemU7XHJcbiAgICAgICAgX3RoaXMuaXNPdXRPZlBhZ2UgPSBCb29sZWFuKGRzWydtYWRPdXRPZlBhZ2UnXSk7XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hUaW1lID0gTnVtYmVyKGRzWydtYWRBdXRvUmVmcmVzaEluU2Vjb25kcyddKSB8fCAwO1xyXG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoTGltaXQgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoTGltaXQnXSkgfHwgMDtcclxuICAgICAgICBfdGhpcy5sYXp5bG9hZE9mZnNldCA9IE51bWJlcihkc1snbWFkTGF6eWxvYWRPZmZzZXQnXSk7XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hFbmFibGVkID0gX3RoaXMuYXV0b1JlZnJlc2hUaW1lID4gMDtcclxuICAgICAgICBpZiAoX3RoaXMubGF6eWxvYWRPZmZzZXQpIHtcclxuICAgICAgICAgICAgX3RoaXMubGF6eWxvYWRPZmZzZXQgPSBfdGhpcy5sYXp5bG9hZE9mZnNldCB8fCAwO1xyXG4gICAgICAgICAgICBfdGhpcy5sYXp5bG9hZEVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuZGVmaW5lU2xvdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5pc091dE9mUGFnZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90ID0gZ29vZ2xldGFnLmRlZmluZU91dE9mUGFnZVNsb3QodGhpcy5hZFVuaXQsIHRoaXMubmFtZSkuYWRkU2VydmljZShnb29nbGV0YWcucHViYWRzKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kb3VibGVjbGlja0FkU2xvdCA9IGdvb2dsZXRhZy5kZWZpbmVTbG90KHRoaXMuYWRVbml0LCB0aGlzLnNpemUsIHRoaXMubmFtZSkuYWRkU2VydmljZShnb29nbGV0YWcucHViYWRzKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuYWRkU2l6ZU1hcHBpbmcgPSBmdW5jdGlvbiAoc2l6ZXMpIHtcclxuICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90LmRlZmluZVNpemVNYXBwaW5nKHNpemVzKTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuYWRkU2V0VGFyZ2V0aW5nID0gZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgIHRoaXMuZG91YmxlY2xpY2tBZFNsb3Quc2V0VGFyZ2V0aW5nKCdwb3NpdGlvbicsIHRhcmdldCk7XHJcbiAgICB9O1xyXG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLmFkZENvbGxhcHNlRW1wdHlEaXZzID0gZnVuY3Rpb24gKHZhbDEsIHZhbDIpIHtcclxuICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90LnNldENvbGxhcHNlRW1wdHlEaXYodmFsMSwgdmFsMik7XHJcbiAgICB9O1xyXG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLmRpc3BsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZ29vZ2xldGFnLmRpc3BsYXkodGhpcy5uYW1lKTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBnb29nbGV0YWcucHViYWRzKCkucmVmcmVzaChbdGhpcy5kb3VibGVjbGlja0FkU2xvdF0pO1xyXG4gICAgfTtcclxuICAgIERvdWJsZUNsaWNrQWRTbG90LnByb3RvdHlwZS5nZXREb3VibGVjbGlja0FkU2xvdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kb3VibGVjbGlja0FkU2xvdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gRG91YmxlQ2xpY2tBZFNsb3Q7XHJcbn0oYWRzbG90XzEuQWRTbG90KSk7XHJcbmV4cG9ydHMuRG91YmxlQ2xpY2tBZFNsb3QgPSBEb3VibGVDbGlja0FkU2xvdDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGRvdWJsZWNsaWNrX2Fkc2xvdF8xID0gcmVxdWlyZShcIi4vZG91YmxlY2xpY2suYWRzbG90XCIpO1xyXG52YXIgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi4vLi4vbW9kdWxlcy9sb2dnZXJcIik7XHJcbnZhciB2aWV3cG9ydF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvdmlld3BvcnRcIik7XHJcbnZhciBhdXRvcmVmcmVzaF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvYXV0b3JlZnJlc2hcIik7XHJcbnZhciBEb3VibGVDbGlja1BsdWdJbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIERvdWJsZUNsaWNrUGx1Z0luKCkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiRG91YmxlQ2xpY2tcIjtcclxuICAgICAgICB0aGlzLnNsb3RzID0ge307XHJcbiAgICB9XHJcbiAgICBEb3VibGVDbGlja1BsdWdJbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc2xvdHMgPSB0aGlzLmdldFNsb3RzKCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgZ29vZ2xldGFnLmNtZC5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHNsb3ROYW1lIGluIHNlbGYuc2xvdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNsb3RzW3Nsb3ROYW1lXS5kZWZpbmVTbG90KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdhZCBzbG90IGRlZmluZWQ6ICcsIHNlbGYuc2xvdHNbc2xvdE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5zaXplc1tzbG90TmFtZV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zbG90c1tzbG90TmFtZV0uYWRkU2l6ZU1hcHBpbmcob3B0aW9ucy5zaXplc1tzbG90TmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy50YXJnZXRbc2xvdE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmFkZFNldFRhcmdldGluZyhvcHRpb25zLnRhcmdldFtzbG90TmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb3B0aW9ucy5jdXN0b21UYXJnZXRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gb3B0aW9ucy5jdXN0b21UYXJnZXRzW2l0ZW1dO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2coJ3RhcmdldGluZycsIGl0ZW0sICdhcycsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGV0YWcucHViYWRzKCkuc2V0VGFyZ2V0aW5nKGl0ZW0sIFt2YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLnB1YmFkcygpLmFkZEV2ZW50TGlzdGVuZXIoJ3Nsb3RSZW5kZXJFbmRlZCcsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShldmVudC5zbG90LmdldFNsb3RFbGVtZW50SWQoKSwgJ2ZpbmlzaGVkIHNsb3QgcmVuZGVyaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNsb3QgPSBzZWxmLnNsb3RzW2V2ZW50LnNsb3QuZ2V0U2xvdEVsZW1lbnRJZCgpXTtcclxuICAgICAgICAgICAgICAgICAgICBhdXRvcmVmcmVzaF8xLkF1dG9SZWZyZXNoLnN0YXJ0KHNsb3QsIG9wdGlvbnMsIHNlbGYuYXV0b1JlZnJlc2gpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLm9uU2xvdFJlbmRlckVuZGVkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2xvdFJlbmRlckVuZGVkKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm8oJ2VuYWJsaW5nIHNlcnZpY2VzJyk7XHJcbiAgICAgICAgICAgICAgICBnb29nbGV0YWcucHViYWRzKCkuZGlzYWJsZUluaXRpYWxMb2FkKCk7XHJcbiAgICAgICAgICAgICAgICBnb29nbGV0YWcuZW5hYmxlU2VydmljZXMoKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHNsb3ROYW1lIGluIHNlbGYuc2xvdHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNsb3RzW3Nsb3ROYW1lXS5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNlbGYuc2xvdHNbc2xvdE5hbWVdLm5hbWUsICdzdGFydGVkIGRpc3BsYXlpbmcnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNlbGYub25TY3JvbGxSZWZyZXNoTGF6eWxvYWRlZFNsb3RzKCk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIERvdWJsZUNsaWNrUGx1Z0luLnByb3RvdHlwZS5vblNjcm9sbFJlZnJlc2hMYXp5bG9hZGVkU2xvdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbiByZWZyZXNoQWRzSWZJdElzSW5WaWV3cG9ydChldmVudCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2xvdCA9IHNlbGYuc2xvdHNbc2xvdE5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNsb3QubGF6eWxvYWRFbmFibGVkICYmIHZpZXdwb3J0XzEuVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydChzbG90LkhUTUxFbGVtZW50LCBzbG90Lmxhenlsb2FkT2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsb3QucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsb3QubGF6eWxvYWRFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja1BsdWdJbi5wcm90b3R5cGUuYXV0b1JlZnJlc2ggPSBmdW5jdGlvbiAoc2xvdCwgb3B0aW9ucykge1xyXG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGVkIHJlZnJlc2hpbmcnKTtcclxuICAgICAgICBzbG90LnJlZnJlc2goKTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja1BsdWdJbi5wcm90b3R5cGUuZ2V0U2xvdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNsb3RzID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgc2xvdCBpbiB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHMpIHtcclxuICAgICAgICAgICAgdmFyIGVsID0gd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW3Nsb3RdLkhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICBpZiAoZWwuZGF0YXNldC5tYWRBZHVuaXQgPT09ICcnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIHNsb3RzW2VsLmlkXSA9IG5ldyBkb3VibGVjbGlja19hZHNsb3RfMS5Eb3VibGVDbGlja0FkU2xvdChlbCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tlbC5pZF0gPSBzbG90c1tlbC5pZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzbG90cztcclxuICAgIH07XHJcbiAgICByZXR1cm4gRG91YmxlQ2xpY2tQbHVnSW47XHJcbn0oKSk7XHJcbmV4cG9ydHMuRG91YmxlQ2xpY2tQbHVnSW4gPSBEb3VibGVDbGlja1BsdWdJbjtcclxud2luZG93Ll9tb2xvdG92QWRzLmxvYWRQbHVnaW4obmV3IERvdWJsZUNsaWNrUGx1Z0luKCkpO1xyXG4iXX0=
