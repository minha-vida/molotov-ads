import { DoubleClickAdSlot } from "../doubleclick/doubleclick.adslot";
declare var rubicontag: any;
declare var googletag: any;

export class RubiconFastlaneDfpAdSlot extends DoubleClickAdSlot {

    rubiconPosition: string;
    rubiconAdSlot: any;

    constructor(public HTMLElement: HTMLElement) {
        super(HTMLElement);

        this.rubiconPosition = HTMLElement.dataset.madRubiconPosition;
    }

    defineSlot() {
        this.rubiconAdSlot = rubicontag.defineSlot(this.adUnit, this.size, this.name)
            .setPosition(this.rubiconPosition)
            .setFPI('adunit', this.adUnit.substring(this.adUnit.lastIndexOf('/') + 1))
            .setFPI('position', this.rubiconPosition);
    }

    defineSlotDoubleclick() {
        super.defineSlot();
    }

    setTargetingForGPTSlot() {
        rubicontag.setTargetingForGPTSlot(super.getDoubleclickAdSlot());
    }
}
