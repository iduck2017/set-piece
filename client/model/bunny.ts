import { IModel } from ".";
import { Factory } from "@/service/factory";
import { ChunkOf } from "@/type/model";
import { App } from "./app";

@Factory.useProduct('bunny')
export class Bunny extends IModel<
    'bunny',
    {
        age: number;
    },
    Bunny[],
    {}
> {
    declare parent: Bunny | App;

    constructor(
        chunk: ChunkOf<Bunny>,
        parent: Bunny | App
    ) {
        super({
            child: [],
            ...chunk,
            state: {
                age: 0,
                ...chunk.state
            }
        }, parent);
    }

     
}

