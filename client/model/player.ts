import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { Deck } from "./deck";

@Factory.useProduct('player')
export class Player extends IModel<
    'player',
    {},
    {
        deck: Deck,
    },
    {}
> {
    constructor(
        chunk: ChunkOf<Player>,
        parent: Model
    ) {
        super({
            ...chunk,
            child: {
                deck: { code: 'deck' }
            },
            state: {}
        }, parent);
    }
}
