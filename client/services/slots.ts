import { SLOT_PATH } from "../configs/base";
import { AppStatus } from "../types/status";
import { SlotData } from "../types/app";
import { appStatus } from "../utils/status";
import { singleton } from "../utils/decors";
import { Service } from "./base";
import { CreateSlotForm } from "../types/forms";
import { RootChunk } from "../types/root";
import { RootModel } from "../models/root";

@singleton
export class SlotsService extends Service {
    private _index?: number;

    private _data: SlotData[] = [];
    public get data() { return this._data; } 

    @appStatus(AppStatus.INITED)
    public init(config: SlotData[]) {
        this._data = config;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async new(options: CreateSlotForm): Promise<RootChunk> {
        const slotId = Date.now().toString(16);
        const path = `${SLOT_PATH}_${slotId}`;
        this._data.push({
            name: options.name,
            slotId: slotId,
            progress: 0
        });
        this.app.refer.reset();
        const root = new RootModel({ rule: options });
        root.mount({
            app: this.app,
            parent: root
        });
        const record = root.serialize();

        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.meta.save();
        
        return record;
    }

    @appStatus(AppStatus.MOUNTING)
    public async load(index: number): Promise<RootChunk> {
        this._index = index;
        const slot = this._data[index];
        const path = `${SLOT_PATH}_${slot.slotId}`;

        const raw = await localStorage.getItem(path);
        
        if (!raw) throw new Error();
        return JSON.parse(raw) as RootChunk;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async delete(index: number) {
        const slot = this._data[index];
        const path = `${SLOT_PATH}_${slot.slotId}`;
        this._data.splice(index, 1);

        await this.app.meta.save();
        await localStorage.removeItem(path);
    }

    @appStatus(AppStatus.MOUNTED)
    public async quit() {
        this._index = undefined;
    }

    @appStatus(AppStatus.MOUNTED)
    public async save() {
        const index = this._index;
        const root = this.app.root;
        if (!root || index === undefined) {
            throw new Error();
        }
        const slot = this._data[index];
        const path = `${SLOT_PATH}_${slot.slotId}`;
        const record = root.serialize();
        this._data[index] = {
            ...slot,
            progress: root.data.calc.progress
        };
        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.meta.save();
    }
}