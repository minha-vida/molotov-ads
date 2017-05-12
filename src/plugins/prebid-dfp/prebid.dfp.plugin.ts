import { DoubleClickAdSlot } from "../doubleclick/doubleclick.adslot";
import { PlugInInterface } from "../../interfaces/plugin.interface";
import { Logger } from "../../modules/logger";
import { Viewport } from "../../modules/viewport";
import { AutoRefresh } from "../../modules/autorefresh";

declare var googletag: any;
declare var pbjs: any;

export class PrebidDfpPlugIn implements PlugInInterface {
  name: string = "PrebidDfp";

  slots: {} = {};

  PREBID_TIMEOUT: number = 400;

  init(options: any): Promise<void> {
    let self = this;

    this.slots = this.getSlots();

    this.PREBID_TIMEOUT = options.PREBID_TIMEOUT;

    return new Promise<void>(function(resolve, reject) {

      googletag.cmd.push(function() {
        googletag.pubads().disableInitialLoad();
      });

      pbjs.que.push(function() {
        pbjs.addAdUnits(options.adUnits);

        pbjs.requestBids({
          bidsBackHandler: sendAdserverRequest
        });
      });

      function sendAdserverRequest() {
        if (pbjs.adserverRequestSent) return;

        pbjs.adserverRequestSent = true;

        googletag.cmd.push(function() {
          pbjs.que.push(function() {
            pbjs.setTargetingForGPTAsync();
            googletag.pubads().refresh();
          });
        });
      }

      setTimeout(function() {
        sendAdserverRequest();
      }, options.PREBID_TIMEOUT);

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
          AutoRefresh.start(slot, self.autoRefresh);

          if (options.onSlotRenderEnded)
            options.onSlotRenderEnded(event);
        });

        Logger.info('enabling services');

        googletag.pubads().enableSingleRequest();
        googletag.enableServices();

        for (let slotName in self.slots) {
          googletag.display(self.slots[slotName].name);
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

  private autoRefresh(slot: DoubleClickAdSlot) {
    var self = this;
    Logger.logWithTime(slot.name, 'started refreshing');
    pbjs.que.push(function() {
            pbjs.requestBids({
                timeout: 700,
                bidsBackHandler: function() {
                    pbjs.setTargetingForGPTAsync();
                    slot.refresh();
                }
            });
        });
  }

  private getSlots() {
    let slots = {};

    for (let slot in window._molotovAds.slots) {
      let el = window._molotovAds.slots[slot].HTMLElement;

      if (el.dataset.madAdunit === '') continue;

      slots[el.id] = new DoubleClickAdSlot(el);

      window._molotovAds.slots[el.id] = slots[el.id];
    }

    return slots;
  }
}

window._molotovAds.loadPlugin(new PrebidDfpPlugIn());
