import { RootModel } from "../models/root";
import { SeqOf } from "../types/sequence";
import { GenderType } from "../types/common";
import { ModelId } from "../types/registry";

export const rootChunk: SeqOf<RootModel> = {
    id  : ModelId.ROOT,
    key : '',
    rule: {
        name      : '',
        difficulty: 0
    },
    stat: {
        progress: 0
    },
    recv: {},
    call: {},
    list: [
    ],
    dict: {
        bunny: {
            id  : ModelId.BUNNY,
            key : '',
            rule: {},
            stat: {
                age   : 0,
                weight: 0,
                gender: GenderType.FEMALE
            },
            recv: {},
            call: {},
            list: [],
            dict: {}
        }
    }
};