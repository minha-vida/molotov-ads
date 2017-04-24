"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./modules/logger");
var loader_adslot_1 = require("./modules/loader.adslot");
var MolotovAds = (function () {
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
