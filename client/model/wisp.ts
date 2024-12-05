import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { ICard } from "./card";
import { IMinion } from "./minion";
import { Hand } from "./hand";
import { Deck } from "./deck";
import { Team } from "./team";
import { Tomb } from "./tomb";
import { Player } from "./player";

@Factory.useProduct('wisp')
export class Wisp extends ICard<
    'wisp',
    {},
    {
        minion: IMinion
    },
    {}
> {
    constructor(
        chunk: ChunkOf<Wisp>,
        parent: Model
    ) {
        super({
            ...chunk,
            child: {
                minion: { code: 'minion' },
                ...chunk.child
            },
            state: {
                ...chunk.state,
                name: 'wisp',
                desc: ''
            }
        }, parent);
    }
}
