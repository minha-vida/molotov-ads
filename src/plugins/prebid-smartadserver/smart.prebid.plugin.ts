import { SmartAdSlot } from "../smartadserver/smart.adslot";
import { PlugInInterface } from "../../interfaces/plugin.interface";
import { Logger } from "../../modules/logger";
import { Viewport } from "../../modules/viewport";
import { AutoRefresh } from "../../modules/autorefresh";

declare var sas: any;
declare var pbjs: any;

export class SmartPrebidPlugIn implements PlugInInterface {
  name: string = "PrebidSmart";

  slots: {} = {};

  PREBID_TIMEOUT: number = 700;

  options: any = {};

  init(options: any): Promise<void> {
    let self = this;

    this.slots = this.getSlots();

    this.PREBID_TIMEOUT = options.PREBID_TIMEOUT;

    this.options = options;
    
    return new Promise<void>(function(resolve, reject) {

      window['sasCallback'] = function(event) {

        Logger.logWithTime(sas.info[event].divId, 'finished slot rendering');

        let slot = self.slots[sas.info[event].divId];
        AutoRefresh.start(slot, options, self.autoRefresh);

        if (options.sasCallback)
          options.sasCallback(event);
      };

      pbjs.que.push(function() {
        Logger.infoWithTime("Adding adunits to prebid...");
        pbjs.addAdUnits(options.adUnits);

        Logger.infoWithTime("Requesting bids...");
        pbjs.requestBids({
          bidsBackHandler: function(bidResponses) {
            sendAdserverRequest();
          }
        });
      });

      setTimeout(function() {
        Logger.infoWithTime("Timeout reached, will send ad server request");
        sendAdserverRequest();
      }, options.PREBID_TIMEOUT);

      self.onScrollRefreshLazyloadedSlots();

      function sendAdserverRequest() {

        if (pbjs.adserverRequestSent) return;

        sas.cmd.push(function() {
          sas.call("onecall", {
            siteId: options.siteId,
            pageId: options.pageId,
            formatId: options.formatId,
            target: options.target + self.getPbTarget(),
          });
        });


        Logger.infoWithTime("Sending ad server request");
        pbjs.adserverRequestSent = true;

        pbjs.que.push(function() {

          if (options.sendAllBids) {
            Logger.infoWithTime("Enabling all bids");
            pbjs.enableSendAllBids()
          }

          if (options.logBids) {
            Logger.infoWithTime("Bids returned, listing:");
            Logger.log(pbjs.getAdserverTargeting());
          }

          for (let slotName in self.slots) {

            if(self.slots[slotName].lazyloadOffset) {
              continue;
            }

            self.slots[slotName].render();
            Logger.log(self.name, 'ad slot rendered: ', self.slots[slotName]);
          }
          resolve();
        });
      }
    });
}

private getPbTarget()  {
  var pbjsTargeting = pbjs.getAdserverTargeting();

  var smartTargeting = '';

  for (var unit in pbjsTargeting) {
    for (var b in pbjsTargeting[unit]) {
      if (pbjsTargeting[unit][b] != '') {
        smartTargeting += unit + '_' + b + '=' + pbjsTargeting[unit][b] + ';';
      }
    }
  }
  return smartTargeting;
}

private onScrollRefreshLazyloadedSlots() {
  let self = this;
  window.addEventListener('scroll', function refreshAdsIfItIsInViewport(event) {
    for (let slotName in self.slots) {
      let slot: SmartAdSlot = self.slots[slotName];
      if (slot.lazyloadEnabled && Viewport.isElementInViewport(slot.HTMLElement, slot.lazyloadOffset)) {
        slot.refresh();
        slot.lazyloadEnabled = false;
      }
    }
  });
}

private autoRefresh(slot: SmartAdSlot, options: any) {

  function getPbTarget()  {
    var pbjsTargeting = pbjs.getAdserverTargeting();

    var smartTargeting = '';

    for (var unit in pbjsTargeting) {
      for (var b in pbjsTargeting[unit]) {
        if (pbjsTargeting[unit][b] != '') {
          smartTargeting += unit + '_' + b + '=' + pbjsTargeting[unit][b] + ';';
        }
      }
    }
    return smartTargeting;
  }

  Logger.logWithTime(slot.name, 'started refreshing');
  pbjs.que.push(function() {
    pbjs.requestBids({
      timeout: options.PREBID_TIMEOUT,
      adUnitCodes: [slot.smartAdId],
      bidsBackHandler: function() {
        slot.std({
          siteId:     options.siteId,  
          pageId:     options.pageId, 
          formatId:   slot.smartAdId,
          target:     options.target + getPbTarget(),
        });
      }
    });
  });
}

loadSlot(element: HTMLElement) {
  var slot = new SmartAdSlot(element);

  window._molotovAds.slots[element.id] = slot;

  return slot;
}

private getSlots() {
  let slots = {};

  for (let slot in window._molotovAds.slots) {
    let el = window._molotovAds.slots[slot].HTMLElement;

    if(el.dataset.madAdunit === '') continue;
    
    slots[el.id] = this.loadSlot(el);
  }

  return slots;
}
}

window._molotovAds.loadPlugin(new SmartPrebidPlugIn());