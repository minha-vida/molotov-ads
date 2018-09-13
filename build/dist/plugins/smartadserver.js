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
var SmartAdSlot = /** @class */ (function (_super) {
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
    return SmartAdSlot;
}(adslot_1.AdSlot));
exports.SmartAdSlot = SmartAdSlot;

},{"../../modules/adslot":1}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var smart_adslot_1 = require("./smart.adslot");
var logger_1 = require("../../modules/logger");
var viewport_1 = require("../../modules/viewport");
var autorefresh_1 = require("../../modules/autorefresh");
var SmartPlugIn = /** @class */ (function () {
    function SmartPlugIn() {
        this.name = "SmartAdServer";
        this.slots = {};
    }
    SmartPlugIn.prototype.init = function (options) {
        var self = this;
        this.slots = this.getSlots();
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
            self.onScrollRefreshLazyloadedSlots();
            sas.cmd.push(function () {
                for (var slotName in self.slots) {
                    self.slots[slotName].render();
                    logger_1.Logger.log(self.name, 'ad slot rendered: ', self.slots[slotName]);
                }
                resolve();
            });
        });
    };
    SmartPlugIn.prototype.onScrollRefreshLazyloadedSlots = function () {
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
    SmartPlugIn.prototype.autoRefresh = function (slot, options) {
        logger_1.Logger.logWithTime(slot.name, 'started refreshing');
        slot.refresh();
    };
    SmartPlugIn.prototype.getSlots = function () {
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
    return SmartPlugIn;
}());
exports.SmartPlugIn = SmartPlugIn;
window._molotovAds.loadPlugin(new SmartPlugIn());

},{"../../modules/autorefresh":2,"../../modules/logger":3,"../../modules/viewport":4,"./smart.adslot":5}]},{},[5,6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvc21hcnRhZHNlcnZlci9zbWFydC5hZHNsb3QuanMiLCJidWlsZC9zcmMvcGx1Z2lucy9zbWFydGFkc2VydmVyL3NtYXJ0LnBsdWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIEFkU2xvdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEFkU2xvdChIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXV0b1JlZnJlc2hFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hdXRvUmVmcmVzaENvdW50ZXIgPSAxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEFkU2xvdDtcclxufSgpKTtcclxuZXhwb3J0cy5BZFNsb3QgPSBBZFNsb3Q7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcclxudmFyIHZpZXdwb3J0XzEgPSByZXF1aXJlKFwiLi92aWV3cG9ydFwiKTtcclxudmFyIEF1dG9SZWZyZXNoO1xyXG4oZnVuY3Rpb24gKEF1dG9SZWZyZXNoKSB7XHJcbiAgICBmdW5jdGlvbiBzdGFydChzbG90LCBvcHRpb25zLCByZWZyZXNoRnVuY3Rpb24pIHtcclxuICAgICAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxyXG4gICAgICAgIGlmICghc2xvdC5hdXRvUmVmcmVzaEVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIgPD0gc2xvdC5hdXRvUmVmcmVzaExpbWl0KSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAncmVmcmVzaGluZyBpbicsIHNsb3QuYXV0b1JlZnJlc2hUaW1lLCAnc2Vjb25kcyAoJywgc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIsICcvJywgc2xvdC5hdXRvUmVmcmVzaExpbWl0LCAnKScpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJlZnJlc2hTbG90Rm9yQXV0b1JvdGF0ZSwgc2xvdC5hdXRvUmVmcmVzaFRpbWUgKiAxMDAwLCBzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBzbG90LmF1dG9SZWZyZXNoQ291bnRlcisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2xvdC5hdXRvUmVmcmVzaEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShzbG90Lm5hbWUsICdhdXRvIHJlZnJlc2ggZW5kZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBBdXRvUmVmcmVzaC5zdGFydCA9IHN0YXJ0O1xyXG4gICAgZnVuY3Rpb24gcmVmcmVzaFNsb3RGb3JBdXRvUm90YXRlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbiwgb3B0aW9ucykge1xyXG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGluZyByZWZyZXNoIGZvciBhdXRvIHJvdGF0ZScpO1xyXG4gICAgICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbiwgb3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdtYXJrZWQgZm9yIHJlZnJlc2ggb24gdmlzaWJpbGl0eWNoYW5nZScpO1xyXG4gICAgICAgICAgICB2YXIgdmlzaWJpbGl0eUJhY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlCYWNrKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlCYWNrKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlID0gNTA7XHJcbiAgICAgICAgaWYgKHZpZXdwb3J0XzEuVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShzbG90LkhUTUxFbGVtZW50KSA+PSBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgcmVmcmVzaEZ1bmN0aW9uKHNsb3QsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNsb3QubmFtZSwgJ3ZpZXdhYmxpdHkgbG93ZXIgdGhhbiA1MCUsIG5vdCByZWZyZXNoaW5nJyk7XHJcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbEZvclJlZnJlc2ggPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmlld3BvcnRfMS5WaWV3cG9ydC5nZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKHNsb3QuSFRNTEVsZW1lbnQpID49IG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZnJlc2hGdW5jdGlvbihzbG90LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsRm9yUmVmcmVzaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDUwMDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlID0gcmVmcmVzaElmVmlld2FibGU7XHJcbn0pKEF1dG9SZWZyZXNoID0gZXhwb3J0cy5BdXRvUmVmcmVzaCB8fCAoZXhwb3J0cy5BdXRvUmVmcmVzaCA9IHt9KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBMb2dnZXI7XHJcbihmdW5jdGlvbiAoTG9nZ2VyKSB7XHJcbiAgICB2YXIgZGV2TW9kZUVuYWJsZWQgPSBsb2NhdGlvbi5oYXNoLmluZGV4T2YoJ2RldmVsb3BtZW50JykgPj0gMDtcclxuICAgIGZ1bmN0aW9uIGxvZygpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgaXRlbXMpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmxvZyA9IGxvZztcclxuICAgIGZ1bmN0aW9uIGxvZ1dpdGhUaW1lKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxvZyhnZXRDdXJyZW50VGltZVN0cmluZygpLCAnLT4nLCBpdGVtcy5qb2luKCcgJykpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmxvZ1dpdGhUaW1lID0gbG9nV2l0aFRpbWU7XHJcbiAgICBmdW5jdGlvbiBpbmZvKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmluZm8uYXBwbHkoY29uc29sZSwgaXRlbXMpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmluZm8gPSBpbmZvO1xyXG4gICAgZnVuY3Rpb24gaW5mb1dpdGhUaW1lKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZm8oZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSwgJy0+JywgaXRlbXMuam9pbignICcpKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5pbmZvV2l0aFRpbWUgPSBpbmZvV2l0aFRpbWU7XHJcbiAgICBmdW5jdGlvbiB3YXJuKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLndhcm4uYXBwbHkoY29uc29sZSwgaXRlbXMpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLndhcm4gPSB3YXJuO1xyXG4gICAgZnVuY3Rpb24gZXJyb3IoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkoY29uc29sZSwgaXRlbXMpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmVycm9yID0gZXJyb3I7XHJcbiAgICBmdW5jdGlvbiBjb25zb2xlV2VsY29tZU1lc3NhZ2UoKSB7XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiJWMgX18gICAgICAgX18gICBfX19fX18gICBfX19fX19fICBcXG58ICBcXFxcICAgICAvICBcXFxcIC8gICAgICBcXFxcIHwgICAgICAgXFxcXCBcXG58ICQkXFxcXCAgIC8gICQkfCAgJCQkJCQkXFxcXHwgJCQkJCQkJFxcXFxcXG58ICQkJFxcXFwgLyAgJCQkfCAkJF9ffCAkJHwgJCQgIHwgJCRcXG58ICQkJCRcXFxcICAkJCQkfCAkJCAgICAkJHwgJCQgIHwgJCRcXG58ICQkXFxcXCQkICQkICQkfCAkJCQkJCQkJHwgJCQgIHwgJCRcXG58ICQkIFxcXFwkJCR8ICQkfCAkJCAgfCAkJHwgJCRfXy8gJCRcXG58ICQkICBcXFxcJCB8ICQkfCAkJCAgfCAkJHwgJCQgICAgJCRcXG4gXFxcXCQkICAgICAgXFxcXCQkIFxcXFwkJCAgIFxcXFwkJCBcXFxcJCQkJCQkJFxcblxcblwiLCBcImNvbG9yOnJlZDtcIik7XHJcbiAgICAgICAgY29uc29sZS5sb2coJyVjXFxuTW9sb3RvdiBBZHMgLSBEZXZlbG9wZXIgQ29uc29sZVxcblxcbicsICdjb2xvcjpibHVlOycpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmNvbnNvbGVXZWxjb21lTWVzc2FnZSA9IGNvbnNvbGVXZWxjb21lTWVzc2FnZTtcclxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRUaW1lU3RyaW5nKCkge1xyXG4gICAgICAgIHZhciB0aW1lID0gbmV3IERhdGUoKS5nZXRIb3VycygpICsgJzonICsgbmV3IERhdGUoKS5nZXRNaW51dGVzKCkgKyAnOicgKyBuZXcgRGF0ZSgpLmdldFNlY29uZHMoKSArICcuJyArIG5ldyBEYXRlKCkuZ2V0TWlsbGlzZWNvbmRzKCk7XHJcbiAgICAgICAgcmV0dXJuIHRpbWU7XHJcbiAgICB9XHJcbn0pKExvZ2dlciA9IGV4cG9ydHMuTG9nZ2VyIHx8IChleHBvcnRzLkxvZ2dlciA9IHt9KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBWaWV3cG9ydDtcclxuKGZ1bmN0aW9uIChWaWV3cG9ydCkge1xyXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50SW5WaWV3cG9ydChlbGVtZW50LCB0aHJlc2hvbGQpIHtcclxuICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgcmV0dXJuIChyZWN0LnRvcCA+PSAwICYmXHJcbiAgICAgICAgICAgIHJlY3QubGVmdCA+PSAwICYmXHJcbiAgICAgICAgICAgIHJlY3QuYm90dG9tIC0gdGhyZXNob2xkIDw9ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkgJiZcclxuICAgICAgICAgICAgcmVjdC5yaWdodCA8PSAod2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSk7XHJcbiAgICB9XHJcbiAgICBWaWV3cG9ydC5pc0VsZW1lbnRJblZpZXdwb3J0ID0gaXNFbGVtZW50SW5WaWV3cG9ydDtcclxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudFZpc2libGUoZWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiAhIShlbGVtZW50Lm9mZnNldFdpZHRoIHx8IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgVmlld3BvcnQuaXNFbGVtZW50VmlzaWJsZSA9IGlzRWxlbWVudFZpc2libGU7XHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgcmVjdFRvcCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgICAgIHZhciB0b3AgPSByZWN0VG9wID4gMCA/IHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3RUb3AgOiBNYXRoLmFicyhyZWN0VG9wKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdG9wIC8gZWxlbWVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgcmVzdWx0ID0gcmVjdFRvcCA+IDAgPyByZXN1bHQgOiAxIC0gcmVzdWx0O1xyXG4gICAgICAgIGlmIChyZXN1bHQgPCAwKVxyXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xyXG4gICAgICAgIGlmIChyZXN1bHQgPiAxKVxyXG4gICAgICAgICAgICByZXN1bHQgPSAxO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQgKiAxMDA7XHJcbiAgICB9XHJcbiAgICBWaWV3cG9ydC5nZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlID0gZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZTtcclxufSkoVmlld3BvcnQgPSBleHBvcnRzLlZpZXdwb3J0IHx8IChleHBvcnRzLlZpZXdwb3J0ID0ge30pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGFkc2xvdF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvYWRzbG90XCIpO1xyXG52YXIgU21hcnRBZFNsb3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoU21hcnRBZFNsb3QsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBTbWFydEFkU2xvdChIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIEhUTUxFbGVtZW50KSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdmFyIGRzID0gSFRNTEVsZW1lbnQuZGF0YXNldDtcclxuICAgICAgICBfdGhpcy5uYW1lID0gSFRNTEVsZW1lbnQuaWQ7XHJcbiAgICAgICAgX3RoaXMuc21hcnRBZElkID0gZHNbJ21hZFNtYXJ0YWRJZCddO1xyXG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoVGltZSA9IE51bWJlcihkc1snbWFkQXV0b1JlZnJlc2hJblNlY29uZHMnXSkgfHwgMDtcclxuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaExpbWl0ID0gTnVtYmVyKGRzWydtYWRBdXRvUmVmcmVzaExpbWl0J10pIHx8IDA7XHJcbiAgICAgICAgX3RoaXMubGF6eWxvYWRPZmZzZXQgPSBOdW1iZXIoZHNbJ21hZExhenlsb2FkT2Zmc2V0J10pO1xyXG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoRW5hYmxlZCA9IF90aGlzLmF1dG9SZWZyZXNoVGltZSA+IDA7XHJcbiAgICAgICAgaWYgKF90aGlzLmxhenlsb2FkT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIF90aGlzLmxhenlsb2FkT2Zmc2V0ID0gX3RoaXMubGF6eWxvYWRPZmZzZXQgfHwgMDtcclxuICAgICAgICAgICAgX3RoaXMubGF6eWxvYWRFbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgU21hcnRBZFNsb3QucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2FzLnJlZnJlc2godGhpcy5zbWFydEFkSWQpO1xyXG4gICAgfTtcclxuICAgIFNtYXJ0QWRTbG90LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGF6eWxvYWRFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgc2FzLnJlbmRlcih0aGlzLnNtYXJ0QWRJZCk7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFNtYXJ0QWRTbG90O1xyXG59KGFkc2xvdF8xLkFkU2xvdCkpO1xyXG5leHBvcnRzLlNtYXJ0QWRTbG90ID0gU21hcnRBZFNsb3Q7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBzbWFydF9hZHNsb3RfMSA9IHJlcXVpcmUoXCIuL3NtYXJ0LmFkc2xvdFwiKTtcclxudmFyIGxvZ2dlcl8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvbG9nZ2VyXCIpO1xyXG52YXIgdmlld3BvcnRfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL3ZpZXdwb3J0XCIpO1xyXG52YXIgYXV0b3JlZnJlc2hfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2F1dG9yZWZyZXNoXCIpO1xyXG52YXIgU21hcnRQbHVnSW4gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBTbWFydFBsdWdJbigpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIlNtYXJ0QWRTZXJ2ZXJcIjtcclxuICAgICAgICB0aGlzLnNsb3RzID0ge307XHJcbiAgICB9XHJcbiAgICBTbWFydFBsdWdJbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc2xvdHMgPSB0aGlzLmdldFNsb3RzKCk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgc2FzLmNtZC5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHNhcy5jYWxsKFwib25lY2FsbFwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2l0ZUlkOiBvcHRpb25zLnNpdGVJZCxcclxuICAgICAgICAgICAgICAgICAgICBwYWdlSWQ6IG9wdGlvbnMucGFnZUlkLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdElkOiBvcHRpb25zLmZvcm1hdElkLFxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogb3B0aW9ucy50YXJnZXRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgd2luZG93WydzYXNDYWxsYmFjayddID0gZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2FzLmluZm9bZXZlbnRdLmRpdklkLCAnZmluaXNoZWQgc2xvdCByZW5kZXJpbmcnKTtcclxuICAgICAgICAgICAgICAgIHZhciBzbG90ID0gc2VsZi5zbG90c1tzYXMuaW5mb1tldmVudF0uZGl2SWRdO1xyXG4gICAgICAgICAgICAgICAgYXV0b3JlZnJlc2hfMS5BdXRvUmVmcmVzaC5zdGFydChzbG90LCBvcHRpb25zLCBzZWxmLmF1dG9SZWZyZXNoKTtcclxuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnNhc0NhbGxiYWNrKVxyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc2FzQ2FsbGJhY2soZXZlbnQpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBzZWxmLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cygpO1xyXG4gICAgICAgICAgICBzYXMuY21kLnB1c2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gc2VsZi5zbG90cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLnJlbmRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2coc2VsZi5uYW1lLCAnYWQgc2xvdCByZW5kZXJlZDogJywgc2VsZi5zbG90c1tzbG90TmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBTbWFydFBsdWdJbi5wcm90b3R5cGUub25TY3JvbGxSZWZyZXNoTGF6eWxvYWRlZFNsb3RzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgZnVuY3Rpb24gcmVmcmVzaEFkc0lmSXRJc0luVmlld3BvcnQoZXZlbnQpIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gc2VsZi5zbG90cykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNsb3QgPSBzZWxmLnNsb3RzW3Nsb3ROYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChzbG90Lmxhenlsb2FkRW5hYmxlZCAmJiB2aWV3cG9ydF8xLlZpZXdwb3J0LmlzRWxlbWVudEluVmlld3BvcnQoc2xvdC5IVE1MRWxlbWVudCwgc2xvdC5sYXp5bG9hZE9mZnNldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzbG90LnJlZnJlc2goKTtcclxuICAgICAgICAgICAgICAgICAgICBzbG90Lmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgU21hcnRQbHVnSW4ucHJvdG90eXBlLmF1dG9SZWZyZXNoID0gZnVuY3Rpb24gKHNsb3QsIG9wdGlvbnMpIHtcclxuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnc3RhcnRlZCByZWZyZXNoaW5nJyk7XHJcbiAgICAgICAgc2xvdC5yZWZyZXNoKCk7XHJcbiAgICB9O1xyXG4gICAgU21hcnRQbHVnSW4ucHJvdG90eXBlLmdldFNsb3RzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzbG90cyA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIHNsb3QgaW4gd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzKSB7XHJcbiAgICAgICAgICAgIHZhciBlbCA9IHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tzbG90XS5IVE1MRWxlbWVudDtcclxuICAgICAgICAgICAgaWYgKGVsLmRhdGFzZXQubWFkQWR1bml0ID09PSAnJylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBzbG90c1tlbC5pZF0gPSBuZXcgc21hcnRfYWRzbG90XzEuU21hcnRBZFNsb3QoZWwpO1xyXG4gICAgICAgICAgICB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHNbZWwuaWRdID0gc2xvdHNbZWwuaWRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2xvdHM7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFNtYXJ0UGx1Z0luO1xyXG59KCkpO1xyXG5leHBvcnRzLlNtYXJ0UGx1Z0luID0gU21hcnRQbHVnSW47XHJcbndpbmRvdy5fbW9sb3RvdkFkcy5sb2FkUGx1Z2luKG5ldyBTbWFydFBsdWdJbigpKTtcclxuIl19
