import { IModel } from ".";
import { Factory } from "@/service/factory";
import { ChunkOf } from "@/type/model";
import { App } from "./app";
import { Bunny } from "./bunny";

@Factory.useProduct('demo')
export class Demo extends IModel<
    'demo',
    {
        count: number;
    },
    {
        bunny: Bunny;  
    },
    {}
> {
    declare parent: App;

    constructor(
        chunk: ChunkOf<Demo>,
        parent: App
    ) {
        super({
            ...chunk,
            child: {
                bunny: { code: 'bunny' },
                ...chunk.child
            },
            state: {
                count: 1,
                ...chunk.state
            }
        }, parent);
    }
     
}

