(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./modules/logger");
var loader_adslot_1 = require("./modules/loader.adslot");
var MolotovAds = /** @class */ (function () {
    function MolotovAds() {
        this.slots = {};
        this.plugins = [];
        var self = this;
        logger_1.Logger.consoleWelcomeMessage();
        loader_adslot_1.AdSlotLoader.loadSlots().then(function (slots) {
            self.slots = slots;
            var event = new Event('madSlotsLoaded');
            document.dispatchEvent(event);
        });
        document.addEventListener("madPlugInLoaded", function (e) {
            if (Object.keys(self.slots).length > 0)
                self.initPlugin(e.detail);
        });
        document.addEventListener("madSlotsLoaded", function (e) {
            self.initAllPlugins();
        });
    }
    MolotovAds.prototype.loadSlot = function (el) {
        var self = this;
        loader_adslot_1.AdSlotLoader.loadSlot(el).then(function (slots) {
            self.slots[el.id] = slots[el.id];
            var event = new CustomEvent('madSlotLoaded', { detail: self.slots[el.id] });
            document.dispatchEvent(event);
        });
    };
    MolotovAds.prototype.deleteSlot = function (el) {
        var self = this;
        loader_adslot_1.AdSlotLoader.deleteSlot(el);
    };
    MolotovAds.prototype.loadPlugin = function (plugin) {
        logger_1.Logger.infoWithTime("Plugin", plugin.name, "loaded");
        window._molotovAds.plugins.push(plugin);
        var event = new CustomEvent('madPlugInLoaded', { detail: plugin });
        document.dispatchEvent(event);
    };
    MolotovAds.prototype.initPlugin = function (plugin) {
        var t0 = performance.now();
        var pluginIndex = window._molotovAds.plugins.indexOf(plugin);
        window._molotovAds.plugins[pluginIndex].init(madOptions[plugin.name])
            .then(function success() {
            var t1 = performance.now();
            logger_1.Logger.info(plugin.name, 'total execution time: ', t1 - t0, 'ms');
            logger_1.Logger.infoWithTime("Plugin", plugin.name, "initialized successfully");
            var event = new CustomEvent('madPlugInInitalized', { detail: plugin });
            document.dispatchEvent(event);
        });
    };
    MolotovAds.prototype.initAllPlugins = function () {
        for (var i = 0; i < this.plugins.length; i++) {
            this.initPlugin(this.plugins[i]);
        }
    };
    return MolotovAds;
}());
exports.MolotovAds = MolotovAds;
if (window)
    window._molotovAds = new MolotovAds();

},{"./modules/loader.adslot":4,"./modules/logger":5}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viewport_1 = require("./viewport");
var logger_1 = require("./logger");
var adslot_1 = require("./adslot");
var AdSlotLoader;
(function (AdSlotLoader) {
    function loadSlots() {
        return new Promise(function (resolve, reject) {
            var elements = document.querySelectorAll('[data-mad]');
            var slots = {};
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                if (!viewport_1.Viewport.isElementVisible(el)) {
                    logger_1.Logger.warn(el.id, 'ignored because it is not visible');
                    continue;
                }
                slots[el.id] = new adslot_1.AdSlot(el);
            }
            return resolve(slots);
        });
    }
    AdSlotLoader.loadSlots = loadSlots;
    function loadSlot(el) {
        return new Promise(function (resolve, reject) {
            var slots = {};
            var element = el;
            slots[element.id] = new adslot_1.AdSlot(element);
            return resolve(slots);
        });
    }
    AdSlotLoader.loadSlot = loadSlot;
    function deleteSlot(el) {
        return new Promise(function (resolve, reject) {
            var slots = {};
            delete slots[el];
            return resolve(slots);
        });
    }
    AdSlotLoader.deleteSlot = deleteSlot;
})(AdSlotLoader = exports.AdSlotLoader || (exports.AdSlotLoader = {}));

},{"./adslot":3,"./logger":5,"./viewport":6}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}]},{},[5,3,4,6,2,1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvaW5kZXguanMiLCJidWlsZC9zcmMvaW50ZXJmYWNlcy9wbHVnaW4uaW50ZXJmYWNlLmpzIiwiYnVpbGQvc3JjL21vZHVsZXMvYWRzbG90LmpzIiwiYnVpbGQvc3JjL21vZHVsZXMvbG9hZGVyLmFkc2xvdC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9tb2R1bGVzL2xvZ2dlclwiKTtcclxudmFyIGxvYWRlcl9hZHNsb3RfMSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvbG9hZGVyLmFkc2xvdFwiKTtcclxudmFyIE1vbG90b3ZBZHMgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBNb2xvdG92QWRzKCkge1xyXG4gICAgICAgIHRoaXMuc2xvdHMgPSB7fTtcclxuICAgICAgICB0aGlzLnBsdWdpbnMgPSBbXTtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmNvbnNvbGVXZWxjb21lTWVzc2FnZSgpO1xyXG4gICAgICAgIGxvYWRlcl9hZHNsb3RfMS5BZFNsb3RMb2FkZXIubG9hZFNsb3RzKCkudGhlbihmdW5jdGlvbiAoc2xvdHMpIHtcclxuICAgICAgICAgICAgc2VsZi5zbG90cyA9IHNsb3RzO1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgRXZlbnQoJ21hZFNsb3RzTG9hZGVkJyk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtYWRQbHVnSW5Mb2FkZWRcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHNlbGYuc2xvdHMpLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICBzZWxmLmluaXRQbHVnaW4oZS5kZXRhaWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtYWRTbG90c0xvYWRlZFwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBzZWxmLmluaXRBbGxQbHVnaW5zKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBNb2xvdG92QWRzLnByb3RvdHlwZS5sb2FkU2xvdCA9IGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBsb2FkZXJfYWRzbG90XzEuQWRTbG90TG9hZGVyLmxvYWRTbG90KGVsKS50aGVuKGZ1bmN0aW9uIChzbG90cykge1xyXG4gICAgICAgICAgICBzZWxmLnNsb3RzW2VsLmlkXSA9IHNsb3RzW2VsLmlkXTtcclxuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdtYWRTbG90TG9hZGVkJywgeyBkZXRhaWw6IHNlbGYuc2xvdHNbZWwuaWRdIH0pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBNb2xvdG92QWRzLnByb3RvdHlwZS5kZWxldGVTbG90ID0gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxvYWRlcl9hZHNsb3RfMS5BZFNsb3RMb2FkZXIuZGVsZXRlU2xvdChlbCk7XHJcbiAgICB9O1xyXG4gICAgTW9sb3RvdkFkcy5wcm90b3R5cGUubG9hZFBsdWdpbiA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcclxuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKFwiUGx1Z2luXCIsIHBsdWdpbi5uYW1lLCBcImxvYWRlZFwiKTtcclxuICAgICAgICB3aW5kb3cuX21vbG90b3ZBZHMucGx1Z2lucy5wdXNoKHBsdWdpbik7XHJcbiAgICAgICAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdtYWRQbHVnSW5Mb2FkZWQnLCB7IGRldGFpbDogcGx1Z2luIH0pO1xyXG4gICAgICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgfTtcclxuICAgIE1vbG90b3ZBZHMucHJvdG90eXBlLmluaXRQbHVnaW4gPSBmdW5jdGlvbiAocGx1Z2luKSB7XHJcbiAgICAgICAgdmFyIHQwID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgdmFyIHBsdWdpbkluZGV4ID0gd2luZG93Ll9tb2xvdG92QWRzLnBsdWdpbnMuaW5kZXhPZihwbHVnaW4pO1xyXG4gICAgICAgIHdpbmRvdy5fbW9sb3RvdkFkcy5wbHVnaW5zW3BsdWdpbkluZGV4XS5pbml0KG1hZE9wdGlvbnNbcGx1Z2luLm5hbWVdKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiBzdWNjZXNzKCkge1xyXG4gICAgICAgICAgICB2YXIgdDEgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm8ocGx1Z2luLm5hbWUsICd0b3RhbCBleGVjdXRpb24gdGltZTogJywgdDEgLSB0MCwgJ21zJyk7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoXCJQbHVnaW5cIiwgcGx1Z2luLm5hbWUsIFwiaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoJ21hZFBsdWdJbkluaXRhbGl6ZWQnLCB7IGRldGFpbDogcGx1Z2luIH0pO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBNb2xvdG92QWRzLnByb3RvdHlwZS5pbml0QWxsUGx1Z2lucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucGx1Z2lucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmluaXRQbHVnaW4odGhpcy5wbHVnaW5zW2ldKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIE1vbG90b3ZBZHM7XHJcbn0oKSk7XHJcbmV4cG9ydHMuTW9sb3RvdkFkcyA9IE1vbG90b3ZBZHM7XHJcbmlmICh3aW5kb3cpXHJcbiAgICB3aW5kb3cuX21vbG90b3ZBZHMgPSBuZXcgTW9sb3RvdkFkcygpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgQWRTbG90ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQWRTbG90KEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5IVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMubGF6eWxvYWRFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hdXRvUmVmcmVzaEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmF1dG9SZWZyZXNoQ291bnRlciA9IDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQWRTbG90O1xyXG59KCkpO1xyXG5leHBvcnRzLkFkU2xvdCA9IEFkU2xvdDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIHZpZXdwb3J0XzEgPSByZXF1aXJlKFwiLi92aWV3cG9ydFwiKTtcclxudmFyIGxvZ2dlcl8xID0gcmVxdWlyZShcIi4vbG9nZ2VyXCIpO1xyXG52YXIgYWRzbG90XzEgPSByZXF1aXJlKFwiLi9hZHNsb3RcIik7XHJcbnZhciBBZFNsb3RMb2FkZXI7XHJcbihmdW5jdGlvbiAoQWRTbG90TG9hZGVyKSB7XHJcbiAgICBmdW5jdGlvbiBsb2FkU2xvdHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgdmFyIGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtbWFkXScpO1xyXG4gICAgICAgICAgICB2YXIgc2xvdHMgPSB7fTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gZWxlbWVudHNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZpZXdwb3J0XzEuVmlld3BvcnQuaXNFbGVtZW50VmlzaWJsZShlbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIud2FybihlbC5pZCwgJ2lnbm9yZWQgYmVjYXVzZSBpdCBpcyBub3QgdmlzaWJsZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2xvdHNbZWwuaWRdID0gbmV3IGFkc2xvdF8xLkFkU2xvdChlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoc2xvdHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgQWRTbG90TG9hZGVyLmxvYWRTbG90cyA9IGxvYWRTbG90cztcclxuICAgIGZ1bmN0aW9uIGxvYWRTbG90KGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgdmFyIHNsb3RzID0ge307XHJcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZWw7XHJcbiAgICAgICAgICAgIHNsb3RzW2VsZW1lbnQuaWRdID0gbmV3IGFkc2xvdF8xLkFkU2xvdChlbGVtZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoc2xvdHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgQWRTbG90TG9hZGVyLmxvYWRTbG90ID0gbG9hZFNsb3Q7XHJcbiAgICBmdW5jdGlvbiBkZWxldGVTbG90KGVsKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgdmFyIHNsb3RzID0ge307XHJcbiAgICAgICAgICAgIGRlbGV0ZSBzbG90c1tlbF07XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHNsb3RzKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIEFkU2xvdExvYWRlci5kZWxldGVTbG90ID0gZGVsZXRlU2xvdDtcclxufSkoQWRTbG90TG9hZGVyID0gZXhwb3J0cy5BZFNsb3RMb2FkZXIgfHwgKGV4cG9ydHMuQWRTbG90TG9hZGVyID0ge30pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIExvZ2dlcjtcclxuKGZ1bmN0aW9uIChMb2dnZXIpIHtcclxuICAgIHZhciBkZXZNb2RlRW5hYmxlZCA9IGxvY2F0aW9uLmhhc2guaW5kZXhPZignZGV2ZWxvcG1lbnQnKSA+PSAwO1xyXG4gICAgZnVuY3Rpb24gbG9nKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIubG9nID0gbG9nO1xyXG4gICAgZnVuY3Rpb24gbG9nV2l0aFRpbWUoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9nKGdldEN1cnJlbnRUaW1lU3RyaW5nKCksICctPicsIGl0ZW1zLmpvaW4oJyAnKSk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIubG9nV2l0aFRpbWUgPSBsb2dXaXRoVGltZTtcclxuICAgIGZ1bmN0aW9uIGluZm8oKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUuaW5mby5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuaW5mbyA9IGluZm87XHJcbiAgICBmdW5jdGlvbiBpbmZvV2l0aFRpbWUoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5mbyhnZXRDdXJyZW50VGltZVN0cmluZygpLCAnLT4nLCBpdGVtcy5qb2luKCcgJykpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmluZm9XaXRoVGltZSA9IGluZm9XaXRoVGltZTtcclxuICAgIGZ1bmN0aW9uIHdhcm4oKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIud2FybiA9IHdhcm47XHJcbiAgICBmdW5jdGlvbiBlcnJvcigpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuZXJyb3IgPSBlcnJvcjtcclxuICAgIGZ1bmN0aW9uIGNvbnNvbGVXZWxjb21lTWVzc2FnZSgpIHtcclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5sb2coXCIlYyBfXyAgICAgICBfXyAgIF9fX19fXyAgIF9fX19fX18gIFxcbnwgIFxcXFwgICAgIC8gIFxcXFwgLyAgICAgIFxcXFwgfCAgICAgICBcXFxcIFxcbnwgJCRcXFxcICAgLyAgJCR8ICAkJCQkJCRcXFxcfCAkJCQkJCQkXFxcXFxcbnwgJCQkXFxcXCAvICAkJCR8ICQkX198ICQkfCAkJCAgfCAkJFxcbnwgJCQkJFxcXFwgICQkJCR8ICQkICAgICQkfCAkJCAgfCAkJFxcbnwgJCRcXFxcJCQgJCQgJCR8ICQkJCQkJCQkfCAkJCAgfCAkJFxcbnwgJCQgXFxcXCQkJHwgJCR8ICQkICB8ICQkfCAkJF9fLyAkJFxcbnwgJCQgIFxcXFwkIHwgJCR8ICQkICB8ICQkfCAkJCAgICAkJFxcbiBcXFxcJCQgICAgICBcXFxcJCQgXFxcXCQkICAgXFxcXCQkIFxcXFwkJCQkJCQkXFxuXFxuXCIsIFwiY29sb3I6cmVkO1wiKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnJWNcXG5Nb2xvdG92IEFkcyAtIERldmVsb3BlciBDb25zb2xlXFxuXFxuJywgJ2NvbG9yOmJsdWU7Jyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuY29uc29sZVdlbGNvbWVNZXNzYWdlID0gY29uc29sZVdlbGNvbWVNZXNzYWdlO1xyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSB7XHJcbiAgICAgICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpLmdldEhvdXJzKCkgKyAnOicgKyBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0U2Vjb25kcygpICsgJy4nICsgbmV3IERhdGUoKS5nZXRNaWxsaXNlY29uZHMoKTtcclxuICAgICAgICByZXR1cm4gdGltZTtcclxuICAgIH1cclxufSkoTG9nZ2VyID0gZXhwb3J0cy5Mb2dnZXIgfHwgKGV4cG9ydHMuTG9nZ2VyID0ge30pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIFZpZXdwb3J0O1xyXG4oZnVuY3Rpb24gKFZpZXdwb3J0KSB7XHJcbiAgICBmdW5jdGlvbiBpc0VsZW1lbnRJblZpZXdwb3J0KGVsZW1lbnQsIHRocmVzaG9sZCkge1xyXG4gICAgICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICByZXR1cm4gKHJlY3QudG9wID49IDAgJiZcclxuICAgICAgICAgICAgcmVjdC5sZWZ0ID49IDAgJiZcclxuICAgICAgICAgICAgcmVjdC5ib3R0b20gLSB0aHJlc2hvbGQgPD0gKHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSAmJlxyXG4gICAgICAgICAgICByZWN0LnJpZ2h0IDw9ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpKTtcclxuICAgIH1cclxuICAgIFZpZXdwb3J0LmlzRWxlbWVudEluVmlld3BvcnQgPSBpc0VsZW1lbnRJblZpZXdwb3J0O1xyXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50VmlzaWJsZShlbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuICEhKGVsZW1lbnQub2Zmc2V0V2lkdGggfHwgZWxlbWVudC5vZmZzZXRIZWlnaHQgfHwgZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBWaWV3cG9ydC5pc0VsZW1lbnRWaXNpYmxlID0gaXNFbGVtZW50VmlzaWJsZTtcclxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UoZWxlbWVudCkge1xyXG4gICAgICAgIHZhciByZWN0VG9wID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgdmFyIHRvcCA9IHJlY3RUb3AgPiAwID8gd2luZG93LmlubmVySGVpZ2h0IC0gcmVjdFRvcCA6IE1hdGguYWJzKHJlY3RUb3ApO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB0b3AgLyBlbGVtZW50LmNsaWVudEhlaWdodDtcclxuICAgICAgICByZXN1bHQgPSByZWN0VG9wID4gMCA/IHJlc3VsdCA6IDEgLSByZXN1bHQ7XHJcbiAgICAgICAgaWYgKHJlc3VsdCA8IDApXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IDA7XHJcbiAgICAgICAgaWYgKHJlc3VsdCA+IDEpXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IDE7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAqIDEwMDtcclxuICAgIH1cclxuICAgIFZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UgPSBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlO1xyXG59KShWaWV3cG9ydCA9IGV4cG9ydHMuVmlld3BvcnQgfHwgKGV4cG9ydHMuVmlld3BvcnQgPSB7fSkpO1xyXG4iXX0=
