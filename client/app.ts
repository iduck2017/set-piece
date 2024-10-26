import { ReferenceService } from "./service/reference";
import { ArchieveData, ArchieveService } from "./service/archieve";
import { PerferenceData, PreferenceService } from "./service/perference";
import { RenderService } from "./service/render";
import { AppStatus } from "./type/status";
import { RootModel } from "./model/root";

export const MAJOR_VERSION = 0;
export const MINOR_VERSION = 1;
export const PATCH_VERSION = 0;
export const META_SAVE_PATH = 'meta';

export type AppInfo = Readonly<{
    majorVersion: number
    minorVersion: number
    patchVersion: number
    perferenceData: PerferenceData
    archieveDataList: Readonly<ArchieveData[]>
}>

export class App {
    readonly majorVersion: number;
    readonly minorVersion: number;
    readonly patchVersion: number;

    readonly referenceService: ReferenceService;
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
        
        this.majorVersion = 0;
        this.minorVersion = 1;
        this.patchVersion = 0;

        this.referenceService = new ReferenceService(this);
        this.perferenceService = new PreferenceService(this);
        this.archieveService = new ArchieveService(this);
        this.renderService = new RenderService(this);

        this.#status = AppStatus.CREATED;
    }

    async initialize() {
        const metadata = await this._loadMetaData();
        this.archieveService.initialize(metadata.archieveDataList);
        this.perferenceService.initialize(metadata.perferenceData);
        this.renderService.initialize();
        this.#status = AppStatus.UNMOUNTED;
    }

    async startGame(index?: number) {
        this.#status = AppStatus.MOUNTING;
        const config = index === undefined ?
            await this.archieveService.createArchieve() :
            await this.archieveService.loadArchieve(index);
        this.#root = new RootModel(config, this);
        this.#root.activate();
        this.#status = AppStatus.MOUNTED;
    }

    async quitGame() {
        this.#status = AppStatus.UNMOUNTING;
        this.archieveService.save();
        this.referenceService.reset();
        this.#root = undefined;
        this.#status = AppStatus.UNMOUNTED;
    }

    async saveMetaData() {
        const save: AppInfo = {
            majorVersion: this.majorVersion,
            minorVersion: this.minorVersion,
            patchVersion: this.patchVersion,
            perferenceData: this.perferenceService.data,
            archieveDataList: this.archieveService.data
        };
        await localStorage.setItem(META_SAVE_PATH, JSON.stringify(save));
    } 
    
    private async _loadMetaData(): Promise<AppInfo> {
        const raw = await localStorage.getItem(META_SAVE_PATH);
        if (!raw) {
            return {
                majorVersion: MAJOR_VERSION,
                minorVersion: MINOR_VERSION,
                patchVersion: PATCH_VERSION,
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