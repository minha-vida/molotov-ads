import { AdSlot } from "../../modules/adslot";

declare var sas: any;

export class SmartAdSlot extends AdSlot {
    smartAdId: string;

    constructor(public HTMLElement: HTMLElement) {
        super(HTMLElement);
        let ds = HTMLElement.dataset;

        this.name = HTMLElement.id;
        this.smartAdId = ds['madSmartadId'];
        this.autoRefreshTime = Number(ds['madAutoRefreshInSeconds']) || 0;
        this.autoRefreshLimit = Number(ds['madAutoRefreshLimit']) || 0;
        this.lazyloadOffset = Number(ds['madLazyloadOffset']);

        this.autoRefreshEnabled = this.autoRefreshTime > 0;

        if (this.lazyloadOffset) {
            this.lazyloadOffset = this.lazyloadOffset || 0;
            this.lazyloadEnabled = true;
        }
    }

    refresh() {
        sas.refresh(this.smartAdId);
    }

    render() {
        if (this.lazyloadEnabled) return;

        sas.render(this.smartAdId);
    }
}
