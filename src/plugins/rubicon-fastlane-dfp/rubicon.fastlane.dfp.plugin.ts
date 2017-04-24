import { PlugInInterface } from "../../interfaces/plugin.interface";
import { Viewport } from "../../modules/viewport";
import { RubiconFastlaneDfpAdSlot } from "./rubicon.fastlane.dfp.adslot";
import { Logger } from "../../modules/logger";
import { AutoRefresh } from "../../modules/autorefresh";

declare var googletag: any;
declare var rubicontag: any;

export class RubiconFastlaneDfp implements PlugInInterface {
  name: string = "RubiconFastlaneDfp";
  slots: {} = {};
  loaded: boolean = false;

  init(options: any): Promise<void> {
    this.slots = this.getSlots();

    var self = this;

    return new Promise<void>(function(resolve, reject) {

      googletag.cmd.push(function() {
        googletag.pubads().disableInitialLoad();
      });

      rubicontag.cmd.push(function() {

        for (let slotName in self.slots) {
          if (!self.slots[slotName].rubiconPosition) continue;

          self.slots[slotName].defineSlot();
          Logger.log(self.name, 'Rubicon ad slot defined: ', self.slots[slotName]);
        }

        for (let item in options.setFPI) {
          let value = options.setFPI[item];

          Logger.log(self.name, 'targeting FPI', item, 'as', value);
          rubicontag.setFPI(item, value);
        }

        for (let item in options.setFPV) {
          let value = options.setFPV[item];

          Logger.log(self.name, 'targeting FPV', item, 'as', value);
          rubicontag.setFPV(item, value);
        }

        rubicontag.run(function() {
          if (options.rubicontagRun)
            options.rubicontagRun();

          self.refreshAds();
          self.loaded = true;
        });

        googletag.cmd.push(function() {
          for (let slotName in self.slots) {
            self.slots[slotName].defineSlotDoubleclick();
            Logger.log(self.name, 'DFP ad slot defined: ', self.slots[slotName]);
          }

          for (let item in options.customTargets) {
            let value = options.customTargets[item];

            Logger.log('targeting', item, 'as', value);
            googletag.pubads().setTargeting(item, [value]);
          }

          googletag.pubads().addEventListener('slotRenderEnded', function(event) {
            Logger.logWithTime(event.slot.getSlotElementId(), 'finished slot rendering');

            let slot = self.slots[event.slot.getSlotElementId()];
            AutoRefresh.start(slot, self.autoRefresh);

            if (options.onSlotRenderEnded)
              options.onSlotRenderEnded(event);
          });

          Logger.info('enabling services');

          googletag.enableServices();

          for (let slotName in self.slots) {
            googletag.display(self.slots[slotName].name);
            Logger.logWithTime(self.slots[slotName].name, 'started displaying');
          }

          self.onScrollRefreshLazyloadedSlots();

          setTimeout(function() {
            if (self.loaded) return;

            self.refreshAds();
          }, 1500);

          resolve();
        });
      });
    });
  }

  private refreshAds() {
    for (let slotName in this.slots) {
      var slot = this.slots[slotName];

      if (slot.lazyloadEnabled) continue;

      slot.setTargetingForGPTSlot();
      slot.refresh();
    }
  }

  private onScrollRefreshLazyloadedSlots() {
    let self = this;
    window.addEventListener('scroll', function refreshAdsIfItIsInViewport(event) {
      for (let slotName in self.slots) {
        let slot: RubiconFastlaneDfpAdSlot = self.slots[slotName];
        if (slot.lazyloadEnabled && Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
          slot.setTargetingForGPTSlot();
          slot.refresh();
          slot.lazyloadEnabled = false;
        }
      }
    });
  }

  private autoRefresh(slot: RubiconFastlaneDfpAdSlot) {
    Logger.logWithTime(slot.name, 'started refreshing');

    if (slot.rubiconPosition) {
      rubicontag.cmd.push(function() {
        slot.defineSlot();
        Logger.log(self.name, 'Rubicon ad slot defined: ', slot);

        rubicontag.run(function() {
          slot.setTargetingForGPTSlot();
          slot.refresh();
        }, { slots: [slot.rubiconAdSlot] });
      });
    } else {
      slot.refresh();
    }
  }

  private getSlots() {
    let slots = {};

    for (let slot in window._molotovAds.slots) {
      let el = window._molotovAds.slots[slot].HTMLElement;

      if (!el.dataset.madAdunit && !el.dataset.madRubicon) continue;

      slots[el.id] = new RubiconFastlaneDfpAdSlot(el);

      window._molotovAds.slots[el.id] = slots[el.id];
    }

    return slots;
  }
}

window._molotovAds.loadPlugin(new RubiconFastlaneDfp());
