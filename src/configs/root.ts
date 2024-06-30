import { GenderType } from "../types/enums";
import { EventId } from "../types/events";
import { ModelId } from "../types/registry";
import { RootChunk } from "../types/root";

export const rootChunk: RootChunk = {
    modelId: ModelId.ROOT,
    referId: '',
    rule: {
        name: '',
        difficulty: 0
    },
    state: {
        progress: 0
    },
    emitters: {},
    handlers: {},
    children: {
        bunny: {
            modelId: ModelId.BUNNY,
            referId: '',
            rule: {},
            state: {
                age: 0,
                weight: 0,
                gender: GenderType.FEMALE,
            },
            emitters: {},
            handlers: {},
            children: [],
        }
    },
    version: ''
};