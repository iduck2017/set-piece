import { FactoryService } from "./services/factory";
import { ReferService } from "./services/refer";
import { AppInfo } from "./type/app";
import { Context } from "./configs/context";
import { Generator } from "./configs/generator";
import { ArchieveService } from "./services/archieve";
import { SettingsService } from "./services/settings";
import { RootModel } from "./models/root";
import { AppStatus } from "./type/status";
import { RenderService } from "./services/render";

export class App {
    public readonly version: string;
    public readonly factoryService: FactoryService;
    public readonly referService: ReferService;
    public readonly settingsService: SettingsService;
    public readonly archieveService: ArchieveService;
    public readonly renderService: RenderService;

    private $root?: RootModel;
    private $status: AppStatus;
    
    public get status() { return this.$status; }
    public get root() { return this.$root; }

    constructor() {
        this.version = '1.0.0';
        this.factoryService = new FactoryService(this);
        this.referService = new ReferService(this);
        this.settingsService = new SettingsService(this);
        this.archieveService = new ArchieveService(this);
        this.renderService = new RenderService(this);
        this.$status = AppStatus.UNINITED;
        window.$app = this;
    }

    public async initialize() {
        const metadata = await this.$loadMetaData();
        this.archieveService.init(metadata.archieves);
        this.settingsService.initialize(metadata.settings);
        this.renderService.initialize();
        this.$status = AppStatus.UNMOUNTED;
    }

    private async $loadMetaData(): Promise<AppInfo.MetaData> {
        const raw = await localStorage.getItem(Context.META_PATH);
        if (!raw) return Generator.initAppMetaData();
        const result = JSON.parse(raw) as AppInfo.MetaData;
        return result;
    }

    public async startGame(index?: number) {
        this.$status = AppStatus.MOUNTING;
        const config = index === undefined ?
            await this.archieveService.createArchieve() :
            await this.archieveService.loadArchieve(index);
        this.$root = new RootModel(config, undefined, this);
        this.$root.startGame();
        this.$status = AppStatus.MOUNTED;
    }

    public async quitGame() {
        this.$status = AppStatus.UNMOUNTING;
        this.archieveService.saveArchieve();
        this.$root?.quitGame();
        this.$root = undefined;
        this.$status = AppStatus.UNMOUNTED;
    }

    public async saveMetaData() {
        const save: AppInfo.MetaData = {
            version: this.version,
            settings: this.settingsService.settingsData,
            archieves: this.archieveService.data
        };
        await localStorage.setItem(Context.META_PATH, JSON.stringify(save));
    } 
}