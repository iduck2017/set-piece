import { BaseClass } from "../types/base";
import { AppStatus } from "../types/status";
import { Lifecycle } from "../utils/lifecyle";
import { singleton } from "../utils/singleton";
import { Service } from "./base";
import { BaseModel, ModelId } from "../types/model";
import { SeqOf } from "../types/sequence";
import { BunnyModel } from "../models/bunny";
import { RootModel } from "../models/root";
import { ParentOf } from "../types/definition";
import { Model } from "../models/base";

const $prod: Record<number, BaseClass> = {
    [ModelId.BUNNY]: BunnyModel,
    [ModelId.ROOT]: RootModel
};

@singleton
export class FactoryService extends Service {
    @Lifecycle.app(
        AppStatus.UNMOUNTED, 
        AppStatus.MOUNTING,
        AppStatus.MOUNTED
    )
    public unseq<M extends BaseModel>(
        seq: SeqOf<M>,
        parent: M extends Model<infer T> ? ParentOf<T> : never
    ): M {
        const Constructor = $prod[seq.id];
        return new Constructor(seq, parent, this.app);
    }
}

