import { FactoryService } from "./services/factory";
import { ReferenceService } from "./services/reference";
import { Generator } from "./configs/generator";
import { ArchieveData, ArchieveService } from "./services/archieve";
import { PerferenceData, PreferenceService } from "./services/perference";
import { RootModel } from "./models/root";
import { RenderService } from "./services/render";
import { META_SAVE_PATH } from "./configs/context";
import { AppStatus } from "./type/status";

export type MetaData = {
    majorVersion: number
    minorVersion: number
    patchVersion: number
    perferenceData: PerferenceData
    archieveDataList: ArchieveData[]
}

export class App {
    public readonly majorVersion: number;
    public readonly minorVersion: number;
    public readonly patchVersion: number;

    public readonly factory: FactoryService;
    public readonly reference: ReferenceService;
    public readonly perference: PreferenceService;
    public readonly archieve: ArchieveService;
    public readonly render: RenderService;

    private $root?: RootModel;
    private $status: AppStatus;
    
    public get status() { return this.$status; }
    public get root() { return this.$root; }

    constructor() {
        this.majorVersion = 0;
        this.minorVersion = 1;
        this.patchVersion = 0;

        this.factory = new FactoryService(this);
        this.reference = new ReferenceService(this);
        this.perference = new PreferenceService(this);
        this.archieve = new ArchieveService(this);
        this.render = new RenderService(this);
        this.$status = AppStatus.CREATED;
        window.$app = this;
    }

    public async initialize() {
        const metadata = await this.$loadMetaData();
        this.archieve.initialize(metadata.archieveDataList);
        this.perference.initialize(metadata.perferenceData);
        this.render.initialize();
        this.$status = AppStatus.UNMOUNTED;
    }

    private async $loadMetaData(): Promise<MetaData> {
        const raw = await localStorage.getItem(META_SAVE_PATH);
        if (!raw) return Generator.appMetaData();
        const result = JSON.parse(raw) as MetaData;
        return result;
    }

    public async startGame(index?: number) {
        this.$status = AppStatus.MOUNTING;
        const config = index === undefined ?
            await this.archieve.createArchieve() :
            await this.archieve.loadArchieve(index);
        this.$root = this.factory.unserialize(config);
        this.$root.$bindParent(this.$root);
        this.$root.$bootDriver();
        this.$status = AppStatus.MOUNTED;
    }

    public async quitGame() {
        this.$status = AppStatus.UNMOUNTING;
        this.archieve.saveArchieve();
        this.$root?.$unbindParent();
        this.$root = undefined;
        this.$status = AppStatus.UNMOUNTED;
    }

    public async saveMetaData() {
        const save: MetaData = {
            majorVersion: this.majorVersion,
            minorVersion: this.minorVersion,
            patchVersion: this.patchVersion,
            perferenceData: this.perference.settingsData,
            archieveDataList: this.archieve.data
        };
        await localStorage.setItem(META_SAVE_PATH, JSON.stringify(save));
    } 
}