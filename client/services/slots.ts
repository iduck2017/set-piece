import { SLOT_PATH } from "../configs/base";
import { AppStatus } from "../types/status";
import { SlotData } from "../types/app";
import { appStatus } from "../utils/status";
import { singleton } from "../utils/singleton";
import { Service } from "./base";
import { CreateSlotForm } from "../types/forms";
import { RootModel } from "../models/root";
import { ModelId } from "../types/registry";
import { SeqOf } from "../types/sequence";

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
    public async new(options: CreateSlotForm) {
        const slotId = Date.now().toString(16);
        const path = `${SLOT_PATH}_${slotId}`;
        this._data.push({
            name    : options.name,
            slotId  : slotId,
            progress: 0
        });
        this.app.refer.reset();
        const root = this.app.factory.unseq<RootModel>({
            id  : ModelId.ROOT,
            rule: {
                name      : 'demo',
                difficulty: 2
            },
            dict: {
                bunny: {
                    id  : ModelId.BUNNY,
                    rule: {}
                }
            }
        }, undefined);
        const record = root.seq();

        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.meta.save();
        
        return record;
    }

    @appStatus(AppStatus.MOUNTING)
    public async load(index: number) {
        this._index = index;
        const slot = this._data[index];
        const path = `${SLOT_PATH}_${slot.slotId}`;

        const raw = await localStorage.getItem(path);
        
        if (!raw) throw new Error();
        return JSON.parse(raw) as SeqOf<RootModel>;
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
        const record = root.seq();
        this._data[index] = {
            ...slot,
            progress: root.data.progress
        };
        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.meta.save();
    }
}