import type { App } from "../app";
import { Context } from "../configs/context";
import { Generator } from "../configs/generator";
import { AppInfo } from "../type/app";
import { RootModelDef } from "../type/definition";
import { IModel } from "../type/model";
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
        await this.app.saveMetaData();
        return record;
    }

    public async loadArchieve(index: number) {
        this.$index = index;
        const archieve = this.$data[index];
        const path = `${Context.ARCHIEVE_PATH}_${archieve.id}`;
        const raw = await localStorage.getItem(path);
        if (!raw) {
            throw new Error();
        }
        return JSON.parse(raw) as IModel.RawConfig<RootModelDef>;
    }

    public async removeArchieve(index: number) {
        const slot = this.$data[index];
        const path = `${Context.ARCHIEVE_PATH}_${slot.id}`;
        this.$data.splice(index, 1);
        await localStorage.removeItem(path);
        await this.app.saveMetaData();
    }

    public async unloadArchieve() {
        this.$index = undefined;
    }

    public async saveArchieve() {
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
            progress: rootModel.currentState.progress
        };
        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.saveMetaData();
    }
}