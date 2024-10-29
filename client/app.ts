import { FileService, FileInfo } from "./service/file";
import { RenderService } from "./service/render";
import { RootModel } from "./model/root";
import { Global } from "./utils/global";

export type AppInfo = Readonly<{
    version: [number, number, number]
    files: Readonly<FileInfo[]>
}>


@Global.useSingleton
export class App extends Global {
    readonly version: [number, number, number];
    readonly fileService: FileService;
    readonly renderService: RenderService;

    private _root?: RootModel;
    public get root() { 
        return this._root;
    }

    constructor() {
        super();
        window._app = this;
        this.version = [ 0, 1, 0 ];

        this.fileService = new FileService(this);
        this.renderService = new RenderService(this);
    }

    async init() {
        const meta = await this._load();
        this.fileService.init(meta.files);
        this.renderService.init();
    }

    async start(index?: number) {
        const config = index === undefined ?
            await this.fileService.new() :
            await this.fileService.load(index);
        this._root = new RootModel(config, this);
    }

    async quit() {
        this.fileService.save();
        this._root = undefined;
        Global._singletonSet.clear();
    }

    async save() {
        const save: AppInfo = {
            version: this.version,
            files: this.fileService.data
        };
        await localStorage.setItem('meta', JSON.stringify(save));
    } 
    
    private async _load(): Promise<AppInfo> {
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
