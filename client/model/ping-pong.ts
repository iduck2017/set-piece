import { IModel, Model } from ".";
import { Factory } from "@/service/factory";
import { ChunkOf } from "@/type/model";

@Factory.useProduct('ping')
export class Ping extends IModel<
    'ping',
    {
        count: number;
    },
    {},
    {}
> {
    constructor(
        chunk: ChunkOf<Ping>,
        parent: Model
    ) {
        super({
            ...chunk,
            child: {},
            state: {
                count: 0,
                ...chunk.state
            }
        }, parent);
    }
}

@Factory.useProduct('pong')
export class Pong extends IModel<
    'pong',
    {
        count: number;
    },
    {},
    {}
> {
    constructor(
        chunk: ChunkOf<Pong>,
        parent: Model
    ) {
        super({
            ...chunk,
            child: {},
            state: {
                count: 0,
                ...chunk.state
            }
        }, parent);
    }
}
