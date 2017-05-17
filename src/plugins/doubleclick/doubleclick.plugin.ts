import { DoubleClickAdSlot } from "./doubleclick.adslot";
import { PlugInInterface } from "../../interfaces/plugin.interface";
import { Logger } from "../../modules/logger";
import { Viewport } from "../../modules/viewport";
import { AutoRefresh } from "../../modules/autorefresh";

declare var googletag: any;

export class DoubleClickPlugIn implements PlugInInterface {
    name: string = "DoubleClick";

    slots: {} = {};

    init(options: any): Promise<void> {
        let self = this;

        this.slots = this.getSlots();

        return new Promise<void>(function(resolve, reject) {
            googletag.cmd.push(function() {
                for (let slotName in self.slots) {
                    self.slots[slotName].defineSlot();
                    Logger.log(self.name, 'ad slot defined: ', self.slots[slotName]);
                }

                for (let item in options.customTargets) {
                    let value = options.customTargets[item];

                    Logger.log('targeting', item, 'as', value);
                    googletag.pubads().setTargeting(item, [value]);
                }

                googletag.pubads().addEventListener('slotRenderEnded', function(event) {
                    Logger.logWithTime(event.slot.getSlotElementId(), 'finished slot rendering');

                    let slot = self.slots[event.slot.getSlotElementId()];
                    AutoRefresh.start(slot, options, self.autoRefresh);

                    if (options.onSlotRenderEnded)
                        options.onSlotRenderEnded(event);
                });

                Logger.info('enabling services');

                googletag.pubads().disableInitialLoad();
                googletag.enableServices();

                for (let slotName in self.slots) {
                    self.slots[slotName].display();
                    Logger.logWithTime(self.slots[slotName].name, 'started displaying');
                }

                self.onScrollRefreshLazyloadedSlots();

                resolve();
            });
        });
    }

    private onScrollRefreshLazyloadedSlots() {
        let self = this;
        window.addEventListener('scroll', function refreshAdsIfItIsInViewport(event) {
            for (let slotName in self.slots) {
                let slot: DoubleClickAdSlot = self.slots[slotName];
                if (slot.lazyloadEnabled && Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
                    slot.refresh();
                    slot.lazyloadEnabled = false;
                }
            }
        });
    }

    private autoRefresh(slot: DoubleClickAdSlot, options: any) {
        Logger.logWithTime(slot.name, 'started refreshing');
        slot.refresh();
    }

    private getSlots() {
        let slots = {};

        for (let slot in window._molotovAds.slots) {
            let el = window._molotovAds.slots[slot].HTMLElement;

            if(el.dataset.madAdunit === '') continue;

            slots[el.id] = new DoubleClickAdSlot(el);

            window._molotovAds.slots[el.id] = slots[el.id];
        }

        return slots;
    }
}

window._molotovAds.loadPlugin(new DoubleClickPlugIn());
