import { Service } from ".";
import { App } from "../app";
import { RootModel } from "../model/root";
import { Delegator } from "../utils/proxy";

export const ARCHIEVE_SAVE_PATH = 'archieve';

export type ArchieveData = {
    id: string
    name: string,
    progress: number
}


@Service.useSingleton
export class FileService extends Service {

    #index?: number;
    readonly #data: ArchieveData[];
    readonly data: Readonly<ArchieveData[]>; 

    constructor(app: App) {
        super(app);
        this.#data = [];
        this.data = Delegator.readonlyMap(this.#data);
    }

    init(data: Readonly<ArchieveData[]>) {
        this.#data.push(...data);     
    }

    async new(): Promise<RootModel['config']> {
        const id = Date.now().toString(36);
        this.#data.push({
            id,
            name: 'hello',
            progress: 0
        });
        const record: RootModel['config'] = { type: 'root' };
        await localStorage.setItem(
            `${ARCHIEVE_SAVE_PATH}_${id}`, 
            JSON.stringify(record)
        );
        await this.app.save();
        return record;
    }

    async load(
        index: number
    ): Promise<RootModel['config']> {
        this.#index = index;
        const archieve = this.#data[index];
        const path = `${ARCHIEVE_SAVE_PATH}_${archieve.id}`;
        const raw = await localStorage.getItem(path);
        if (!raw) throw new Error();
        return JSON.parse(raw);
    }

    async remove(index: number) {
        const slot = this.#data[index];
        const path = `${ARCHIEVE_SAVE_PATH}_${slot.id}`;
        this.#data.splice(index, 1);
        await localStorage.removeItem(path);
        await this.app.save();
    }

    async unload() {
        this.#index = undefined;
    }

    async save() {
        const index = this.#index;
        const rootModel = this.app.root;
        if (!rootModel || index === undefined) {
            throw new Error();
        }
        const slot = this.#data[index];
        const path = `${ARCHIEVE_SAVE_PATH}_${slot.id}`;
        const record = rootModel.config;
        // 更新档案信息
        this.#data[index] = {
            ...slot,
            progress: rootModel.curStateMap.time
        };
        await localStorage.setItem(
            path, 
            JSON.stringify(record)
        );
        await this.app.save();
    }
}