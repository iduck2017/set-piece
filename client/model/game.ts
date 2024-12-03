import { Factory } from "@/service/factory";
import { IModel, Model } from ".";
import { ChunkOf } from "@/type/model";

@Factory.useProduct('game')
export class Game extends IModel<
    'game',
    {},
    {},
    {}
> {
    constructor(
        chunk: ChunkOf<Game>,
        parent: Model
    ) {
        super({
            ...chunk,
            child: {},
            state: {}
        }, parent);
    }
}