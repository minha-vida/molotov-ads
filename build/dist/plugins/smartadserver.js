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
var SmartPlugIn = (function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvc21hcnRhZHNlcnZlci9zbWFydC5hZHNsb3QuanMiLCJidWlsZC9zcmMvcGx1Z2lucy9zbWFydGFkc2VydmVyL3NtYXJ0LnBsdWdpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgQWRTbG90ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEFkU2xvdChIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXV0b1JlZnJlc2hFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hdXRvUmVmcmVzaENvdW50ZXIgPSAxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEFkU2xvdDtcclxufSgpKTtcclxuZXhwb3J0cy5BZFNsb3QgPSBBZFNsb3Q7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcclxudmFyIHZpZXdwb3J0XzEgPSByZXF1aXJlKFwiLi92aWV3cG9ydFwiKTtcclxudmFyIEF1dG9SZWZyZXNoO1xyXG4oZnVuY3Rpb24gKEF1dG9SZWZyZXNoKSB7XHJcbiAgICBmdW5jdGlvbiBzdGFydChzbG90LCBvcHRpb25zLCByZWZyZXNoRnVuY3Rpb24pIHtcclxuICAgICAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9wdGlvbnMgPSB7fTsgfVxyXG4gICAgICAgIGlmICghc2xvdC5hdXRvUmVmcmVzaEVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBpZiAoc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIgPD0gc2xvdC5hdXRvUmVmcmVzaExpbWl0KSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAncmVmcmVzaGluZyBpbicsIHNsb3QuYXV0b1JlZnJlc2hUaW1lLCAnc2Vjb25kcyAoJywgc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIsICcvJywgc2xvdC5hdXRvUmVmcmVzaExpbWl0LCAnKScpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJlZnJlc2hTbG90Rm9yQXV0b1JvdGF0ZSwgc2xvdC5hdXRvUmVmcmVzaFRpbWUgKiAxMDAwLCBzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBzbG90LmF1dG9SZWZyZXNoQ291bnRlcisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2xvdC5hdXRvUmVmcmVzaEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShzbG90Lm5hbWUsICdhdXRvIHJlZnJlc2ggZW5kZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBBdXRvUmVmcmVzaC5zdGFydCA9IHN0YXJ0O1xyXG4gICAgZnVuY3Rpb24gcmVmcmVzaFNsb3RGb3JBdXRvUm90YXRlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbiwgb3B0aW9ucykge1xyXG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGluZyByZWZyZXNoIGZvciBhdXRvIHJvdGF0ZScpO1xyXG4gICAgICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbiwgb3B0aW9ucyk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdtYXJrZWQgZm9yIHJlZnJlc2ggb24gdmlzaWJpbGl0eWNoYW5nZScpO1xyXG4gICAgICAgICAgICB2YXIgdmlzaWJpbGl0eUJhY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24sIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlCYWNrKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIHZpc2liaWxpdHlCYWNrKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlID0gNTA7XHJcbiAgICAgICAgaWYgKHZpZXdwb3J0XzEuVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShzbG90LkhUTUxFbGVtZW50KSA+PSBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgcmVmcmVzaEZ1bmN0aW9uKHNsb3QsIG9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNsb3QubmFtZSwgJ3ZpZXdhYmxpdHkgbG93ZXIgdGhhbiA1MCUsIG5vdCByZWZyZXNoaW5nJyk7XHJcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbEZvclJlZnJlc2ggPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmlld3BvcnRfMS5WaWV3cG9ydC5nZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKHNsb3QuSFRNTEVsZW1lbnQpID49IG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZnJlc2hGdW5jdGlvbihzbG90LCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsRm9yUmVmcmVzaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDUwMDApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlID0gcmVmcmVzaElmVmlld2FibGU7XHJcbn0pKEF1dG9SZWZyZXNoID0gZXhwb3J0cy5BdXRvUmVmcmVzaCB8fCAoZXhwb3J0cy5BdXRvUmVmcmVzaCA9IHt9KSk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG52YXIgTG9nZ2VyO1xyXG4oZnVuY3Rpb24gKExvZ2dlcikge1xyXG4gICAgdmFyIGRldk1vZGVFbmFibGVkID0gbG9jYXRpb24uaGFzaC5pbmRleE9mKCdkZXZlbG9wbWVudCcpID49IDA7XHJcbiAgICBmdW5jdGlvbiBsb2coKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5sb2cgPSBsb2c7XHJcbiAgICBmdW5jdGlvbiBsb2dXaXRoVGltZSgpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsb2coZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSwgJy0+JywgaXRlbXMuam9pbignICcpKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5sb2dXaXRoVGltZSA9IGxvZ1dpdGhUaW1lO1xyXG4gICAgZnVuY3Rpb24gaW5mbygpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5pbmZvLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5pbmZvID0gaW5mbztcclxuICAgIGZ1bmN0aW9uIGluZm9XaXRoVGltZSgpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmZvKGdldEN1cnJlbnRUaW1lU3RyaW5nKCksICctPicsIGl0ZW1zLmpvaW4oJyAnKSk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuaW5mb1dpdGhUaW1lID0gaW5mb1dpdGhUaW1lO1xyXG4gICAgZnVuY3Rpb24gd2FybigpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci53YXJuID0gd2FybjtcclxuICAgIGZ1bmN0aW9uIGVycm9yKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmVycm9yLmFwcGx5KGNvbnNvbGUsIGl0ZW1zKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5lcnJvciA9IGVycm9yO1xyXG4gICAgZnVuY3Rpb24gY29uc29sZVdlbGNvbWVNZXNzYWdlKCkge1xyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIiVjIF9fICAgICAgIF9fICAgX19fX19fICAgX19fX19fXyAgXFxufCAgXFxcXCAgICAgLyAgXFxcXCAvICAgICAgXFxcXCB8ICAgICAgIFxcXFwgXFxufCAkJFxcXFwgICAvICAkJHwgICQkJCQkJFxcXFx8ICQkJCQkJCRcXFxcXFxufCAkJCRcXFxcIC8gICQkJHwgJCRfX3wgJCR8ICQkICB8ICQkXFxufCAkJCQkXFxcXCAgJCQkJHwgJCQgICAgJCR8ICQkICB8ICQkXFxufCAkJFxcXFwkJCAkJCAkJHwgJCQkJCQkJCR8ICQkICB8ICQkXFxufCAkJCBcXFxcJCQkfCAkJHwgJCQgIHwgJCR8ICQkX18vICQkXFxufCAkJCAgXFxcXCQgfCAkJHwgJCQgIHwgJCR8ICQkICAgICQkXFxuIFxcXFwkJCAgICAgIFxcXFwkJCBcXFxcJCQgICBcXFxcJCQgXFxcXCQkJCQkJCRcXG5cXG5cIiwgXCJjb2xvcjpyZWQ7XCIpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCclY1xcbk1vbG90b3YgQWRzIC0gRGV2ZWxvcGVyIENvbnNvbGVcXG5cXG4nLCAnY29sb3I6Ymx1ZTsnKTtcclxuICAgIH1cclxuICAgIExvZ2dlci5jb25zb2xlV2VsY29tZU1lc3NhZ2UgPSBjb25zb2xlV2VsY29tZU1lc3NhZ2U7XHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50VGltZVN0cmluZygpIHtcclxuICAgICAgICB2YXIgdGltZSA9IG5ldyBEYXRlKCkuZ2V0SG91cnMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0TWludXRlcygpICsgJzonICsgbmV3IERhdGUoKS5nZXRTZWNvbmRzKCkgKyAnLicgKyBuZXcgRGF0ZSgpLmdldE1pbGxpc2Vjb25kcygpO1xyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG4gICAgfVxyXG59KShMb2dnZXIgPSBleHBvcnRzLkxvZ2dlciB8fCAoZXhwb3J0cy5Mb2dnZXIgPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIFZpZXdwb3J0O1xyXG4oZnVuY3Rpb24gKFZpZXdwb3J0KSB7XHJcbiAgICBmdW5jdGlvbiBpc0VsZW1lbnRJblZpZXdwb3J0KGVsZW1lbnQsIHRocmVzaG9sZCkge1xyXG4gICAgICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICByZXR1cm4gKHJlY3QudG9wID49IDAgJiZcclxuICAgICAgICAgICAgcmVjdC5sZWZ0ID49IDAgJiZcclxuICAgICAgICAgICAgcmVjdC5ib3R0b20gLSB0aHJlc2hvbGQgPD0gKHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSAmJlxyXG4gICAgICAgICAgICByZWN0LnJpZ2h0IDw9ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpKTtcclxuICAgIH1cclxuICAgIFZpZXdwb3J0LmlzRWxlbWVudEluVmlld3BvcnQgPSBpc0VsZW1lbnRJblZpZXdwb3J0O1xyXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50VmlzaWJsZShlbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuICEhKGVsZW1lbnQub2Zmc2V0V2lkdGggfHwgZWxlbWVudC5vZmZzZXRIZWlnaHQgfHwgZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBWaWV3cG9ydC5pc0VsZW1lbnRWaXNpYmxlID0gaXNFbGVtZW50VmlzaWJsZTtcclxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UoZWxlbWVudCkge1xyXG4gICAgICAgIHZhciByZWN0VG9wID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgdmFyIHRvcCA9IHJlY3RUb3AgPiAwID8gd2luZG93LmlubmVySGVpZ2h0IC0gcmVjdFRvcCA6IE1hdGguYWJzKHJlY3RUb3ApO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB0b3AgLyBlbGVtZW50LmNsaWVudEhlaWdodDtcclxuICAgICAgICByZXN1bHQgPSByZWN0VG9wID4gMCA/IHJlc3VsdCA6IDEgLSByZXN1bHQ7XHJcbiAgICAgICAgaWYgKHJlc3VsdCA8IDApXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IDA7XHJcbiAgICAgICAgaWYgKHJlc3VsdCA+IDEpXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IDE7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAqIDEwMDtcclxuICAgIH1cclxuICAgIFZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UgPSBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlO1xyXG59KShWaWV3cG9ydCA9IGV4cG9ydHMuVmlld3BvcnQgfHwgKGV4cG9ydHMuVmlld3BvcnQgPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGFkc2xvdF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvYWRzbG90XCIpO1xyXG52YXIgU21hcnRBZFNsb3QgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKFNtYXJ0QWRTbG90LCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gU21hcnRBZFNsb3QoSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBIVE1MRWxlbWVudCkgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5IVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHZhciBkcyA9IEhUTUxFbGVtZW50LmRhdGFzZXQ7XHJcbiAgICAgICAgX3RoaXMubmFtZSA9IEhUTUxFbGVtZW50LmlkO1xyXG4gICAgICAgIF90aGlzLnNtYXJ0QWRJZCA9IGRzWydtYWRTbWFydGFkSWQnXTtcclxuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaFRpbWUgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoSW5TZWNvbmRzJ10pIHx8IDA7XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hMaW1pdCA9IE51bWJlcihkc1snbWFkQXV0b1JlZnJlc2hMaW1pdCddKSB8fCAwO1xyXG4gICAgICAgIF90aGlzLmxhenlsb2FkT2Zmc2V0ID0gTnVtYmVyKGRzWydtYWRMYXp5bG9hZE9mZnNldCddKTtcclxuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaEVuYWJsZWQgPSBfdGhpcy5hdXRvUmVmcmVzaFRpbWUgPiAwO1xyXG4gICAgICAgIGlmIChfdGhpcy5sYXp5bG9hZE9mZnNldCkge1xyXG4gICAgICAgICAgICBfdGhpcy5sYXp5bG9hZE9mZnNldCA9IF90aGlzLmxhenlsb2FkT2Zmc2V0IHx8IDA7XHJcbiAgICAgICAgICAgIF90aGlzLmxhenlsb2FkRW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIFNtYXJ0QWRTbG90LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNhcy5yZWZyZXNoKHRoaXMuc21hcnRBZElkKTtcclxuICAgIH07XHJcbiAgICBTbWFydEFkU2xvdC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmxhenlsb2FkRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHNhcy5yZW5kZXIodGhpcy5zbWFydEFkSWQpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBTbWFydEFkU2xvdDtcclxufShhZHNsb3RfMS5BZFNsb3QpKTtcclxuZXhwb3J0cy5TbWFydEFkU2xvdCA9IFNtYXJ0QWRTbG90O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgc21hcnRfYWRzbG90XzEgPSByZXF1aXJlKFwiLi9zbWFydC5hZHNsb3RcIik7XHJcbnZhciBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2xvZ2dlclwiKTtcclxudmFyIHZpZXdwb3J0XzEgPSByZXF1aXJlKFwiLi4vLi4vbW9kdWxlcy92aWV3cG9ydFwiKTtcclxudmFyIGF1dG9yZWZyZXNoXzEgPSByZXF1aXJlKFwiLi4vLi4vbW9kdWxlcy9hdXRvcmVmcmVzaFwiKTtcclxudmFyIFNtYXJ0UGx1Z0luID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFNtYXJ0UGx1Z0luKCkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiU21hcnRBZFNlcnZlclwiO1xyXG4gICAgICAgIHRoaXMuc2xvdHMgPSB7fTtcclxuICAgIH1cclxuICAgIFNtYXJ0UGx1Z0luLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5zbG90cyA9IHRoaXMuZ2V0U2xvdHMoKTtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBzYXMuY21kLnB1c2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2FzLmNhbGwoXCJvbmVjYWxsXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICBzaXRlSWQ6IG9wdGlvbnMuc2l0ZUlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZ2VJZDogb3B0aW9ucy5wYWdlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0SWQ6IG9wdGlvbnMuZm9ybWF0SWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBvcHRpb25zLnRhcmdldFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB3aW5kb3dbJ3Nhc0NhbGxiYWNrJ10gPSBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzYXMuaW5mb1tldmVudF0uZGl2SWQsICdmaW5pc2hlZCBzbG90IHJlbmRlcmluZycpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNsb3QgPSBzZWxmLnNsb3RzW3Nhcy5pbmZvW2V2ZW50XS5kaXZJZF07XHJcbiAgICAgICAgICAgICAgICBhdXRvcmVmcmVzaF8xLkF1dG9SZWZyZXNoLnN0YXJ0KHNsb3QsIG9wdGlvbnMsIHNlbGYuYXV0b1JlZnJlc2gpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuc2FzQ2FsbGJhY2spXHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5zYXNDYWxsYmFjayhldmVudCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNlbGYub25TY3JvbGxSZWZyZXNoTGF6eWxvYWRlZFNsb3RzKCk7XHJcbiAgICAgICAgICAgIHNhcy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zbG90c1tzbG90TmFtZV0ucmVuZGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICdhZCBzbG90IHJlbmRlcmVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFNtYXJ0UGx1Z0luLnByb3RvdHlwZS5vblNjcm9sbFJlZnJlc2hMYXp5bG9hZGVkU2xvdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmdW5jdGlvbiByZWZyZXNoQWRzSWZJdElzSW5WaWV3cG9ydChldmVudCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2xvdCA9IHNlbGYuc2xvdHNbc2xvdE5hbWVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNsb3QubGF6eWxvYWRFbmFibGVkICYmIHZpZXdwb3J0XzEuVmlld3BvcnQuaXNFbGVtZW50SW5WaWV3cG9ydChzbG90LkhUTUxFbGVtZW50LCBzbG90Lmxhenlsb2FkT2Zmc2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsb3QucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsb3QubGF6eWxvYWRFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBTbWFydFBsdWdJbi5wcm90b3R5cGUuYXV0b1JlZnJlc2ggPSBmdW5jdGlvbiAoc2xvdCwgb3B0aW9ucykge1xyXG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGVkIHJlZnJlc2hpbmcnKTtcclxuICAgICAgICBzbG90LnJlZnJlc2goKTtcclxuICAgIH07XHJcbiAgICBTbWFydFBsdWdJbi5wcm90b3R5cGUuZ2V0U2xvdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNsb3RzID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgc2xvdCBpbiB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHMpIHtcclxuICAgICAgICAgICAgdmFyIGVsID0gd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW3Nsb3RdLkhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICBpZiAoZWwuZGF0YXNldC5tYWRBZHVuaXQgPT09ICcnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIHNsb3RzW2VsLmlkXSA9IG5ldyBzbWFydF9hZHNsb3RfMS5TbWFydEFkU2xvdChlbCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tlbC5pZF0gPSBzbG90c1tlbC5pZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzbG90cztcclxuICAgIH07XHJcbiAgICByZXR1cm4gU21hcnRQbHVnSW47XHJcbn0oKSk7XHJcbmV4cG9ydHMuU21hcnRQbHVnSW4gPSBTbWFydFBsdWdJbjtcclxud2luZG93Ll9tb2xvdG92QWRzLmxvYWRQbHVnaW4obmV3IFNtYXJ0UGx1Z0luKCkpO1xyXG4iXX0=
