import { AdSlot } from "../../modules/adslot";
declare var googletag: any;

export class DoubleClickAdSlot extends AdSlot {
    adUnit: string;
    isOutOfPage: boolean;

    doubleclickAdSlot: any;

    constructor(public HTMLElement: HTMLElement) {
        super(HTMLElement);
        let ds = HTMLElement.dataset;
        let size = eval(ds['madSize']);

        this.adUnit = ds['madAdunit'];
        this.name = HTMLElement.id;
        this.size = size;
        this.isOutOfPage = Boolean(ds['madOutOfPage']);
        this.autoRefreshTime = Number(ds['madAutoRefreshInSeconds']) || 0;
        this.autoRefreshLimit = Number(ds['madAutoRefreshLimit']) || 0;
        this.lazyloadOffset = Number(ds['madLazyloadOffset']);

        this.autoRefreshEnabled = this.autoRefreshTime > 0;

        if (this.lazyloadOffset) {
            this.lazyloadOffset = this.lazyloadOffset || 0;
            this.lazyloadEnabled = true;
        }
    }

    defineSlot() {
        if (this.isOutOfPage) {
            this.doubleclickAdSlot = googletag.defineOutOfPageSlot(this.adUnit, this.name).addService(googletag.pubads());
        } else {
            this.doubleclickAdSlot = googletag.defineSlot(this.adUnit, this.size, this.name).addService(googletag.pubads());
        }
    }

    display() {
        googletag.display(this.name);

        if (this.lazyloadEnabled) return;

        this.refresh();
    }

    refresh() {
        googletag.pubads().refresh([this.doubleclickAdSlot]);
    }

    getDoubleclickAdSlot() {
        return this.doubleclickAdSlot;
    }
}
