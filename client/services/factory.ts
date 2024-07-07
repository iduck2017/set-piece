import { 
    BaseConstructor, 
    BaseRecord 
} from "../types/base";
import { AppStatus } from "../types/status";
import { appStatus } from "../utils/status";
import { singleton } from "../utils/decors";
import { Service } from "./base";
import { 
    BaseModelDict, 
    BaseEvent, 
    BaseModelList, 
    BaseModel, 
    ModelChunk, 
    ModelConfig 
} from "../types/model";

@singleton
export class FactoryService extends Service {
    private static readonly _products: Record<number, BaseConstructor> = {};
    
    public static register(id: number, Constructor: BaseConstructor) {
        FactoryService._products[id] = Constructor;
    }

    @appStatus(AppStatus.MOUNTING)
    public unserialize<T extends BaseModel>(chunk: ModelChunk<
        number,
        BaseRecord,
        BaseRecord,
        BaseEvent,
        BaseEvent,
        BaseModel[],
        Record<string, BaseModel>        
    >): T {
        const Constructor = FactoryService._products[chunk.modelId];
        const list: BaseModel[] = [];
        const dict = {} as Record<string, BaseModel>;

        for (const item of chunk.list) {
            list.push(this.unserialize(item));
        }
        for (const key in chunk.dict) {
            dict[key] = this.unserialize(chunk.dict[key]);
        }

        const config: Required<ModelConfig<
            BaseEvent,
            BaseEvent,
            BaseRecord,
            BaseRecord,
            BaseModelList,
            BaseModelDict
        >>= {
            referId: chunk.referId,
            rule: chunk.rule,
            stat: chunk.stat,
            provider: chunk.provider,
            consumer: chunk.consumer,
            list,
            dict
        };

        return new Constructor(config);
    }
}

