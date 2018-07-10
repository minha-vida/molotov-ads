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
})(AdSlotLoader = exports.AdSlotLoader || (exports.AdSlotLoader = {}));
