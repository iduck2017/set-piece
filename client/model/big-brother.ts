import { ChunkOf } from "@/type/model";
import { App } from "./app";
import { IModel } from ".";
import { Factory } from "@/service/factory";

@Factory.useProduct('big_brother')
export class BigBrother extends IModel<
    'big_brother',
    {
        name: string;
        desc: string;
    },
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
            state: {
                name: 'Big Brother',
                desc: 'Big Brother Is Watching You',
                ...chunk.state
            },
            child: {}
        }, parent);
    }
}