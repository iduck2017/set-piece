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
import { RenderService } from "./services/render";

@singleton
export class App {
    private _status: AppStatus;
    public get status() { return this._status; }

    public readonly app: App = this;
    public readonly meta: MetaService;
    public readonly refer: ReferService;
    public readonly slots: SlotsService;
    public readonly render: RenderService;
    public readonly factory: FactoryService;
    public readonly setting: SettingService;

    private _root?: RootModel;
    public get root() { return this._root; }

    public readonly version: string;

    public constructor() {
        this._status = AppStatus.INITED;
        this.version = APP_VERSION;
        this.meta = new MetaService(this);
        this.refer = new ReferService(this);
        this.slots = new SlotsService(this);
        this.render = new RenderService(this);
        this.setting = new SettingService(this);
        this.factory = new FactoryService(this);
    }

    @appStatus(AppStatus.INITED)
    public async init() {
        const meta = await this.meta.head();
        this.setting.init(meta.perference);
        this.slots.init(meta.slots);
        this.render.init();
        this._status = AppStatus.UNMOUNTED;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async mount(index: number) {
        this._status = AppStatus.MOUNTING;
        this.refer.reset();
        const record = await this.slots.load(index);
        this._root = this.factory.unserialize(record);
        this._root.mount({
            app: this,
            parent: this
        });
        console.log(this._root);
        this.render.mount();
        this._status = AppStatus.MOUNTED;
    }
    
    @appStatus(AppStatus.MOUNTED)
    public async unmount() {
        this._status = AppStatus.UNMOUNTING;
        await this.slots.save();
        this.slots.quit();
        this._status = AppStatus.UNMOUNTED;
    }
}

