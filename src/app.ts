import { appStatus } from "./utils/status";
import { ReferService } from "./services/refer";
import { MetaService } from "./services/meta";
import { SettingService } from "./services/setting";
import { SlotsService } from "./services/slots";
import { FactoryService } from "./services/factory";
import { singleton } from "./utils/decors";
import { AppStatus } from "./types/status";
import { APP_VERSION } from "./configs/base";
import { RootModel } from "./models/root";

@singleton
export class App {
    private _status: AppStatus;
    public get status() { return this._status; }

    private _services: {
        meta: MetaService;
        refer: ReferService;
        slots: SlotsService;
        factory: FactoryService;
        setting: SettingService;
    };
    public get services() { return this._services; }

    public readonly app = this;

    private _root?: RootModel;
    public get root() { return this._root; }

    private _version: string;
    public get version() { return this._version; }

    public constructor() {
        this._version = APP_VERSION;
        this._status = AppStatus.INITED;
        this._services = {
            meta: new MetaService(this),
            refer: new ReferService(this),
            setting: new SettingService(this),
            slots: new SlotsService(this),
            factory: new FactoryService(this)
        };
    }

    @appStatus(AppStatus.INITED)
    public async init() {
        const meta = await this._services.meta.head();
        this._services.setting.init(meta.perference);
        this._services.slots.init(meta.slots);
        this._status = AppStatus.UNMOUNTED;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async mount(index: number) {
        this._status = AppStatus.MOUNTING;
        this._services.refer.init();
        const record = await this._services.slots.load(index);
        this._root = this._services.factory.create(record);
        this._root.mount(this);
        console.log(this._root);
        this._status = AppStatus.MOUNTED;
    }
    
    @appStatus(AppStatus.MOUNTED)
    public async unmount() {
        this._status = AppStatus.UNMOUNTING;
        await this._services.slots.save();
        this._services.slots.quit();
        this._status = AppStatus.UNMOUNTED;
    }
}

