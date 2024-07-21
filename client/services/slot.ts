import { SLOT_PATH } from "../configs/base";
import { AppStatus } from "../types/status";
import { SlotData } from "../types/app";
import { Lifecycle } from "../utils/lifecyle";
import { singleton } from "../utils/singleton";
import { Service } from "./base";
import { CreateSlotForm } from "../types/forms";
import { RootModel } from "../models/root";
import { SeqOf } from "../types/sequence";
import { rootSeq } from "../configs/root";

@singleton
export class SlotService extends Service {
    private $index?: number;
    private $data  : SlotData[] = [];

    public get data() { return this.$data; } 

    @Lifecycle.app(AppStatus.INITED)
    public init(config: SlotData[]) {
        this.$data = config;
    }

    @Lifecycle.app(AppStatus.UNMOUNTED)
    public async new(options: CreateSlotForm) {
        const slotId = Date.now().toString(16);
        const path = `${SLOT_PATH}_${slotId}`;
        this.$data.push({
            name    : options.name,
            slotId  : slotId,
            progress: 0
        });
        this.app.ref.reset();
        const record = rootSeq({ app: this.app });
        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.meta.save();
        return record;
    }

    @Lifecycle.app(AppStatus.MOUNTING)
    public async load(index: number) {
        this.$index = index;
        const slot = this.$data[index];
        const path = `${SLOT_PATH}_${slot.slotId}`;
        const raw = await localStorage.getItem(path);
        if (!raw) throw new Error();
        return JSON.parse(raw) as SeqOf<RootModel>;
    }

    @Lifecycle.app(AppStatus.UNMOUNTED)
    public async delete(index: number) {
        const slot = this.$data[index];
        const path = `${SLOT_PATH}_${slot.slotId}`;
        this.$data.splice(index, 1);

        await this.app.meta.save();
        await localStorage.removeItem(path);
    }

    @Lifecycle.app(AppStatus.MOUNTED)
    public async quit() {
        this.$index = undefined;
    }

    @Lifecycle.app(AppStatus.MOUNTED)
    public async save() {
        const index = this.$index;
        const root = this.app.root;
        if (!root || index === undefined) {
            throw new Error();
        }
        const slot = this.$data[index];
        const path = `${SLOT_PATH}_${slot.slotId}`;
        const record = root.seq();
        this.$data[index] = {
            ...slot,
            progress: root.data.progress
        };
        await localStorage.setItem(path, JSON.stringify(record));
        await this.app.meta.save();
    }
}