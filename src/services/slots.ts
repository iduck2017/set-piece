import { SLOT_PATH } from "../configs/base";
import { AppStatus } from "../types/status";
import { SlotData } from "../types/app";
import { appStatus } from "../utils/decors/status";
import { singleton } from "../utils/decors/singleton";
import { Service } from "./base";
import { CreateSlotForm } from "../types/forms";
import { Exception } from "../utils/exceptions";
import { RootModel } from "../models/root";
import { RootChunk } from "../types/root";

@singleton
export class SlotsService extends Service {
    private _index?: number;

    private _data: SlotData[] = [];
    public get data() { return [...this._data]; } 

    @appStatus(AppStatus.INITED)
    public init(config: SlotData[]) {
        this._data = config;
    }

    private _register(): number {
        let ticket = 1;
        while (this._data.find(item => item.slotID === ticket)) {
            ticket += 1;
        }
        return ticket;
    }
    
    @appStatus(AppStatus.UNMOUNTED)
    public async new(options: CreateSlotForm) {
        const slotID = this._register();
        const path = `${SLOT_PATH}-${slotID}`;
        this._data.push({
            name: options.name,
            slotID,
            progress: 0
        });
        const record = new RootModel({
            rule: options,
            app: this.app
        }).serialize();
        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.services.meta.save();
        return record;
    }

    @appStatus(AppStatus.MOUNTING)
    public async load(index: number): Promise<RootChunk> {
        this._index = index;
        const slot = this._data[index];
        const path = `${SLOT_PATH}-${slot.slotID}`;
        const raw = await localStorage.getItem(path);
        if (!raw) throw new Exception();
        return JSON.parse(raw) as RootChunk;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async delete(index: number) {
        const slot = this._data[index];
        const path = `${SLOT_PATH}-${slot.slotID}`;
        this._data.splice(index, 1);
        await this.app.services.meta.save();
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
            throw new Exception();
        }
        const slot = this._data[index];
        const path = `${SLOT_PATH}-${slot.slotID}`;
        const record = root.serialize();
        this._data[index] = {
            ...slot,
            progress: root.data.progress
        };
        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.services.meta.save();
    }
}