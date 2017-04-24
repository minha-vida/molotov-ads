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
    function start(slot, refreshFunction) {
        if (!slot.autoRefreshEnabled)
            return;
        if (slot.autoRefreshCounter <= slot.autoRefreshLimit) {
            logger_1.Logger.infoWithTime(slot.name, 'refreshing in', slot.autoRefreshTime, 'seconds (', slot.autoRefreshCounter, '/', slot.autoRefreshLimit, ')');
            setTimeout(refreshSlotForAutoRotate, slot.autoRefreshTime * 1000, slot, refreshFunction);
            slot.autoRefreshCounter++;
        }
        else {
            slot.autoRefreshEnabled = false;
            logger_1.Logger.infoWithTime(slot.name, 'auto refresh ended');
        }
    }
    AutoRefresh.start = start;
    function refreshSlotForAutoRotate(slot, refreshFunction) {
        logger_1.Logger.logWithTime(slot.name, 'starting refresh for auto rotate');
        AutoRefresh.refreshIfViewable(slot, refreshFunction);
    }
    function refreshIfViewable(slot, refreshFunction) {
        if (document.hidden) {
            logger_1.Logger.logWithTime(slot.name, 'marked for refresh on visibilitychange');
            var visibilityBack = function () {
                AutoRefresh.refreshIfViewable(slot, refreshFunction);
                document.removeEventListener('visibilitychange', visibilityBack);
            };
            document.addEventListener('visibilitychange', visibilityBack);
            return;
        }
        var neededViewabilityPercentage = 50;
        if (viewport_1.Viewport.getCurrentViewabilityPercentage(slot.HTMLElement) >= neededViewabilityPercentage) {
            refreshFunction(slot);
        }
        else {
            logger_1.Logger.logWithTime(slot.name, 'viewablity lower than 50%, not refreshing');
            var intervalForRefresh = setInterval(function () {
                if (viewport_1.Viewport.getCurrentViewabilityPercentage(slot.HTMLElement) >= neededViewabilityPercentage) {
                    refreshFunction(slot);
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
var DoubleClickAdSlot = (function (_super) {
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
    DoubleClickAdSlot.prototype.display = function () {
        googletag.display(this.name);
        if (this.lazyloadEnabled)
            return;
        this.refresh();
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
var doubleclick_adslot_1 = require("../doubleclick/doubleclick.adslot");
var RubiconFastlaneDfpAdSlot = (function (_super) {
    __extends(RubiconFastlaneDfpAdSlot, _super);
    function RubiconFastlaneDfpAdSlot(HTMLElement) {
        var _this = _super.call(this, HTMLElement) || this;
        _this.HTMLElement = HTMLElement;
        _this.rubiconPosition = HTMLElement.dataset.madRubiconPosition;
        return _this;
    }
    RubiconFastlaneDfpAdSlot.prototype.defineSlot = function () {
        this.rubiconAdSlot = rubicontag.defineSlot(this.adUnit, this.size, this.name)
            .setPosition(this.rubiconPosition)
            .setFPI('adunit', this.adUnit.substring(this.adUnit.lastIndexOf('/') + 1))
            .setFPI('position', this.rubiconPosition);
    };
    RubiconFastlaneDfpAdSlot.prototype.defineSlotDoubleclick = function () {
        _super.prototype.defineSlot.call(this);
    };
    RubiconFastlaneDfpAdSlot.prototype.setTargetingForGPTSlot = function () {
        rubicontag.setTargetingForGPTSlot(_super.prototype.getDoubleclickAdSlot.call(this));
    };
    return RubiconFastlaneDfpAdSlot;
}(doubleclick_adslot_1.DoubleClickAdSlot));
exports.RubiconFastlaneDfpAdSlot = RubiconFastlaneDfpAdSlot;

},{"../doubleclick/doubleclick.adslot":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var viewport_1 = require("../../modules/viewport");
var rubicon_fastlane_dfp_adslot_1 = require("./rubicon.fastlane.dfp.adslot");
var logger_1 = require("../../modules/logger");
var autorefresh_1 = require("../../modules/autorefresh");
var RubiconFastlaneDfp = (function () {
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
                        autorefresh_1.AutoRefresh.start(slot, self.autoRefresh);
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
    RubiconFastlaneDfp.prototype.autoRefresh = function (slot) {
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

},{"../../modules/autorefresh":2,"../../modules/logger":3,"../../modules/viewport":4,"./rubicon.fastlane.dfp.adslot":6}]},{},[6,7])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvZG91YmxlY2xpY2svZG91YmxlY2xpY2suYWRzbG90LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvcnViaWNvbi1mYXN0bGFuZS1kZnAvcnViaWNvbi5mYXN0bGFuZS5kZnAuYWRzbG90LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvcnViaWNvbi1mYXN0bGFuZS1kZnAvcnViaWNvbi5mYXN0bGFuZS5kZnAucGx1Z2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgQWRTbG90ID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEFkU2xvdChIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudDtcclxuICAgICAgICB0aGlzLmxhenlsb2FkRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYXV0b1JlZnJlc2hFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hdXRvUmVmcmVzaENvdW50ZXIgPSAxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEFkU2xvdDtcclxufSgpKTtcclxuZXhwb3J0cy5BZFNsb3QgPSBBZFNsb3Q7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcclxudmFyIHZpZXdwb3J0XzEgPSByZXF1aXJlKFwiLi92aWV3cG9ydFwiKTtcclxudmFyIEF1dG9SZWZyZXNoO1xyXG4oZnVuY3Rpb24gKEF1dG9SZWZyZXNoKSB7XHJcbiAgICBmdW5jdGlvbiBzdGFydChzbG90LCByZWZyZXNoRnVuY3Rpb24pIHtcclxuICAgICAgICBpZiAoIXNsb3QuYXV0b1JlZnJlc2hFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgaWYgKHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyIDw9IHNsb3QuYXV0b1JlZnJlc2hMaW1pdCkge1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKHNsb3QubmFtZSwgJ3JlZnJlc2hpbmcgaW4nLCBzbG90LmF1dG9SZWZyZXNoVGltZSwgJ3NlY29uZHMgKCcsIHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyLCAnLycsIHNsb3QuYXV0b1JlZnJlc2hMaW1pdCwgJyknKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChyZWZyZXNoU2xvdEZvckF1dG9Sb3RhdGUsIHNsb3QuYXV0b1JlZnJlc2hUaW1lICogMTAwMCwgc2xvdCwgcmVmcmVzaEZ1bmN0aW9uKTtcclxuICAgICAgICAgICAgc2xvdC5hdXRvUmVmcmVzaENvdW50ZXIrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNsb3QuYXV0b1JlZnJlc2hFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5pbmZvV2l0aFRpbWUoc2xvdC5uYW1lLCAnYXV0byByZWZyZXNoIGVuZGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQXV0b1JlZnJlc2guc3RhcnQgPSBzdGFydDtcclxuICAgIGZ1bmN0aW9uIHJlZnJlc2hTbG90Rm9yQXV0b1JvdGF0ZShzbG90LCByZWZyZXNoRnVuY3Rpb24pIHtcclxuICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnc3RhcnRpbmcgcmVmcmVzaCBmb3IgYXV0byByb3RhdGUnKTtcclxuICAgICAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZShzbG90LCByZWZyZXNoRnVuY3Rpb24pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50LmhpZGRlbikge1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAnbWFya2VkIGZvciByZWZyZXNoIG9uIHZpc2liaWxpdHljaGFuZ2UnKTtcclxuICAgICAgICAgICAgdmFyIHZpc2liaWxpdHlCYWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgQXV0b1JlZnJlc2gucmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCB2aXNpYmlsaXR5QmFjayk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSA9IDUwO1xyXG4gICAgICAgIGlmICh2aWV3cG9ydF8xLlZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2Uoc2xvdC5IVE1MRWxlbWVudCkgPj0gbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIHJlZnJlc2hGdW5jdGlvbihzbG90KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICd2aWV3YWJsaXR5IGxvd2VyIHRoYW4gNTAlLCBub3QgcmVmcmVzaGluZycpO1xyXG4gICAgICAgICAgICB2YXIgaW50ZXJ2YWxGb3JSZWZyZXNoID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZpZXdwb3J0XzEuVmlld3BvcnQuZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZShzbG90LkhUTUxFbGVtZW50KSA+PSBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZWZyZXNoRnVuY3Rpb24oc2xvdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEZvclJlZnJlc2gpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCA1MDAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBBdXRvUmVmcmVzaC5yZWZyZXNoSWZWaWV3YWJsZSA9IHJlZnJlc2hJZlZpZXdhYmxlO1xyXG59KShBdXRvUmVmcmVzaCA9IGV4cG9ydHMuQXV0b1JlZnJlc2ggfHwgKGV4cG9ydHMuQXV0b1JlZnJlc2ggPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIExvZ2dlcjtcclxuKGZ1bmN0aW9uIChMb2dnZXIpIHtcclxuICAgIHZhciBkZXZNb2RlRW5hYmxlZCA9IGxvY2F0aW9uLmhhc2guaW5kZXhPZignZGV2ZWxvcG1lbnQnKSA+PSAwO1xyXG4gICAgZnVuY3Rpb24gbG9nKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIubG9nID0gbG9nO1xyXG4gICAgZnVuY3Rpb24gbG9nV2l0aFRpbWUoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9nKGdldEN1cnJlbnRUaW1lU3RyaW5nKCksICctPicsIGl0ZW1zLmpvaW4oJyAnKSk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIubG9nV2l0aFRpbWUgPSBsb2dXaXRoVGltZTtcclxuICAgIGZ1bmN0aW9uIGluZm8oKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUuaW5mby5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuaW5mbyA9IGluZm87XHJcbiAgICBmdW5jdGlvbiBpbmZvV2l0aFRpbWUoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5mbyhnZXRDdXJyZW50VGltZVN0cmluZygpLCAnLT4nLCBpdGVtcy5qb2luKCcgJykpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmluZm9XaXRoVGltZSA9IGluZm9XaXRoVGltZTtcclxuICAgIGZ1bmN0aW9uIHdhcm4oKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIud2FybiA9IHdhcm47XHJcbiAgICBmdW5jdGlvbiBlcnJvcigpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuZXJyb3IgPSBlcnJvcjtcclxuICAgIGZ1bmN0aW9uIGNvbnNvbGVXZWxjb21lTWVzc2FnZSgpIHtcclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5sb2coXCIlYyBfXyAgICAgICBfXyAgIF9fX19fXyAgIF9fX19fX18gIFxcbnwgIFxcXFwgICAgIC8gIFxcXFwgLyAgICAgIFxcXFwgfCAgICAgICBcXFxcIFxcbnwgJCRcXFxcICAgLyAgJCR8ICAkJCQkJCRcXFxcfCAkJCQkJCQkXFxcXFxcbnwgJCQkXFxcXCAvICAkJCR8ICQkX198ICQkfCAkJCAgfCAkJFxcbnwgJCQkJFxcXFwgICQkJCR8ICQkICAgICQkfCAkJCAgfCAkJFxcbnwgJCRcXFxcJCQgJCQgJCR8ICQkJCQkJCQkfCAkJCAgfCAkJFxcbnwgJCQgXFxcXCQkJHwgJCR8ICQkICB8ICQkfCAkJF9fLyAkJFxcbnwgJCQgIFxcXFwkIHwgJCR8ICQkICB8ICQkfCAkJCAgICAkJFxcbiBcXFxcJCQgICAgICBcXFxcJCQgXFxcXCQkICAgXFxcXCQkIFxcXFwkJCQkJCQkXFxuXFxuXCIsIFwiY29sb3I6cmVkO1wiKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnJWNcXG5Nb2xvdG92IEFkcyAtIERldmVsb3BlciBDb25zb2xlXFxuXFxuJywgJ2NvbG9yOmJsdWU7Jyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuY29uc29sZVdlbGNvbWVNZXNzYWdlID0gY29uc29sZVdlbGNvbWVNZXNzYWdlO1xyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSB7XHJcbiAgICAgICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpLmdldEhvdXJzKCkgKyAnOicgKyBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0U2Vjb25kcygpICsgJy4nICsgbmV3IERhdGUoKS5nZXRNaWxsaXNlY29uZHMoKTtcclxuICAgICAgICByZXR1cm4gdGltZTtcclxuICAgIH1cclxufSkoTG9nZ2VyID0gZXhwb3J0cy5Mb2dnZXIgfHwgKGV4cG9ydHMuTG9nZ2VyID0ge30pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBWaWV3cG9ydDtcclxuKGZ1bmN0aW9uIChWaWV3cG9ydCkge1xyXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50SW5WaWV3cG9ydChlbGVtZW50LCB0aHJlc2hvbGQpIHtcclxuICAgICAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgcmV0dXJuIChyZWN0LnRvcCA+PSAwICYmXHJcbiAgICAgICAgICAgIHJlY3QubGVmdCA+PSAwICYmXHJcbiAgICAgICAgICAgIHJlY3QuYm90dG9tIC0gdGhyZXNob2xkIDw9ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkgJiZcclxuICAgICAgICAgICAgcmVjdC5yaWdodCA8PSAod2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKSk7XHJcbiAgICB9XHJcbiAgICBWaWV3cG9ydC5pc0VsZW1lbnRJblZpZXdwb3J0ID0gaXNFbGVtZW50SW5WaWV3cG9ydDtcclxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudFZpc2libGUoZWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiAhIShlbGVtZW50Lm9mZnNldFdpZHRoIHx8IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8IGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpO1xyXG4gICAgfVxyXG4gICAgVmlld3BvcnQuaXNFbGVtZW50VmlzaWJsZSA9IGlzRWxlbWVudFZpc2libGU7XHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgcmVjdFRvcCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgICAgIHZhciB0b3AgPSByZWN0VG9wID4gMCA/IHdpbmRvdy5pbm5lckhlaWdodCAtIHJlY3RUb3AgOiBNYXRoLmFicyhyZWN0VG9wKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdG9wIC8gZWxlbWVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgcmVzdWx0ID0gcmVjdFRvcCA+IDAgPyByZXN1bHQgOiAxIC0gcmVzdWx0O1xyXG4gICAgICAgIGlmIChyZXN1bHQgPCAwKVxyXG4gICAgICAgICAgICByZXN1bHQgPSAwO1xyXG4gICAgICAgIGlmIChyZXN1bHQgPiAxKVxyXG4gICAgICAgICAgICByZXN1bHQgPSAxO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQgKiAxMDA7XHJcbiAgICB9XHJcbiAgICBWaWV3cG9ydC5nZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlID0gZ2V0Q3VycmVudFZpZXdhYmlsaXR5UGVyY2VudGFnZTtcclxufSkoVmlld3BvcnQgPSBleHBvcnRzLlZpZXdwb3J0IHx8IChleHBvcnRzLlZpZXdwb3J0ID0ge30pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBhZHNsb3RfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2Fkc2xvdFwiKTtcclxudmFyIERvdWJsZUNsaWNrQWRTbG90ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhEb3VibGVDbGlja0FkU2xvdCwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIERvdWJsZUNsaWNrQWRTbG90KEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgSFRNTEVsZW1lbnQpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuSFRNTEVsZW1lbnQgPSBIVE1MRWxlbWVudDtcclxuICAgICAgICB2YXIgZHMgPSBIVE1MRWxlbWVudC5kYXRhc2V0O1xyXG4gICAgICAgIHZhciBzaXplID0gZXZhbChkc1snbWFkU2l6ZSddKTtcclxuICAgICAgICBfdGhpcy5hZFVuaXQgPSBkc1snbWFkQWR1bml0J107XHJcbiAgICAgICAgX3RoaXMubmFtZSA9IEhUTUxFbGVtZW50LmlkO1xyXG4gICAgICAgIF90aGlzLnNpemUgPSBzaXplO1xyXG4gICAgICAgIF90aGlzLmlzT3V0T2ZQYWdlID0gQm9vbGVhbihkc1snbWFkT3V0T2ZQYWdlJ10pO1xyXG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoVGltZSA9IE51bWJlcihkc1snbWFkQXV0b1JlZnJlc2hJblNlY29uZHMnXSkgfHwgMDtcclxuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaExpbWl0ID0gTnVtYmVyKGRzWydtYWRBdXRvUmVmcmVzaExpbWl0J10pIHx8IDA7XHJcbiAgICAgICAgX3RoaXMubGF6eWxvYWRPZmZzZXQgPSBOdW1iZXIoZHNbJ21hZExhenlsb2FkT2Zmc2V0J10pO1xyXG4gICAgICAgIF90aGlzLmF1dG9SZWZyZXNoRW5hYmxlZCA9IF90aGlzLmF1dG9SZWZyZXNoVGltZSA+IDA7XHJcbiAgICAgICAgaWYgKF90aGlzLmxhenlsb2FkT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgIF90aGlzLmxhenlsb2FkT2Zmc2V0ID0gX3RoaXMubGF6eWxvYWRPZmZzZXQgfHwgMDtcclxuICAgICAgICAgICAgX3RoaXMubGF6eWxvYWRFbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLmRlZmluZVNsb3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPdXRPZlBhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5kb3VibGVjbGlja0FkU2xvdCA9IGdvb2dsZXRhZy5kZWZpbmVPdXRPZlBhZ2VTbG90KHRoaXMuYWRVbml0LCB0aGlzLm5hbWUpLmFkZFNlcnZpY2UoZ29vZ2xldGFnLnB1YmFkcygpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG91YmxlY2xpY2tBZFNsb3QgPSBnb29nbGV0YWcuZGVmaW5lU2xvdCh0aGlzLmFkVW5pdCwgdGhpcy5zaXplLCB0aGlzLm5hbWUpLmFkZFNlcnZpY2UoZ29vZ2xldGFnLnB1YmFkcygpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLmRpc3BsYXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZ29vZ2xldGFnLmRpc3BsYXkodGhpcy5uYW1lKTtcclxuICAgICAgICBpZiAodGhpcy5sYXp5bG9hZEVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLnJlZnJlc2goKTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBnb29nbGV0YWcucHViYWRzKCkucmVmcmVzaChbdGhpcy5kb3VibGVjbGlja0FkU2xvdF0pO1xyXG4gICAgfTtcclxuICAgIERvdWJsZUNsaWNrQWRTbG90LnByb3RvdHlwZS5nZXREb3VibGVjbGlja0FkU2xvdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kb3VibGVjbGlja0FkU2xvdDtcclxuICAgIH07XHJcbiAgICByZXR1cm4gRG91YmxlQ2xpY2tBZFNsb3Q7XHJcbn0oYWRzbG90XzEuQWRTbG90KSk7XHJcbmV4cG9ydHMuRG91YmxlQ2xpY2tBZFNsb3QgPSBEb3VibGVDbGlja0FkU2xvdDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbiAgICB9O1xyXG59KSgpO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciBkb3VibGVjbGlja19hZHNsb3RfMSA9IHJlcXVpcmUoXCIuLi9kb3VibGVjbGljay9kb3VibGVjbGljay5hZHNsb3RcIik7XHJcbnZhciBSdWJpY29uRmFzdGxhbmVEZnBBZFNsb3QgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgX19leHRlbmRzKFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdCwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdChIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIEhUTUxFbGVtZW50KSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgX3RoaXMucnViaWNvblBvc2l0aW9uID0gSFRNTEVsZW1lbnQuZGF0YXNldC5tYWRSdWJpY29uUG9zaXRpb247XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgUnViaWNvbkZhc3RsYW5lRGZwQWRTbG90LnByb3RvdHlwZS5kZWZpbmVTbG90ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMucnViaWNvbkFkU2xvdCA9IHJ1Ymljb250YWcuZGVmaW5lU2xvdCh0aGlzLmFkVW5pdCwgdGhpcy5zaXplLCB0aGlzLm5hbWUpXHJcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLnJ1Ymljb25Qb3NpdGlvbilcclxuICAgICAgICAgICAgLnNldEZQSSgnYWR1bml0JywgdGhpcy5hZFVuaXQuc3Vic3RyaW5nKHRoaXMuYWRVbml0Lmxhc3RJbmRleE9mKCcvJykgKyAxKSlcclxuICAgICAgICAgICAgLnNldEZQSSgncG9zaXRpb24nLCB0aGlzLnJ1Ymljb25Qb3NpdGlvbik7XHJcbiAgICB9O1xyXG4gICAgUnViaWNvbkZhc3RsYW5lRGZwQWRTbG90LnByb3RvdHlwZS5kZWZpbmVTbG90RG91YmxlY2xpY2sgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5kZWZpbmVTbG90LmNhbGwodGhpcyk7XHJcbiAgICB9O1xyXG4gICAgUnViaWNvbkZhc3RsYW5lRGZwQWRTbG90LnByb3RvdHlwZS5zZXRUYXJnZXRpbmdGb3JHUFRTbG90ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJ1Ymljb250YWcuc2V0VGFyZ2V0aW5nRm9yR1BUU2xvdChfc3VwZXIucHJvdG90eXBlLmdldERvdWJsZWNsaWNrQWRTbG90LmNhbGwodGhpcykpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBSdWJpY29uRmFzdGxhbmVEZnBBZFNsb3Q7XHJcbn0oZG91YmxlY2xpY2tfYWRzbG90XzEuRG91YmxlQ2xpY2tBZFNsb3QpKTtcclxuZXhwb3J0cy5SdWJpY29uRmFzdGxhbmVEZnBBZFNsb3QgPSBSdWJpY29uRmFzdGxhbmVEZnBBZFNsb3Q7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbnZhciB2aWV3cG9ydF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvdmlld3BvcnRcIik7XHJcbnZhciBydWJpY29uX2Zhc3RsYW5lX2RmcF9hZHNsb3RfMSA9IHJlcXVpcmUoXCIuL3J1Ymljb24uZmFzdGxhbmUuZGZwLmFkc2xvdFwiKTtcclxudmFyIGxvZ2dlcl8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvbG9nZ2VyXCIpO1xyXG52YXIgYXV0b3JlZnJlc2hfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2F1dG9yZWZyZXNoXCIpO1xyXG52YXIgUnViaWNvbkZhc3RsYW5lRGZwID0gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFJ1Ymljb25GYXN0bGFuZURmcCgpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIlJ1Ymljb25GYXN0bGFuZURmcFwiO1xyXG4gICAgICAgIHRoaXMuc2xvdHMgPSB7fTtcclxuICAgICAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgUnViaWNvbkZhc3RsYW5lRGZwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLnNsb3RzID0gdGhpcy5nZXRTbG90cygpO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBnb29nbGV0YWcuY21kLnB1c2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLnB1YmFkcygpLmRpc2FibGVJbml0aWFsTG9hZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcnViaWNvbnRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLnNsb3RzW3Nsb3ROYW1lXS5ydWJpY29uUG9zaXRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmRlZmluZVNsb3QoKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKHNlbGYubmFtZSwgJ1J1Ymljb24gYWQgc2xvdCBkZWZpbmVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIG9wdGlvbnMuc2V0RlBJKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gb3B0aW9ucy5zZXRGUElbaXRlbV07XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICd0YXJnZXRpbmcgRlBJJywgaXRlbSwgJ2FzJywgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1Ymljb250YWcuc2V0RlBJKGl0ZW0sIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb3B0aW9ucy5zZXRGUFYpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvcHRpb25zLnNldEZQVltpdGVtXTtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKHNlbGYubmFtZSwgJ3RhcmdldGluZyBGUFYnLCBpdGVtLCAnYXMnLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnViaWNvbnRhZy5zZXRGUFYoaXRlbSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcnViaWNvbnRhZy5ydW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnJ1Ymljb250YWdSdW4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucnViaWNvbnRhZ1J1bigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaEFkcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLmNtZC5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmRlZmluZVNsb3REb3VibGVjbGljaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKHNlbGYubmFtZSwgJ0RGUCBhZCBzbG90IGRlZmluZWQ6ICcsIHNlbGYuc2xvdHNbc2xvdE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvcHRpb25zLmN1c3RvbVRhcmdldHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gb3B0aW9ucy5jdXN0b21UYXJnZXRzW2l0ZW1dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKCd0YXJnZXRpbmcnLCBpdGVtLCAnYXMnLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5zZXRUYXJnZXRpbmcoaXRlbSwgW3ZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5hZGRFdmVudExpc3RlbmVyKCdzbG90UmVuZGVyRW5kZWQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKGV2ZW50LnNsb3QuZ2V0U2xvdEVsZW1lbnRJZCgpLCAnZmluaXNoZWQgc2xvdCByZW5kZXJpbmcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNsb3QgPSBzZWxmLnNsb3RzW2V2ZW50LnNsb3QuZ2V0U2xvdEVsZW1lbnRJZCgpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b3JlZnJlc2hfMS5BdXRvUmVmcmVzaC5zdGFydChzbG90LCBzZWxmLmF1dG9SZWZyZXNoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TbG90UmVuZGVyRW5kZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2xvdFJlbmRlckVuZGVkKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mbygnZW5hYmxpbmcgc2VydmljZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGV0YWcuZW5hYmxlU2VydmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5kaXNwbGF5KHNlbGYuc2xvdHNbc2xvdE5hbWVdLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2VsZi5zbG90c1tzbG90TmFtZV0ubmFtZSwgJ3N0YXJ0ZWQgZGlzcGxheWluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5sb2FkZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaEFkcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDE1MDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBSdWJpY29uRmFzdGxhbmVEZnAucHJvdG90eXBlLnJlZnJlc2hBZHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gdGhpcy5zbG90cykge1xyXG4gICAgICAgICAgICB2YXIgc2xvdCA9IHRoaXMuc2xvdHNbc2xvdE5hbWVdO1xyXG4gICAgICAgICAgICBpZiAoc2xvdC5sYXp5bG9hZEVuYWJsZWQpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgc2xvdC5zZXRUYXJnZXRpbmdGb3JHUFRTbG90KCk7XHJcbiAgICAgICAgICAgIHNsb3QucmVmcmVzaCgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBSdWJpY29uRmFzdGxhbmVEZnAucHJvdG90eXBlLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uIHJlZnJlc2hBZHNJZkl0SXNJblZpZXdwb3J0KGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHNsb3ROYW1lIGluIHNlbGYuc2xvdHMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzbG90ID0gc2VsZi5zbG90c1tzbG90TmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoc2xvdC5sYXp5bG9hZEVuYWJsZWQgJiYgdmlld3BvcnRfMS5WaWV3cG9ydC5pc0VsZW1lbnRJblZpZXdwb3J0KHNsb3QuSFRNTEVsZW1lbnQsIHNsb3QubGF6eWxvYWRPZmZzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5zZXRUYXJnZXRpbmdGb3JHUFRTbG90KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5yZWZyZXNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5sYXp5bG9hZEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFJ1Ymljb25GYXN0bGFuZURmcC5wcm90b3R5cGUuYXV0b1JlZnJlc2ggPSBmdW5jdGlvbiAoc2xvdCkge1xyXG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGVkIHJlZnJlc2hpbmcnKTtcclxuICAgICAgICBpZiAoc2xvdC5ydWJpY29uUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgcnViaWNvbnRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzbG90LmRlZmluZVNsb3QoKTtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2coc2VsZi5uYW1lLCAnUnViaWNvbiBhZCBzbG90IGRlZmluZWQ6ICcsIHNsb3QpO1xyXG4gICAgICAgICAgICAgICAgcnViaWNvbnRhZy5ydW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsb3Quc2V0VGFyZ2V0aW5nRm9yR1BUU2xvdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsb3QucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICAgICAgfSwgeyBzbG90czogW3Nsb3QucnViaWNvbkFkU2xvdF0gfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2xvdC5yZWZyZXNoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFJ1Ymljb25GYXN0bGFuZURmcC5wcm90b3R5cGUuZ2V0U2xvdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNsb3RzID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgc2xvdCBpbiB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHMpIHtcclxuICAgICAgICAgICAgdmFyIGVsID0gd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW3Nsb3RdLkhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICBpZiAoIWVsLmRhdGFzZXQubWFkQWR1bml0ICYmICFlbC5kYXRhc2V0Lm1hZFJ1Ymljb24pXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgc2xvdHNbZWwuaWRdID0gbmV3IHJ1Ymljb25fZmFzdGxhbmVfZGZwX2Fkc2xvdF8xLlJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdChlbCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tlbC5pZF0gPSBzbG90c1tlbC5pZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzbG90cztcclxuICAgIH07XHJcbiAgICByZXR1cm4gUnViaWNvbkZhc3RsYW5lRGZwO1xyXG59KCkpO1xyXG5leHBvcnRzLlJ1Ymljb25GYXN0bGFuZURmcCA9IFJ1Ymljb25GYXN0bGFuZURmcDtcclxud2luZG93Ll9tb2xvdG92QWRzLmxvYWRQbHVnaW4obmV3IFJ1Ymljb25GYXN0bGFuZURmcCgpKTtcclxuIl19
