import { ArchieveData, FileService } from "./service/file";
import { RenderService } from "./service/render";
import { RootModel } from "./model/root";
import { Global } from "./utils/global";

export type AppInfo = Readonly<{
    version: [number, number, number]
    files: Readonly<ArchieveData[]>
}>

export enum AppStatus {
    CREATED, 
    UNMOUNTED,
    MOUNTING, 
    MOUNTED,   
    UNMOUNTING, 
}

@Global.useSingleton
export class App extends Global {
    readonly version: [number, number, number];

    readonly fileService: FileService;
    readonly renderService: RenderService;

    #status: AppStatus;
    get status() { return this.#status; }

    #root?: RootModel;
    public get root() { 
        if (!this.#root) {
            throw new Error('Root model is not generated yet.');
        }
        return this.#root;
    }


    constructor() {
        super();

        window._app = this;
        
        this.version = [ 0, 1, 0 ];

        this.fileService = new FileService(this);
        this.renderService = new RenderService(this);

        this.#status = AppStatus.CREATED;
    }

    async init() {
        const meta = await this.#load();
        this.fileService.init(meta.files);
        this.renderService.init();
        this.#status = AppStatus.UNMOUNTED;
    }

    async start(index?: number) {
        this.#status = AppStatus.MOUNTING;
        const config = index === undefined ?
            await this.fileService.new() :
            await this.fileService.load(index);
        this.#root = new RootModel(config, this);
        this.#root.init();
        this.#status = AppStatus.MOUNTED;
    }

    async quit() {
        this.#status = AppStatus.UNMOUNTING;
        this.fileService.save();
        this.#root = undefined;
        this.#status = AppStatus.UNMOUNTED;
    }

    async save() {
        const save: AppInfo = {
            version: this.version,
            files: this.fileService.data
        };
        await localStorage.setItem('meta', JSON.stringify(save));
    } 
    
    async #load(): Promise<AppInfo> {
        const raw = await localStorage.getItem('meta');
        if (!raw) {
            return {
                version: this.version,
                files: []
            };
        }
        const result = JSON.parse(raw) as AppInfo;
        return result;
    }
}
(window as any).m = App;