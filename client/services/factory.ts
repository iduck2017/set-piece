import { BaseConstructor } from "../types/base";
import { AppStatus } from "../types/status";
import { appStatus } from "../utils/status";
import { singleton } from "../utils/decors";
import { Service } from "./base";
import { BaseModel } from "../types/model";
import { BaseTmpl } from "../types/tmpl";

import { ComnConf } from "../types/conf";
import { BaseChunk } from "../types/chunk";

@singleton
export class FactoryService extends Service {
    private static readonly _products: Record<number, BaseConstructor> = {};
    
    public static register(id: number, Constructor: BaseConstructor) {
        FactoryService._products[id] = Constructor;
    }

    @appStatus(AppStatus.MOUNTING)
    public unserialize<T extends BaseModel>(chunk: BaseChunk<BaseTmpl>): T {
        const Constructor = FactoryService._products[chunk.modelId];
        const list: BaseModel[] = [];
        const dict = {} as Record<string, BaseModel>;

        for (const item of chunk.list) {
            list.push(this.unserialize(item));
        }
        for (const key in chunk.dict) {
            dict[key] = this.unserialize(chunk.dict[key]);
        }

        const config: Required<ComnConf<BaseTmpl>>= {
            referId: chunk.referId,
            rule: chunk.rule,
            stat: chunk.stat,
            sender: chunk.sender,
            recver: chunk.recver,
            list,
            dict
        };

        return new Constructor(config);
    }
}

