import { RootModel } from "../models/root";
import { SeqOf } from "../types/sequence";
import { GenderType } from "../types/common";
import { ModelId } from "../types/registry";
import type { App } from "../app";

export function rootSeq(conf: {
    app: App
}): SeqOf<RootModel>  {
    conf.app.ref.reset();
    return {
        id  : ModelId.ROOT,
        key : conf.app.ref.register(),
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
                key : conf.app.ref.register(),
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
}