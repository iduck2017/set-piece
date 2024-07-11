import { appStatus } from "./utils/status";
import { ReferService } from "./services/refer";
import { MetaService } from "./services/meta";
import { ConfigService } from "./services/setting";
import { SlotsService } from "./services/slots";
import { FactoryService } from "./services/factory";
import { singleton } from "./utils/singleton";
import { AppStatus } from "./types/status";
import { APP_VERSION } from "./configs/base";
import { RootModel } from "./models/root";
import { RenderService } from "./services/render";

@singleton
export class App {
    private $status: AppStatus;
    private $root? : RootModel;
    
    public readonly app    : App = this;
    public readonly meta   : MetaService;
    public readonly refer  : ReferService;
    public readonly slots  : SlotsService;
    public readonly render : RenderService;
    public readonly config : ConfigService;
    public readonly factory: FactoryService;

    public get root() { return this.$root; }
    public get status() { return this.$status; }

    public readonly version: string;

    public constructor() {
        this.$status = AppStatus.INITED;
        this.version = APP_VERSION;
        this.meta = new MetaService(this);
        this.refer = new ReferService(this);
        this.slots = new SlotsService(this);
        this.render = new RenderService(this);
        this.config = new ConfigService(this);
        this.factory = new FactoryService(this);
    }

    @appStatus(AppStatus.INITED)
    public async init() {
        const meta = await this.meta.head();
        this.config.init(meta.perference);
        this.slots.init(meta.slots);
        this.render.init();
        this.$status = AppStatus.UNMOUNTED;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async mount(index: number) {
        this.$status = AppStatus.MOUNTING;
        this.refer.reset();
        const record = await this.slots.load(index);
        this.$root = this.factory.unseq(record, this);
        this.render.mount();
        this.$status = AppStatus.MOUNTED;
    }
    
    @appStatus(AppStatus.MOUNTED)
    public async unmount() {
        this.$status = AppStatus.UNMOUNTING;
        await this.slots.save();
        this.slots.quit();
        this.$status = AppStatus.UNMOUNTED;
    }
}

