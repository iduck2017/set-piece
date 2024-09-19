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

    public readonly factoryService: FactoryService;
    public readonly referenceService: ReferenceService;
    public readonly perferenceService: PreferenceService;
    public readonly archieveService: ArchieveService;
    public readonly renderService: RenderService;

    private $root?: RootModel;
    private $status: AppStatus;
    
    public get status() { return this.$status; }
    public get root() { return this.$root; }

    constructor() {
        this.majorVersion = 0;
        this.minorVersion = 1;
        this.patchVersion = 0;

        this.factoryService = new FactoryService(this);
        this.referenceService = new ReferenceService(this);
        this.perferenceService = new PreferenceService(this);
        this.archieveService = new ArchieveService(this);
        this.renderService = new RenderService(this);
        this.$status = AppStatus.CREATED;
        window.$app = this;
    }

    public async initialize() {
        const metadata = await this.$loadMetaData();
        this.archieveService.initialize(metadata.archieveDataList);
        this.perferenceService.initialize(metadata.perferenceData);
        this.renderService.initialize();
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
            await this.archieveService.createArchieve() :
            await this.archieveService.loadArchieve(index);
        this.$root = this.factoryService.unserialize(config);
        this.$root.$bindParent(this.$root);
        this.$root.$initialize();
        this.$status = AppStatus.MOUNTED;
    }

    public async quitGame() {
        this.$status = AppStatus.UNMOUNTING;
        this.archieveService.saveArchieve();
        this.$root?.$unbindParent();
        this.$root = undefined;
        this.$status = AppStatus.UNMOUNTED;
    }

    public async saveMetaData() {
        const save: MetaData = {
            majorVersion: this.majorVersion,
            minorVersion: this.minorVersion,
            patchVersion: this.patchVersion,
            perferenceData: this.perferenceService.settingsData,
            archieveDataList: this.archieveService.data
        };
        await localStorage.setItem(META_SAVE_PATH, JSON.stringify(save));
    } 
}