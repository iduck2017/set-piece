import { ChunkOf } from "@/type/model";
import { App } from "./app";
import { IModel } from ".";

export class BigBrother extends IModel<
    'big_brother',
    {},
    {},
    {}
> {
    declare readonly parent: App;

    constructor(
        chunk: ChunkOf<BigBrother>,
        parent: App
    ) { 
        super({
            ...chunk,
            state: {},
            child: {}
        }, parent);
    }
}