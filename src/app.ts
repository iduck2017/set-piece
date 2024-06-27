import { appStatus } from "./utils/decors/status";
import { ReferenceService } from "./services/reference";
import { MetaService } from "./services/meta";
import { PerferenceService } from "./services/perference";
import { SlotsService } from "./services/slots";
import { FactoryService } from "./services/factory";
import { singleton } from "./utils/decors/singleton";
import { AppStatus } from "./types/status";
import { APP_VERSION } from "./configs/base";
import { RootModel } from "./models/root";

@singleton
export class App {
    private _status: AppStatus;
    public get status() { return this._status; }

    private _services: {
        meta: MetaService;
        reference: ReferenceService;
        perference: PerferenceService;
        slots: SlotsService;
        factory: FactoryService;
    };
    public get services() { return this._services; }

    public get app() { return this; }

    private _root?: RootModel;
    public get root() { return this._root; }

    private _version: string;
    public get version() { return this._version; }

    public constructor() {
        this._version = APP_VERSION;
        this._status = AppStatus.INITED;
        this._services = {
            meta: new MetaService(this),
            reference: new ReferenceService(this),
            perference: new PerferenceService(this),
            slots: new SlotsService(this),
            factory: new FactoryService(this)
        };
    }

    @appStatus(AppStatus.INITED)
    public async init() {
        const meta = await this._services.meta.head();
        this._services.perference.init(meta.perference);
        this._services.slots.init(meta.slots);
        this._status = AppStatus.UNMOUNTED;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async mount(index: number) {
        this._status = AppStatus.MOUNTING;
        this._services.reference.init();
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

