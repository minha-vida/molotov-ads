import { AdSlot } from "./adslot";
import { Logger } from "./logger";
import { Viewport } from "./viewport";

export module AutoRefresh {
    export function start(slot: AdSlot, refreshFunction: Function) {
        if (!slot.autoRefreshEnabled) return;

        if (slot.autoRefreshCounter <= slot.autoRefreshLimit) {
            Logger.infoWithTime(slot.name, 'refreshing in', slot.autoRefreshTime, 'seconds (', slot.autoRefreshCounter, '/', slot.autoRefreshLimit, ')');
            setTimeout(refreshSlotForAutoRotate, slot.autoRefreshTime * 1000, slot, refreshFunction);
            slot.autoRefreshCounter++;
        }
        else {
            slot.autoRefreshEnabled = false;
            Logger.infoWithTime(slot.name, 'auto refresh ended');
        }
    }

    function refreshSlotForAutoRotate(slot: AdSlot, refreshFunction: Function) {
        Logger.logWithTime(slot.name, 'starting refresh for auto rotate');

        AutoRefresh.refreshIfViewable(slot, refreshFunction);
    }

    export function refreshIfViewable(slot: AdSlot, refreshFunction: Function) {
        if (document.hidden) {
            Logger.logWithTime(slot.name, 'marked for refresh on visibilitychange');

            var visibilityBack = function() {
                AutoRefresh.refreshIfViewable(slot, refreshFunction);
                document.removeEventListener('visibilitychange', visibilityBack);
            }

            document.addEventListener('visibilitychange', visibilityBack);
            return;
        }

        let neededViewabilityPercentage = 50;

        if (Viewport.getCurrentViewabilityPercentage(slot.HTMLElement) >= neededViewabilityPercentage) {
            refreshFunction(slot);
        }
        else {
            Logger.logWithTime(slot.name, 'viewablity lower than 50%, not refreshing');
            var intervalForRefresh = setInterval(function() {
                if (Viewport.getCurrentViewabilityPercentage(slot.HTMLElement) >= neededViewabilityPercentage) {
                    refreshFunction(slot);
                    clearInterval(intervalForRefresh);
                }
            }, 5000);
        }
    }
}
