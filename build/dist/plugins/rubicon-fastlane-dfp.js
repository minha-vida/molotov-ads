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
var RubiconFastlaneDfpAdSlot = /** @class */ (function (_super) {
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
var RubiconFastlaneDfp = /** @class */ (function () {
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
                        autorefresh_1.AutoRefresh.start(slot, options, self.autoRefresh);
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
    RubiconFastlaneDfp.prototype.autoRefresh = function (slot, options) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hZHNsb3QuanMiLCJidWlsZC9zcmMvbW9kdWxlcy9hdXRvcmVmcmVzaC5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL2xvZ2dlci5qcyIsImJ1aWxkL3NyYy9tb2R1bGVzL3ZpZXdwb3J0LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvZG91YmxlY2xpY2svZG91YmxlY2xpY2suYWRzbG90LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvcnViaWNvbi1mYXN0bGFuZS1kZnAvcnViaWNvbi5mYXN0bGFuZS5kZnAuYWRzbG90LmpzIiwiYnVpbGQvc3JjL3BsdWdpbnMvcnViaWNvbi1mYXN0bGFuZS1kZnAvcnViaWNvbi5mYXN0bGFuZS5kZnAucGx1Z2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgQWRTbG90ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQWRTbG90KEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5IVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIHRoaXMubGF6eWxvYWRFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hdXRvUmVmcmVzaEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmF1dG9SZWZyZXNoQ291bnRlciA9IDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQWRTbG90O1xyXG59KCkpO1xyXG5leHBvcnRzLkFkU2xvdCA9IEFkU2xvdDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGxvZ2dlcl8xID0gcmVxdWlyZShcIi4vbG9nZ2VyXCIpO1xyXG52YXIgdmlld3BvcnRfMSA9IHJlcXVpcmUoXCIuL3ZpZXdwb3J0XCIpO1xyXG52YXIgQXV0b1JlZnJlc2g7XHJcbihmdW5jdGlvbiAoQXV0b1JlZnJlc2gpIHtcclxuICAgIGZ1bmN0aW9uIHN0YXJ0KHNsb3QsIG9wdGlvbnMsIHJlZnJlc2hGdW5jdGlvbikge1xyXG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XHJcbiAgICAgICAgaWYgKCFzbG90LmF1dG9SZWZyZXNoRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGlmIChzbG90LmF1dG9SZWZyZXNoQ291bnRlciA8PSBzbG90LmF1dG9SZWZyZXNoTGltaXQpIHtcclxuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmluZm9XaXRoVGltZShzbG90Lm5hbWUsICdyZWZyZXNoaW5nIGluJywgc2xvdC5hdXRvUmVmcmVzaFRpbWUsICdzZWNvbmRzICgnLCBzbG90LmF1dG9SZWZyZXNoQ291bnRlciwgJy8nLCBzbG90LmF1dG9SZWZyZXNoTGltaXQsICcpJyk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQocmVmcmVzaFNsb3RGb3JBdXRvUm90YXRlLCBzbG90LmF1dG9SZWZyZXNoVGltZSAqIDEwMDAsIHNsb3QsIHJlZnJlc2hGdW5jdGlvbiwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHNsb3QuYXV0b1JlZnJlc2hDb3VudGVyKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzbG90LmF1dG9SZWZyZXNoRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mb1dpdGhUaW1lKHNsb3QubmFtZSwgJ2F1dG8gcmVmcmVzaCBlbmRlZCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEF1dG9SZWZyZXNoLnN0YXJ0ID0gc3RhcnQ7XHJcbiAgICBmdW5jdGlvbiByZWZyZXNoU2xvdEZvckF1dG9Sb3RhdGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKSB7XHJcbiAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNsb3QubmFtZSwgJ3N0YXJ0aW5nIHJlZnJlc2ggZm9yIGF1dG8gcm90YXRlJyk7XHJcbiAgICAgICAgQXV0b1JlZnJlc2gucmVmcmVzaElmVmlld2FibGUoc2xvdCwgcmVmcmVzaEZ1bmN0aW9uLCBvcHRpb25zKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHJlZnJlc2hJZlZpZXdhYmxlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbiwgb3B0aW9ucykge1xyXG4gICAgICAgIGlmIChkb2N1bWVudC5oaWRkZW4pIHtcclxuICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKHNsb3QubmFtZSwgJ21hcmtlZCBmb3IgcmVmcmVzaCBvbiB2aXNpYmlsaXR5Y2hhbmdlJyk7XHJcbiAgICAgICAgICAgIHZhciB2aXNpYmlsaXR5QmFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIEF1dG9SZWZyZXNoLnJlZnJlc2hJZlZpZXdhYmxlKHNsb3QsIHJlZnJlc2hGdW5jdGlvbiwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgdmlzaWJpbGl0eUJhY2spO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgdmlzaWJpbGl0eUJhY2spO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuZWVkZWRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UgPSA1MDtcclxuICAgICAgICBpZiAodmlld3BvcnRfMS5WaWV3cG9ydC5nZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlKHNsb3QuSFRNTEVsZW1lbnQpID49IG5lZWRlZFZpZXdhYmlsaXR5UGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICByZWZyZXNoRnVuY3Rpb24oc2xvdCwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2xvdC5uYW1lLCAndmlld2FibGl0eSBsb3dlciB0aGFuIDUwJSwgbm90IHJlZnJlc2hpbmcnKTtcclxuICAgICAgICAgICAgdmFyIGludGVydmFsRm9yUmVmcmVzaCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2aWV3cG9ydF8xLlZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2Uoc2xvdC5IVE1MRWxlbWVudCkgPj0gbmVlZGVkVmlld2FiaWxpdHlQZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmcmVzaEZ1bmN0aW9uKHNsb3QsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxGb3JSZWZyZXNoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgNTAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgQXV0b1JlZnJlc2gucmVmcmVzaElmVmlld2FibGUgPSByZWZyZXNoSWZWaWV3YWJsZTtcclxufSkoQXV0b1JlZnJlc2ggPSBleHBvcnRzLkF1dG9SZWZyZXNoIHx8IChleHBvcnRzLkF1dG9SZWZyZXNoID0ge30pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIExvZ2dlcjtcclxuKGZ1bmN0aW9uIChMb2dnZXIpIHtcclxuICAgIHZhciBkZXZNb2RlRW5hYmxlZCA9IGxvY2F0aW9uLmhhc2guaW5kZXhPZignZGV2ZWxvcG1lbnQnKSA+PSAwO1xyXG4gICAgZnVuY3Rpb24gbG9nKCkge1xyXG4gICAgICAgIHZhciBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XHJcbiAgICAgICAgICAgIGl0ZW1zW19pXSA9IGFyZ3VtZW50c1tfaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZGV2TW9kZUVuYWJsZWQpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIubG9nID0gbG9nO1xyXG4gICAgZnVuY3Rpb24gbG9nV2l0aFRpbWUoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbG9nKGdldEN1cnJlbnRUaW1lU3RyaW5nKCksICctPicsIGl0ZW1zLmpvaW4oJyAnKSk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIubG9nV2l0aFRpbWUgPSBsb2dXaXRoVGltZTtcclxuICAgIGZ1bmN0aW9uIGluZm8oKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUuaW5mby5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuaW5mbyA9IGluZm87XHJcbiAgICBmdW5jdGlvbiBpbmZvV2l0aFRpbWUoKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5mbyhnZXRDdXJyZW50VGltZVN0cmluZygpLCAnLT4nLCBpdGVtcy5qb2luKCcgJykpO1xyXG4gICAgfVxyXG4gICAgTG9nZ2VyLmluZm9XaXRoVGltZSA9IGluZm9XaXRoVGltZTtcclxuICAgIGZ1bmN0aW9uIHdhcm4oKSB7XHJcbiAgICAgICAgdmFyIGl0ZW1zID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcclxuICAgICAgICAgICAgaXRlbXNbX2ldID0gYXJndW1lbnRzW19pXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFkZXZNb2RlRW5hYmxlZClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnNvbGUud2Fybi5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIud2FybiA9IHdhcm47XHJcbiAgICBmdW5jdGlvbiBlcnJvcigpIHtcclxuICAgICAgICB2YXIgaXRlbXMgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xyXG4gICAgICAgICAgICBpdGVtc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5lcnJvci5hcHBseShjb25zb2xlLCBpdGVtcyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuZXJyb3IgPSBlcnJvcjtcclxuICAgIGZ1bmN0aW9uIGNvbnNvbGVXZWxjb21lTWVzc2FnZSgpIHtcclxuICAgICAgICBpZiAoIWRldk1vZGVFbmFibGVkKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc29sZS5sb2coXCIlYyBfXyAgICAgICBfXyAgIF9fX19fXyAgIF9fX19fX18gIFxcbnwgIFxcXFwgICAgIC8gIFxcXFwgLyAgICAgIFxcXFwgfCAgICAgICBcXFxcIFxcbnwgJCRcXFxcICAgLyAgJCR8ICAkJCQkJCRcXFxcfCAkJCQkJCQkXFxcXFxcbnwgJCQkXFxcXCAvICAkJCR8ICQkX198ICQkfCAkJCAgfCAkJFxcbnwgJCQkJFxcXFwgICQkJCR8ICQkICAgICQkfCAkJCAgfCAkJFxcbnwgJCRcXFxcJCQgJCQgJCR8ICQkJCQkJCQkfCAkJCAgfCAkJFxcbnwgJCQgXFxcXCQkJHwgJCR8ICQkICB8ICQkfCAkJF9fLyAkJFxcbnwgJCQgIFxcXFwkIHwgJCR8ICQkICB8ICQkfCAkJCAgICAkJFxcbiBcXFxcJCQgICAgICBcXFxcJCQgXFxcXCQkICAgXFxcXCQkIFxcXFwkJCQkJCQkXFxuXFxuXCIsIFwiY29sb3I6cmVkO1wiKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnJWNcXG5Nb2xvdG92IEFkcyAtIERldmVsb3BlciBDb25zb2xlXFxuXFxuJywgJ2NvbG9yOmJsdWU7Jyk7XHJcbiAgICB9XHJcbiAgICBMb2dnZXIuY29uc29sZVdlbGNvbWVNZXNzYWdlID0gY29uc29sZVdlbGNvbWVNZXNzYWdlO1xyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFRpbWVTdHJpbmcoKSB7XHJcbiAgICAgICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpLmdldEhvdXJzKCkgKyAnOicgKyBuZXcgRGF0ZSgpLmdldE1pbnV0ZXMoKSArICc6JyArIG5ldyBEYXRlKCkuZ2V0U2Vjb25kcygpICsgJy4nICsgbmV3IERhdGUoKS5nZXRNaWxsaXNlY29uZHMoKTtcclxuICAgICAgICByZXR1cm4gdGltZTtcclxuICAgIH1cclxufSkoTG9nZ2VyID0gZXhwb3J0cy5Mb2dnZXIgfHwgKGV4cG9ydHMuTG9nZ2VyID0ge30pKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIFZpZXdwb3J0O1xyXG4oZnVuY3Rpb24gKFZpZXdwb3J0KSB7XHJcbiAgICBmdW5jdGlvbiBpc0VsZW1lbnRJblZpZXdwb3J0KGVsZW1lbnQsIHRocmVzaG9sZCkge1xyXG4gICAgICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICByZXR1cm4gKHJlY3QudG9wID49IDAgJiZcclxuICAgICAgICAgICAgcmVjdC5sZWZ0ID49IDAgJiZcclxuICAgICAgICAgICAgcmVjdC5ib3R0b20gLSB0aHJlc2hvbGQgPD0gKHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSAmJlxyXG4gICAgICAgICAgICByZWN0LnJpZ2h0IDw9ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpKTtcclxuICAgIH1cclxuICAgIFZpZXdwb3J0LmlzRWxlbWVudEluVmlld3BvcnQgPSBpc0VsZW1lbnRJblZpZXdwb3J0O1xyXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50VmlzaWJsZShlbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuICEhKGVsZW1lbnQub2Zmc2V0V2lkdGggfHwgZWxlbWVudC5vZmZzZXRIZWlnaHQgfHwgZWxlbWVudC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCk7XHJcbiAgICB9XHJcbiAgICBWaWV3cG9ydC5pc0VsZW1lbnRWaXNpYmxlID0gaXNFbGVtZW50VmlzaWJsZTtcclxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UoZWxlbWVudCkge1xyXG4gICAgICAgIHZhciByZWN0VG9wID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgdmFyIHRvcCA9IHJlY3RUb3AgPiAwID8gd2luZG93LmlubmVySGVpZ2h0IC0gcmVjdFRvcCA6IE1hdGguYWJzKHJlY3RUb3ApO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB0b3AgLyBlbGVtZW50LmNsaWVudEhlaWdodDtcclxuICAgICAgICByZXN1bHQgPSByZWN0VG9wID4gMCA/IHJlc3VsdCA6IDEgLSByZXN1bHQ7XHJcbiAgICAgICAgaWYgKHJlc3VsdCA8IDApXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IDA7XHJcbiAgICAgICAgaWYgKHJlc3VsdCA+IDEpXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IDE7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdCAqIDEwMDtcclxuICAgIH1cclxuICAgIFZpZXdwb3J0LmdldEN1cnJlbnRWaWV3YWJpbGl0eVBlcmNlbnRhZ2UgPSBnZXRDdXJyZW50Vmlld2FiaWxpdHlQZXJjZW50YWdlO1xyXG59KShWaWV3cG9ydCA9IGV4cG9ydHMuVmlld3BvcnQgfHwgKGV4cG9ydHMuVmlld3BvcnQgPSB7fSkpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGFkc2xvdF8xID0gcmVxdWlyZShcIi4uLy4uL21vZHVsZXMvYWRzbG90XCIpO1xyXG52YXIgRG91YmxlQ2xpY2tBZFNsb3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICBfX2V4dGVuZHMoRG91YmxlQ2xpY2tBZFNsb3QsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBEb3VibGVDbGlja0FkU2xvdChIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIEhUTUxFbGVtZW50KSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLkhUTUxFbGVtZW50ID0gSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgdmFyIGRzID0gSFRNTEVsZW1lbnQuZGF0YXNldDtcclxuICAgICAgICB2YXIgc2l6ZSA9IGV2YWwoZHNbJ21hZFNpemUnXSk7XHJcbiAgICAgICAgX3RoaXMuYWRVbml0ID0gZHNbJ21hZEFkdW5pdCddO1xyXG4gICAgICAgIF90aGlzLm5hbWUgPSBIVE1MRWxlbWVudC5pZDtcclxuICAgICAgICBfdGhpcy5zaXplID0gc2l6ZTtcclxuICAgICAgICBfdGhpcy5pc091dE9mUGFnZSA9IEJvb2xlYW4oZHNbJ21hZE91dE9mUGFnZSddKTtcclxuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaFRpbWUgPSBOdW1iZXIoZHNbJ21hZEF1dG9SZWZyZXNoSW5TZWNvbmRzJ10pIHx8IDA7XHJcbiAgICAgICAgX3RoaXMuYXV0b1JlZnJlc2hMaW1pdCA9IE51bWJlcihkc1snbWFkQXV0b1JlZnJlc2hMaW1pdCddKSB8fCAwO1xyXG4gICAgICAgIF90aGlzLmxhenlsb2FkT2Zmc2V0ID0gTnVtYmVyKGRzWydtYWRMYXp5bG9hZE9mZnNldCddKTtcclxuICAgICAgICBfdGhpcy5hdXRvUmVmcmVzaEVuYWJsZWQgPSBfdGhpcy5hdXRvUmVmcmVzaFRpbWUgPiAwO1xyXG4gICAgICAgIGlmIChfdGhpcy5sYXp5bG9hZE9mZnNldCkge1xyXG4gICAgICAgICAgICBfdGhpcy5sYXp5bG9hZE9mZnNldCA9IF90aGlzLmxhenlsb2FkT2Zmc2V0IHx8IDA7XHJcbiAgICAgICAgICAgIF90aGlzLmxhenlsb2FkRW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIERvdWJsZUNsaWNrQWRTbG90LnByb3RvdHlwZS5kZWZpbmVTbG90ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzT3V0T2ZQYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG91YmxlY2xpY2tBZFNsb3QgPSBnb29nbGV0YWcuZGVmaW5lT3V0T2ZQYWdlU2xvdCh0aGlzLmFkVW5pdCwgdGhpcy5uYW1lKS5hZGRTZXJ2aWNlKGdvb2dsZXRhZy5wdWJhZHMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRvdWJsZWNsaWNrQWRTbG90ID0gZ29vZ2xldGFnLmRlZmluZVNsb3QodGhpcy5hZFVuaXQsIHRoaXMuc2l6ZSwgdGhpcy5uYW1lKS5hZGRTZXJ2aWNlKGdvb2dsZXRhZy5wdWJhZHMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIERvdWJsZUNsaWNrQWRTbG90LnByb3RvdHlwZS5hZGRTaXplTWFwcGluZyA9IGZ1bmN0aW9uIChzaXplcykge1xyXG4gICAgICAgIHRoaXMuZG91YmxlY2xpY2tBZFNsb3QuZGVmaW5lU2l6ZU1hcHBpbmcoc2l6ZXMpO1xyXG4gICAgfTtcclxuICAgIERvdWJsZUNsaWNrQWRTbG90LnByb3RvdHlwZS5hZGRTZXRUYXJnZXRpbmcgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgdGhpcy5kb3VibGVjbGlja0FkU2xvdC5zZXRUYXJnZXRpbmcoJ3Bvc2l0aW9uJywgdGFyZ2V0KTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuYWRkQ29sbGFwc2VFbXB0eURpdnMgPSBmdW5jdGlvbiAodmFsMSwgdmFsMikge1xyXG4gICAgICAgIHRoaXMuZG91YmxlY2xpY2tBZFNsb3Quc2V0Q29sbGFwc2VFbXB0eURpdih2YWwxLCB2YWwyKTtcclxuICAgIH07XHJcbiAgICBEb3VibGVDbGlja0FkU2xvdC5wcm90b3R5cGUuZGlzcGxheSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBnb29nbGV0YWcuZGlzcGxheSh0aGlzLm5hbWUpO1xyXG4gICAgfTtcclxuICAgIERvdWJsZUNsaWNrQWRTbG90LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5yZWZyZXNoKFt0aGlzLmRvdWJsZWNsaWNrQWRTbG90XSk7XHJcbiAgICB9O1xyXG4gICAgRG91YmxlQ2xpY2tBZFNsb3QucHJvdG90eXBlLmdldERvdWJsZWNsaWNrQWRTbG90ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRvdWJsZWNsaWNrQWRTbG90O1xyXG4gICAgfTtcclxuICAgIHJldHVybiBEb3VibGVDbGlja0FkU2xvdDtcclxufShhZHNsb3RfMS5BZFNsb3QpKTtcclxuZXhwb3J0cy5Eb3VibGVDbGlja0FkU2xvdCA9IERvdWJsZUNsaWNrQWRTbG90O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcclxuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxuICAgIH07XHJcbn0pKCk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxudmFyIGRvdWJsZWNsaWNrX2Fkc2xvdF8xID0gcmVxdWlyZShcIi4uL2RvdWJsZWNsaWNrL2RvdWJsZWNsaWNrLmFkc2xvdFwiKTtcclxudmFyIFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIF9fZXh0ZW5kcyhSdWJpY29uRmFzdGxhbmVEZnBBZFNsb3QsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBSdWJpY29uRmFzdGxhbmVEZnBBZFNsb3QoSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBIVE1MRWxlbWVudCkgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5IVE1MRWxlbWVudCA9IEhUTUxFbGVtZW50O1xyXG4gICAgICAgIF90aGlzLnJ1Ymljb25Qb3NpdGlvbiA9IEhUTUxFbGVtZW50LmRhdGFzZXQubWFkUnViaWNvblBvc2l0aW9uO1xyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdC5wcm90b3R5cGUuZGVmaW5lU2xvdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnJ1Ymljb25BZFNsb3QgPSBydWJpY29udGFnLmRlZmluZVNsb3QodGhpcy5hZFVuaXQsIHRoaXMuc2l6ZSwgdGhpcy5uYW1lKVxyXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24odGhpcy5ydWJpY29uUG9zaXRpb24pXHJcbiAgICAgICAgICAgIC5zZXRGUEkoJ2FkdW5pdCcsIHRoaXMuYWRVbml0LnN1YnN0cmluZyh0aGlzLmFkVW5pdC5sYXN0SW5kZXhPZignLycpICsgMSkpXHJcbiAgICAgICAgICAgIC5zZXRGUEkoJ3Bvc2l0aW9uJywgdGhpcy5ydWJpY29uUG9zaXRpb24pO1xyXG4gICAgfTtcclxuICAgIFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdC5wcm90b3R5cGUuZGVmaW5lU2xvdERvdWJsZWNsaWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUuZGVmaW5lU2xvdC5jYWxsKHRoaXMpO1xyXG4gICAgfTtcclxuICAgIFJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdC5wcm90b3R5cGUuc2V0VGFyZ2V0aW5nRm9yR1BUU2xvdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBydWJpY29udGFnLnNldFRhcmdldGluZ0ZvckdQVFNsb3QoX3N1cGVyLnByb3RvdHlwZS5nZXREb3VibGVjbGlja0FkU2xvdC5jYWxsKHRoaXMpKTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gUnViaWNvbkZhc3RsYW5lRGZwQWRTbG90O1xyXG59KGRvdWJsZWNsaWNrX2Fkc2xvdF8xLkRvdWJsZUNsaWNrQWRTbG90KSk7XHJcbmV4cG9ydHMuUnViaWNvbkZhc3RsYW5lRGZwQWRTbG90ID0gUnViaWNvbkZhc3RsYW5lRGZwQWRTbG90O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG52YXIgdmlld3BvcnRfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL3ZpZXdwb3J0XCIpO1xyXG52YXIgcnViaWNvbl9mYXN0bGFuZV9kZnBfYWRzbG90XzEgPSByZXF1aXJlKFwiLi9ydWJpY29uLmZhc3RsYW5lLmRmcC5hZHNsb3RcIik7XHJcbnZhciBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuLi8uLi9tb2R1bGVzL2xvZ2dlclwiKTtcclxudmFyIGF1dG9yZWZyZXNoXzEgPSByZXF1aXJlKFwiLi4vLi4vbW9kdWxlcy9hdXRvcmVmcmVzaFwiKTtcclxudmFyIFJ1Ymljb25GYXN0bGFuZURmcCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIFJ1Ymljb25GYXN0bGFuZURmcCgpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBcIlJ1Ymljb25GYXN0bGFuZURmcFwiO1xyXG4gICAgICAgIHRoaXMuc2xvdHMgPSB7fTtcclxuICAgICAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgUnViaWNvbkZhc3RsYW5lRGZwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICB0aGlzLnNsb3RzID0gdGhpcy5nZXRTbG90cygpO1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICBnb29nbGV0YWcuY21kLnB1c2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLnB1YmFkcygpLmRpc2FibGVJbml0aWFsTG9hZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcnViaWNvbnRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLnNsb3RzW3Nsb3ROYW1lXS5ydWJpY29uUG9zaXRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmRlZmluZVNsb3QoKTtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKHNlbGYubmFtZSwgJ1J1Ymljb24gYWQgc2xvdCBkZWZpbmVkOiAnLCBzZWxmLnNsb3RzW3Nsb3ROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpdGVtIGluIG9wdGlvbnMuc2V0RlBJKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gb3B0aW9ucy5zZXRGUElbaXRlbV07XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZyhzZWxmLm5hbWUsICd0YXJnZXRpbmcgRlBJJywgaXRlbSwgJ2FzJywgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJ1Ymljb250YWcuc2V0RlBJKGl0ZW0sIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGl0ZW0gaW4gb3B0aW9ucy5zZXRGUFYpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBvcHRpb25zLnNldEZQVltpdGVtXTtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKHNlbGYubmFtZSwgJ3RhcmdldGluZyBGUFYnLCBpdGVtLCAnYXMnLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcnViaWNvbnRhZy5zZXRGUFYoaXRlbSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcnViaWNvbnRhZy5ydW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnJ1Ymljb250YWdSdW4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMucnViaWNvbnRhZ1J1bigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaEFkcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgZ29vZ2xldGFnLmNtZC5wdXNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2xvdHNbc2xvdE5hbWVdLmRlZmluZVNsb3REb3VibGVjbGljaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKHNlbGYubmFtZSwgJ0RGUCBhZCBzbG90IGRlZmluZWQ6ICcsIHNlbGYuc2xvdHNbc2xvdE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaXRlbSBpbiBvcHRpb25zLmN1c3RvbVRhcmdldHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gb3B0aW9ucy5jdXN0b21UYXJnZXRzW2l0ZW1dO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nKCd0YXJnZXRpbmcnLCBpdGVtLCAnYXMnLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5zZXRUYXJnZXRpbmcoaXRlbSwgW3ZhbHVlXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5wdWJhZHMoKS5hZGRFdmVudExpc3RlbmVyKCdzbG90UmVuZGVyRW5kZWQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyXzEuTG9nZ2VyLmxvZ1dpdGhUaW1lKGV2ZW50LnNsb3QuZ2V0U2xvdEVsZW1lbnRJZCgpLCAnZmluaXNoZWQgc2xvdCByZW5kZXJpbmcnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNsb3QgPSBzZWxmLnNsb3RzW2V2ZW50LnNsb3QuZ2V0U2xvdEVsZW1lbnRJZCgpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b3JlZnJlc2hfMS5BdXRvUmVmcmVzaC5zdGFydChzbG90LCBvcHRpb25zLCBzZWxmLmF1dG9SZWZyZXNoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TbG90UmVuZGVyRW5kZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2xvdFJlbmRlckVuZGVkKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIuaW5mbygnZW5hYmxpbmcgc2VydmljZXMnKTtcclxuICAgICAgICAgICAgICAgICAgICBnb29nbGV0YWcuZW5hYmxlU2VydmljZXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBzbG90TmFtZSBpbiBzZWxmLnNsb3RzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdvb2dsZXRhZy5kaXNwbGF5KHNlbGYuc2xvdHNbc2xvdE5hbWVdLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXJfMS5Mb2dnZXIubG9nV2l0aFRpbWUoc2VsZi5zbG90c1tzbG90TmFtZV0ubmFtZSwgJ3N0YXJ0ZWQgZGlzcGxheWluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5sb2FkZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaEFkcygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIDE1MDApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBSdWJpY29uRmFzdGxhbmVEZnAucHJvdG90eXBlLnJlZnJlc2hBZHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgc2xvdE5hbWUgaW4gdGhpcy5zbG90cykge1xyXG4gICAgICAgICAgICB2YXIgc2xvdCA9IHRoaXMuc2xvdHNbc2xvdE5hbWVdO1xyXG4gICAgICAgICAgICBpZiAoc2xvdC5sYXp5bG9hZEVuYWJsZWQpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgc2xvdC5zZXRUYXJnZXRpbmdGb3JHUFRTbG90KCk7XHJcbiAgICAgICAgICAgIHNsb3QucmVmcmVzaCgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBSdWJpY29uRmFzdGxhbmVEZnAucHJvdG90eXBlLm9uU2Nyb2xsUmVmcmVzaExhenlsb2FkZWRTbG90cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uIHJlZnJlc2hBZHNJZkl0SXNJblZpZXdwb3J0KGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHNsb3ROYW1lIGluIHNlbGYuc2xvdHMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzbG90ID0gc2VsZi5zbG90c1tzbG90TmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoc2xvdC5sYXp5bG9hZEVuYWJsZWQgJiYgdmlld3BvcnRfMS5WaWV3cG9ydC5pc0VsZW1lbnRJblZpZXdwb3J0KHNsb3QuSFRNTEVsZW1lbnQsIHNsb3QubGF6eWxvYWRPZmZzZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5zZXRUYXJnZXRpbmdGb3JHUFRTbG90KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5yZWZyZXNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2xvdC5sYXp5bG9hZEVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIFJ1Ymljb25GYXN0bGFuZURmcC5wcm90b3R5cGUuYXV0b1JlZnJlc2ggPSBmdW5jdGlvbiAoc2xvdCwgb3B0aW9ucykge1xyXG4gICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2dXaXRoVGltZShzbG90Lm5hbWUsICdzdGFydGVkIHJlZnJlc2hpbmcnKTtcclxuICAgICAgICBpZiAoc2xvdC5ydWJpY29uUG9zaXRpb24pIHtcclxuICAgICAgICAgICAgcnViaWNvbnRhZy5jbWQucHVzaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzbG90LmRlZmluZVNsb3QoKTtcclxuICAgICAgICAgICAgICAgIGxvZ2dlcl8xLkxvZ2dlci5sb2coc2VsZi5uYW1lLCAnUnViaWNvbiBhZCBzbG90IGRlZmluZWQ6ICcsIHNsb3QpO1xyXG4gICAgICAgICAgICAgICAgcnViaWNvbnRhZy5ydW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNsb3Quc2V0VGFyZ2V0aW5nRm9yR1BUU2xvdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNsb3QucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICAgICAgfSwgeyBzbG90czogW3Nsb3QucnViaWNvbkFkU2xvdF0gfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2xvdC5yZWZyZXNoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIFJ1Ymljb25GYXN0bGFuZURmcC5wcm90b3R5cGUuZ2V0U2xvdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNsb3RzID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgc2xvdCBpbiB3aW5kb3cuX21vbG90b3ZBZHMuc2xvdHMpIHtcclxuICAgICAgICAgICAgdmFyIGVsID0gd2luZG93Ll9tb2xvdG92QWRzLnNsb3RzW3Nsb3RdLkhUTUxFbGVtZW50O1xyXG4gICAgICAgICAgICBpZiAoIWVsLmRhdGFzZXQubWFkQWR1bml0ICYmICFlbC5kYXRhc2V0Lm1hZFJ1Ymljb24pXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgc2xvdHNbZWwuaWRdID0gbmV3IHJ1Ymljb25fZmFzdGxhbmVfZGZwX2Fkc2xvdF8xLlJ1Ymljb25GYXN0bGFuZURmcEFkU2xvdChlbCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5fbW9sb3RvdkFkcy5zbG90c1tlbC5pZF0gPSBzbG90c1tlbC5pZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzbG90cztcclxuICAgIH07XHJcbiAgICByZXR1cm4gUnViaWNvbkZhc3RsYW5lRGZwO1xyXG59KCkpO1xyXG5leHBvcnRzLlJ1Ymljb25GYXN0bGFuZURmcCA9IFJ1Ymljb25GYXN0bGFuZURmcDtcclxud2luZG93Ll9tb2xvdG92QWRzLmxvYWRQbHVnaW4obmV3IFJ1Ymljb25GYXN0bGFuZURmcCgpKTtcclxuIl19
