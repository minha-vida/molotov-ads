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

    let refreshSlots = [];

    this.slots = this.getSlots();

    this.PREBID_TIMEOUT = options.PREBID_TIMEOUT;

    return new Promise<void>(function(resolve, reject) {

      googletag.cmd.push(function() {
        googletag.pubads().enableSingleRequest();
        googletag.pubads().disableInitialLoad();
        Logger.info('enabling services');
        googletag.enableServices();
      });

      pbjs.que.push(function() {

        Logger.infoWithTime("Set config of prebid");
        pbjs.setConfig({
          debug: options.debug,
          priceGranularity: options.granularity,
          enableSendAllBids: options.sendAllBids,
          bidderSequence: options.sequence,
          bidderTimeout: options.PREBID_TIMEOUT,
          publisherDomain: options.domain,
          pageOptions: options.pageOptions,
        });

        Logger.infoWithTime("Adding adunits to prebid...");
        pbjs.addAdUnits(options.adUnits);

        Logger.infoWithTime("Requesting bids...");
        pbjs.requestBids({
          adUnitCodes: options.initialAdUnits,
          bidsBackHandler: sendAdserverRequest
        });
      });

      setTimeout(function() {
        Logger.infoWithTime("Timeout reached, will send ad server request");
        sendAdserverRequest();
      }, options.PREBID_TIMEOUT);

      googletag.cmd.push(function() {
        for (let slotName in self.slots) {
          self.slots[slotName].defineSlot();
          Logger.log(self.name, 'ad slot defined: ', self.slots[slotName]);
          
          if(options.sizes[slotName]) {
            self.slots[slotName].addSizeMapping(options.sizes[slotName]);
          }
          if (options.target[slotName]) {
            self.slots[slotName].addSetTargeting(options.target[slotName]);
          }
          if (options.collapse[slotName]) {
            self.slots[slotName].addCollapseEmptyDivs(true, true);
          } else {
            self.slots[slotName].addCollapseEmptyDivs(true);
          }
        }

        for (let item in options.customTargets) {
          let value = options.customTargets[item];

          Logger.log('targeting', item, 'as', value);
          googletag.pubads().setTargeting(item, [value]);
        }

        googletag.pubads().addEventListener('slotRenderEnded', function(event) {
          Logger.logWithTime(event.slot.getSlotElementId(), 'finished slot rendering');

          let slot = self.slots[event.slot.getSlotElementId()];

          let checkList = true;

          for (let id in options.disableRotateList.lineItemIds) {
            if (event.lineItemId == options.disableRotateList.lineItemIds[id]) {
              checkList = false;
            }
          }
          for (let id in options.disableRotateList.orderIds) {
            if (event.campaignId == options.disableRotateList.orderIds[id]) {
              checkList = false;
            }
          }

          if (checkList) {
            AutoRefresh.start(slot, options, self.autoRefresh);
          }

          if (options.onSlotRenderEnded){
            options.onSlotRenderEnded(event);
          }
        });

        self.onScrollRefreshLazyloadedSlots(options);

      });

      function sendAdserverRequest() {
        if (pbjs.adserverRequestSent) return;

        Logger.infoWithTime("Sending ad server request");
        pbjs.adserverRequestSent = true;

        googletag.cmd.push(function() {
          pbjs.que.push(function() {

            Logger.infoWithTime("setTargetingForGPTAsync called");
            pbjs.setTargetingForGPTAsync();

            if (options.logBids) {
              Logger.infoWithTime("Bids returned, listing:");
              Logger.log(pbjs.getAdserverTargeting());
            }

            for (let slotName in self.slots) {
              self.slots[slotName].display();
              Logger.logWithTime(self.slots[slotName].name, 'started displaying');

              if (self.slots[slotName].lazyloadEnabled) {

              } else {
                refreshSlots.push(self.slots[slotName].doubleclickAdSlot);
              }
              
            }

            googletag.pubads().refresh(refreshSlots);

            resolve();
          });
        });
      }

      document.addEventListener("madSlotLoaded", function(e: CustomEvent) {
        let slot = e.detail;
        slot = self.getSingleSlot(slot);

        googletag.cmd.push(function() {
          for (let slotName in slot) {
            self.slots[slotName] = slot[slotName];

            slot[slotName].defineSlot();
            Logger.log(self.name, 'ad slot defined: ', slot[slotName]);

            if(options.sizes[slotName]) {
              slot[slotName].addSizeMapping(options.sizes[slotName]);
            }
            if (options.target[slotName]) {
              slot[slotName].addSetTargeting(options.target[slotName]);
            }
            if (options.collapse[slotName]) {
              slot[slotName].addCollapseEmptyDivs(true, true);
            } else {
              slot[slotName].addCollapseEmptyDivs(true);
            }
            slot[slotName].display();
            slot[slotName].refresh();
          }
        });
      });

    });
}

private onScrollRefreshLazyloadedSlots(options: any) {
  let self = this;
  window.addEventListener('scroll', function refreshAdsIfItIsInViewport(event) {
    for (let slotName in self.slots) {
      let slot: DoubleClickAdSlot = self.slots[slotName];
      if (slot.lazyloadEnabled && Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {

        pbjs.que.push(function() {
          pbjs.requestBids({
            adUnitCodes: [slot.name],
            bidsBackHandler: function() {
              pbjs.setTargetingForGPTAsync([slot.name]);
              slot.refresh();
            }
          });
        });

        slot.lazyloadEnabled = false;
        
      }
    }
  });
}

private autoRefresh(slot: DoubleClickAdSlot, options: any) {
  Logger.logWithTime(slot.name, 'started refreshing');

  pbjs.que.push(function() {
    pbjs.requestBids({
      adUnitCodes: [slot.name],
      bidsBackHandler: function() {
        pbjs.setTargetingForGPTAsync([slot.name]);
        slot.refresh();
      }
    });
  });
}

private getSingleSlot(slot) {
  let slots = {};
  let el = slot.HTMLElement; 

  slots[el.id] = new DoubleClickAdSlot(el);

  window._molotovAds.slots[el.id] = slots[el.id];

  return slots;
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