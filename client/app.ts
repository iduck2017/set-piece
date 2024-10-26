import { ArchieveData, ArchieveService } from "./service/archieve";
import { PerferenceData, PreferenceService } from "./service/perference";
import { RenderService } from "./service/render";
import { RootModel } from "./model/root";

export const META_SAVE_PATH = 'meta';

export type AppInfo = Readonly<{
    version: [number, number, number]
    perferenceData: PerferenceData
    archieveDataList: Readonly<ArchieveData[]>
}>

export enum AppStatus {
    CREATED, 
    UNMOUNTED,
    MOUNTING, 
    MOUNTED,   
    UNMOUNTING, 
}


export class App {
    readonly version: [number, number, number];

    readonly perferenceService: PreferenceService;
    readonly archieveService: ArchieveService;
    readonly renderService: RenderService;

    #status: AppStatus;
    get status() { return this.#status; }

    #root?: RootModel;
    public get root() { 
        if (!this.#root) {
            throw new Error('Root model is not generated yet.');
        }
        return this.#root;
    }

    constructor() {
        window._app = this;
        
        this.version = [ 0, 1, 0 ];

        this.perferenceService = new PreferenceService(this);
        this.archieveService = new ArchieveService(this);
        this.renderService = new RenderService(this);

        this.#status = AppStatus.CREATED;
    }

    async init() {
        const meta = await this.#load();
        this.archieveService.initialize(meta.archieveDataList);
        this.perferenceService.initialize(meta.perferenceData);
        this.renderService.initialize();
        this.#status = AppStatus.UNMOUNTED;
    }

    async start(index?: number) {
        this.#status = AppStatus.MOUNTING;
        const config = index === undefined ?
            await this.archieveService.createArchieve() :
            await this.archieveService.loadArchieve(index);
        this.#root = new RootModel(config, this);
        this.#root.activate();
        this.#status = AppStatus.MOUNTED;
    }

    async quit() {
        this.#status = AppStatus.UNMOUNTING;
        this.archieveService.save();
        this.#root = undefined;
        this.#status = AppStatus.UNMOUNTED;
    }

    async save() {
        const save: AppInfo = {
            version: this.version,
            perferenceData: this.perferenceService.data,
            archieveDataList: this.archieveService.data
        };
        await localStorage.setItem(META_SAVE_PATH, JSON.stringify(save));
    } 
    
    async #load(): Promise<AppInfo> {
        const raw = await localStorage.getItem(META_SAVE_PATH);
        if (!raw) {
            return {
                version: this.version,
                archieveDataList: [],
                perferenceData: {
                    mute: false,
                    fullscreen: true
                }
            };
        }
        const result = JSON.parse(raw) as AppInfo;
        return result;
    }
}