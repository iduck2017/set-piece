import { App } from "../app";
import { RootModel } from "../model/root";
import { Global } from "../utils/global";
import { Delegator } from "../utils/proxy";

export const ARCHIEVE_SAVE_PATH = 'archieve';

export type FileInfo = {
    id: string
    name: string,
    progress: number
}


@Global.useSingleton
export class FileService {

    private _index?: number;

    readonly app: App;

    private readonly _data: FileInfo[];
    readonly data: Readonly<FileInfo[]>; 

    constructor(app: App) {
        this.app = app;
        this._data = [];
        this.data = Delegator.readonlyMap(this._data);
    }

    init(data: Readonly<FileInfo[]>) {
        this._data.push(...data);     
    }

    async new(): Promise<RootModel['config']> {
        const id = Date.now().toString(36);
        this._data.push({
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
        this._index = index;
        const archieve = this._data[index];
        const path = `${ARCHIEVE_SAVE_PATH}_${archieve.id}`;
        const raw = await localStorage.getItem(path);
        if (!raw) throw new Error();
        return JSON.parse(raw);
    }

    async remove(index: number) {
        const slot = this._data[index];
        const path = `${ARCHIEVE_SAVE_PATH}_${slot.id}`;
        this._data.splice(index, 1);
        await localStorage.removeItem(path);
        await this.app.save();
    }

    async unload() {
        this._index = undefined;
    }

    async save() {
        const index = this._index;
        const rootModel = this.app.root;
        if (!rootModel || index === undefined) {
            throw new Error();
        }
        const slot = this._data[index];
        const path = `${ARCHIEVE_SAVE_PATH}_${slot.id}`;
        const record = rootModel.config;
        // 更新档案信息
        this._data[index] = {
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