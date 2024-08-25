import type { App } from "../app";
import { Context } from "../configs/context";
import { Generator } from "../configs/generator";
import { RootModel } from "../models/root";
import { AppInfo } from "../type/app";
import { ModelReflect } from "../type/model";
import { singleton } from "../utils/singleton";

@singleton
export class ArchieveService {

    public readonly app: App;
    private $index?: number;
    private $data: AppInfo.Archieve[] = [];
    public get data() { return this.$data; } 

    constructor(app: App) {
        this.app = app;
    }

    public init(config: AppInfo.Archieve[]) {
        this.$data = config;
    }

    public async createArchieve() {
        this.app.referService.reset();
        const id = this.app.referService.getUniqId();
        this.$data.push({
            id,
            name: 'hello',
            progress: 0
        });
        const record = Generator.initRootModelConfig();
        await localStorage.setItem(`${Context.ARCHIEVE_PATH}_${id}`, JSON.stringify(record));
        await this.app.saveGame();
        return record;
    }

    public async loadArchieve(index: number) {
        this.$index = index;
        const slot = this.$data[index];
        const path = `${Context.ARCHIEVE_PATH}_${slot.id}`;
        const raw = await localStorage.getItem(path);
        if (!raw) {
            throw new Error();
        }
        return JSON.parse(raw) as ModelReflect.Config<RootModel>;
    }

    public async removeArchieve(index: number) {
        const slot = this.$data[index];
        const path = `${Context.ARCHIEVE_PATH}_${slot.id}`;
        this.$data.splice(index, 1);
        await localStorage.removeItem(path);
        await this.app.saveGame();
    }

    public async unloadArchieve() {
        this.$index = undefined;
    }

    public async save() {
        const index = this.$index;
        const rootModel = this.app.root;
        if (!rootModel || index === undefined) {
            throw new Error();
        }
        const slot = this.$data[index];
        const path = `${Context.ARCHIEVE_PATH}_${slot.id}`;
        const record = rootModel.serialize();
        this.$data[index] = {
            ...slot,
            progress: rootModel.state.progress
        };
        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.saveGame();
    }
}