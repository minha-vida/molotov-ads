export interface PlugInInterface {
    name: string;
    init(options: any) : Promise<void>;
}
