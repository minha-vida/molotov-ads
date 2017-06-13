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

      function callIas(a){
        var random = Math.floor(Math.random()*1000000000);

        var integral = document.createElement('div');
        integral.id = 'ias-'+random;

        var el = document.getElementById(sas.info[a].divId);
        el.appendChild(integral);

        var iasScriptUrl, hiddenFrame, hiddenDoc, where, domain;
        iasScriptUrl = '//pixel.adsafeprotected.com/jload?anId=922503&campId='+sas.info[a].creativeWidth+'x'+sas.info[a].creativeHeight+'&pubId='+sas.info[a].advertiserId+'&chanId='+sas.info[a].formatId+'&placementId='+sas.info[a].insertionId+'&pubCreative='+sas.info[a].creativeId+'&pubOrder='+sas.info[a].campaignId+'&cb='+random;
        hiddenFrame = document.createElement('iframe');
        (hiddenFrame.frameElement || hiddenFrame).style.cssText = "width: 0; height: 0; border: 0; display: none;";
        hiddenFrame.src = 'javascript:false';
        where = integral;
        where.parentNode.insertBefore(hiddenFrame, where);
        try {
          hiddenDoc = hiddenFrame.contentWindow.document;
        } catch (e) {
          domain = document.domain;
          hiddenFrame.src = "javascript:var d=document.open();d.domain='" + domain + "';void(0);";
          hiddenDoc = hiddenFrame.contentWindow.document;
        }
        hiddenDoc.open().write('<body onload="' + 'window.__IntegralASUseFIF = true;' + 'var js = document.createElement(\'script\');' + 'js.src = \'' + iasScriptUrl + '\';' + 'document.body.appendChild(js);">');
        hiddenDoc.close();
      }

      function callcomScore(a){
        var random = Math.floor(Math.random()*1000000000);
        var el = document.getElementById(sas.info[a].divId);  

        if (/Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent)) {
          var comScorePixel = document.createElement("img");
          comScorePixel.src = "http://b.scorecardresearch.com/p?c1=8&c2=6035191&c3="+options.siteId+"&ns_ap_it=b&rn="+random;
          el.appendChild(comScorePixel);
        } else {
          var _comscore = _comscore || [];  
          _comscore.push({ c1: "8", c2: "6035191", c3: options.siteId});      
          (function() {
            var s = document.createElement("script"); s.async = true;
            s.src = (document.location.protocol == "https:" ? "https://sb" : "http://b") + ".scorecardresearch.com/beacon.js";
            el.appendChild(s);
          })();
        }
      }

      window['sasCallback'] = function(event) {

        Logger.logWithTime(sas.info[event].divId, 'finished slot rendering');

        let slot = self.slots[sas.info[event].divId];
        AutoRefresh.start(slot, options, self.autoRefresh);

        callIas(event);
        callcomScore(event);

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

private getSlots() {
  let slots = {};

  for (let slot in window._molotovAds.slots) {
    let el = window._molotovAds.slots[slot].HTMLElement;

    if(el.dataset.madAdunit === '') continue;

    slots[el.id] = new SmartAdSlot(el);

    window._molotovAds.slots[el.id] = slots[el.id];
  }

  return slots;
}
}

window._molotovAds.loadPlugin(new SmartPrebidPlugIn());