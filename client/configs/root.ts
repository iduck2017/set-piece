import { RootModel } from "../models/root";
import { SeqOf } from "../types/sequence";
import { GenderType } from "../types/common";
import { ModelId } from "../types/model";
import type { App } from "../app";

export function rootSeq(conf: {
    app: App
}): SeqOf<RootModel>  {
    conf.app.ref.reset();
    return {
        id: ModelId.ROOT,
        key: conf.app.ref.get(),
        rule: {
            name: '',
            level: 0
        },
        stat: { progress: 0 },
        recv: {},
        emit: {},
        list: [
        ],
        dict: {
            bunny: {
                id: ModelId.BUNNY,
                key: conf.app.ref.get(),
                rule: {},
                stat: {
                    age: 0,
                    weight: 0,
                    gender: GenderType.FEMALE
                },
                recv: {},
                emit: {},
                list: [],
                dict: {}
            }
        }
    };
}