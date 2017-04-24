export class AdSlot {
    constructor(public HTMLElement: HTMLElement) {

    }

    name: string;
    size: number[];

    lazyloadEnabled: boolean = false;
    lazyloadOffset: number;

    autoRefreshEnabled: boolean = false;
    autoRefreshLimit: number;
    autoRefreshTime: number;
    autoRefreshCounter: number = 1;
}
