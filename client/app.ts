import { ReferenceService } from "./services/reference";
import { MetaService } from "./services/meta";
import { ConfigService } from "./services/config";
import { SlotService } from "./services/slot";
import { FactoryService } from "./services/factory";
import { singleton } from "./utils/singleton";
import { AppStatus } from "./types/status";
import { APP_VERSION } from "./configs/base";
import { RootModel } from "./models/root";
import { RenderService } from "./services/render";
import { Lifecycle } from "./utils/lifecyle";

@singleton
export class App {
    private $status: AppStatus;
    private $root? : RootModel;
    
    public readonly app : App = this;
    public readonly meta: MetaService;
    public readonly ref : ReferenceService;
    public readonly fact: FactoryService;
    public readonly slot: SlotService;
    public readonly conf: ConfigService;
    public readonly rend: RenderService;
    public readonly v   : string;

    public get root() { return this.$root; }
    public get status() { return this.$status; }

    public constructor() {
        this.$status = AppStatus.INITED;
        this.v = APP_VERSION;
        this.meta = new MetaService(this);
        this.ref = new ReferenceService(this);
        this.slot = new SlotService(this);
        this.rend = new RenderService(this);
        this.conf = new ConfigService(this);
        this.fact = new FactoryService(this);
    }

    @Lifecycle.app(AppStatus.INITED)
    public async init() {
        const meta = await this.meta.head();
        this.conf.init(meta.perference);
        this.slot.init(meta.slots);
        this.rend.init();
        this.$status = AppStatus.UNMOUNTED;
    }

    @Lifecycle.app(AppStatus.UNMOUNTED)
    public async mount(index: number) {
        this.$status = AppStatus.MOUNTING;
        this.ref.reset();
        const record = await this.slot.load(index);
        this.$root = this.fact.unseq({
            ...record,
            parent: undefined
        });
        this.rend.mount();
        this.$status = AppStatus.MOUNTED;
    }
    
    @Lifecycle.app(AppStatus.MOUNTED)
    public async unmount() {
        this.$status = AppStatus.UNMOUNTING;
        await this.slot.save();
        this.slot.quit();
        this.$status = AppStatus.UNMOUNTED;
    }
}

