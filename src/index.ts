import { Logger } from "./modules/logger";
import { PlugInInterface } from "./interfaces/plugin.interface";
import { AdSlotLoader } from "./modules/loader.adslot";
declare var madOptions: any;

declare global {
    interface Window {
        _molotovAds: MolotovAds;
    }
}

export class MolotovAds {

    slots: any = {};
    plugins: PlugInInterface[] = [];

    constructor() {
        var self = this;

        Logger.consoleWelcomeMessage();

        AdSlotLoader.loadSlots().then(function(slots) {
            self.slots = slots;

            var event = new Event('madSlotsLoaded');
            document.dispatchEvent(event);
        });

        document.addEventListener("madPlugInLoaded", function(e: CustomEvent) {
            if (Object.keys(self.slots).length > 0)
                self.initPlugin(e.detail);
        });

        document.addEventListener("madSlotsLoaded", function(e: CustomEvent) {
            self.initAllPlugins();
        });
    }

    loadSlot(el: HTMLElement){
        var self = this;
        AdSlotLoader.loadSlot(el).then(function(slots) {
            self.slots[el.id] = slots[el.id];

            var event = new CustomEvent('madSlotLoaded', { detail: self.slots[el.id] });
            document.dispatchEvent(event);
        });
    }

    loadPlugin(plugin: PlugInInterface) {
        Logger.infoWithTime("Plugin", plugin.name, "loaded");

        window._molotovAds.plugins.push(plugin);

        var event = new CustomEvent('madPlugInLoaded', { detail: plugin });
        document.dispatchEvent(event);
    }

    initPlugin(plugin: PlugInInterface) {
        let t0 = performance.now();

        let pluginIndex = window._molotovAds.plugins.indexOf(plugin);

        window._molotovAds.plugins[pluginIndex].init(madOptions[plugin.name])
        .then(function success() {
            let t1 = performance.now();
            Logger.info(plugin.name, 'total execution time: ', t1 - t0, 'ms');
            Logger.infoWithTime("Plugin", plugin.name, "initialized successfully");

            var event = new CustomEvent('madPlugInInitalized', { detail: plugin });
            document.dispatchEvent(event);
        });
    }

    private initAllPlugins() {
        for (var i = 0; i < this.plugins.length; i++) {
            this.initPlugin(this.plugins[i]);
        }
    }
}

if (window)
    window._molotovAds = new MolotovAds();
