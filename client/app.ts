import { FactoryService } from "./service/factory";
import { ReferenceService } from "./service/reference";
import { ArchieveData, ArchieveService } from "./service/archieve";
import { PerferenceData, PreferenceService } from "./service/perference";
import { RootModelDef } from "./model/root";
import { RenderService } from "./service/render";
import { AppStatus } from "./type/status";
import { Model } from "./model";

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
    public readonly majorVersion: number;
    public readonly minorVersion: number;
    public readonly patchVersion: number;

    public readonly factoryService: FactoryService;
    public readonly referenceService: ReferenceService;
    public readonly perferenceService: PreferenceService;
    public readonly archieveService: ArchieveService;
    public readonly renderService: RenderService;

    private _status: AppStatus;
    public get status() { return this._status; }

    
    private _root?: Model<RootModelDef>;
    public get root(): Model<RootModelDef> { 
        if (!this._root) throw new Error();
        return this._root;
    }
    public set root(value: any) {
        if (this._root) throw new Error();
        this._root = value;
    }

    constructor() {
        window._app = this;
        
        this.majorVersion = 0;
        this.minorVersion = 1;
        this.patchVersion = 0;

        this.factoryService = new FactoryService(this);
        this.referenceService = new ReferenceService(this);
        this.perferenceService = new PreferenceService(this);
        this.archieveService = new ArchieveService(this);
        this.renderService = new RenderService(this);

        this._status = AppStatus.CREATED;
    }

    public async initialize() {
        const metadata = await this._loadMetaData();
        this.archieveService.initialize(metadata.archieveDataList);
        this.perferenceService.initialize(metadata.perferenceData);
        this.renderService.initialize();
        this._status = AppStatus.UNMOUNTED;
    }

    public async startGame(index?: number) {
        this._status = AppStatus.MOUNTING;
        const config = index === undefined ?
            await this.archieveService.createArchieve() :
            await this.archieveService.loadArchieve(index);
        this.factoryService.unserialize({
            ...config,
            app: this,
            parent: undefined
        });
        this._status = AppStatus.MOUNTED;
    }

    public async quitGame() {
        this._status = AppStatus.UNMOUNTING;
        this.archieveService.saveArchieve();
        this.referenceService.reset();
        this._root = undefined;
        this._status = AppStatus.UNMOUNTED;
    }

    public async saveMetaData() {
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