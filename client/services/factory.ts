import { BaseClass } from "../types/base";
import { AppStatus } from "../types/status";
import { appStatus } from "../utils/status";
import { singleton } from "../utils/singleton";
import { Service } from "./base";
import { BaseModel } from "../types/model";
import { SeqOf } from "../types/sequence";
import { ModelId } from "../types/registry";
import { BunnyModel } from "../models/bunny";
import { RootModel } from "../models/root";

const $prod: Record<number, BaseClass> = {
    [ModelId.BUNNY]: BunnyModel,
    [ModelId.ROOT] : RootModel
};

@singleton
export class FactoryService extends Service {
    @appStatus(AppStatus.UNMOUNTED, AppStatus.MOUNTING)
    public unseq<T extends BaseModel>(seq: SeqOf<T>, parent: any): T {
        const Constructor = $prod[seq.id];
        return new Constructor({
            ...seq,
            parent,
            app: this.app
        });
    }
}

