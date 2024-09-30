import type { App } from "../app";
import { ARCHIEVE_SAVE_PATH } from "../configs/context";
import { Generator } from "../configs/generator";
import { RootModelDefine } from "../models/root";
import { IModel } from "../type/model";
import { singleton } from "../utils/singleton";

export type ArchieveData = {
    id: string
    name: string,
    progress: number
}

@singleton
export class ArchieveService {
    public readonly app: App;

    private $index?: number;

    private $data: ArchieveData[] = [];
    public get data() { return this.$data; } 

    constructor(app: App) {
        this.app = app;
    }

    public initialize(config: ArchieveData[]) {
        this.$data = config;
    }

    public async createArchieve() {
        this.app.reference.reset();
        const id = this.app.reference.register();
        this.$data.push({
            id,
            name: 'hello',
            progress: 0
        });
        const record = Generator.rootModelConfig();
        await localStorage.setItem(`${ARCHIEVE_SAVE_PATH}_${id}`, JSON.stringify(record));
        await this.app.saveMetaData();
        return record;
    }

    public async loadArchieve(index: number) {
        this.$index = index;
        const archieve = this.$data[index];
        const path = `${ARCHIEVE_SAVE_PATH}_${archieve.id}`;
        const raw = await localStorage.getItem(path);
        if (!raw) {
            throw new Error();
        }
        return JSON.parse(raw) as IModel.Config<RootModelDefine>;
    }

    public async removeArchieve(index: number) {
        const slot = this.$data[index];
        const path = `${ARCHIEVE_SAVE_PATH}_${slot.id}`;
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
        const path = `${ARCHIEVE_SAVE_PATH}_${slot.id}`;
        const record = rootModel.makeBundle();
        this.$data[index] = {
            ...slot,
            progress: rootModel.currentState.progress
        };
        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.saveMetaData();
    }
}