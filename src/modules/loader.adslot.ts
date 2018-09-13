import { Viewport } from "./viewport";
import { Logger } from "./logger";
import { AdSlot } from "./adslot";

export module AdSlotLoader {

    export function loadSlots() {
        return new Promise(function (resolve, reject) {
            let elements = document.querySelectorAll('[data-mad]');

            let slots = {};

            for (let i = 0; i < elements.length; i++) {
                let el = <HTMLElement>elements[i];

                if (!Viewport.isElementVisible(el)) {
                    Logger.warn(el.id, 'ignored because it is not visible');
                    continue;
                }

                slots[el.id] = new AdSlot(el);
            }

            return resolve(slots);
        });
    }

    export function loadSlot(el: HTMLElement) {
        return new Promise(function (resolve, reject) {
            let slots = {};

            let element = <HTMLElement>el;
            slots[element.id] = new AdSlot(element);

            return resolve(slots);
        });
    }

    export function deleteSlot(el) {
        return new Promise(function (resolve, reject) {
            let slots = {};

            delete slots[el];

            return resolve(slots);
        });
    }

}
