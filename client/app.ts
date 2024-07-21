import { appStatus } from "./utils/status";
import { ReferenceService } from "./services/reference";
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
    public readonly ref    : ReferenceService;
    public readonly slots  : SlotsService;
    public readonly render : RenderService;
    public readonly conf   : ConfigService;
    public readonly fact   : FactoryService;
    public readonly version: string;

    public get root() { return this.$root; }
    public get status() { return this.$status; }

    public constructor() {
        this.$status = AppStatus.INITED;
        this.version = APP_VERSION;
        this.meta = new MetaService(this);
        this.ref = new ReferenceService(this);
        this.slots = new SlotsService(this);
        this.render = new RenderService(this);
        this.conf = new ConfigService(this);
        this.fact = new FactoryService(this);
    }

    @appStatus(AppStatus.INITED)
    public async init() {
        const meta = await this.meta.head();
        this.conf.init(meta.perference);
        this.slots.init(meta.slots);
        this.render.init();
        this.$status = AppStatus.UNMOUNTED;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async mount(index: number) {
        this.$status = AppStatus.MOUNTING;
        this.ref.reset();
        const record = await this.slots.load(index);
        this.$root = this.fact.unseq({
            ...record,
            parent: undefined
        });
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

