import { GenderType } from "../types/enums";
import { ModelId } from "../types/registry";
import { RootChunk } from "../types/root";

export const rootChunk: RootChunk = {
    modelId: ModelId.ROOT,
    referId: '',
    rule: {
        name: '',
        difficulty: 0
    },
    stat: {
        progress: 0
    },
    provider: {},
    consumer: {},
    children: {
        bunny: {
            modelId: ModelId.BUNNY,
            referId: '',
            rule: {},
            stat: {
                age: 0,
                weight: 0,
                gender: GenderType.FEMALE
            },
            provider: {},
            consumer: {},
            children: []
        }
    },
    version: ''
};