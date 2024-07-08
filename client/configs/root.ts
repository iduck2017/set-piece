import { RootModel } from "../models/root";
import { ChunkOf } from "../types/chunk";
import { GenderType } from "../types/enums";
import { ModelId } from "../types/registry";

export const rootChunk: ChunkOf<RootModel> = {
    modelId: ModelId.ROOT,
    referId: '',
    rule: {
        name: '',
        difficulty: 0
    },
    stat: {
        progress: 0
    },
    sender: {},
    recver: {},
    list: [
    ],
    dict: {
        bunny: {
            modelId: ModelId.BUNNY,
            referId: '',
            rule: {},
            stat: {
                age: 0,
                weight: 0,
                gender: GenderType.FEMALE
            },
            sender: {},
            recver: {},
            list: [],
            dict: {}
        }
    }
};