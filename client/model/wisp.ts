import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { ICard } from "./card";
import { IMinion } from "./minion";

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
                minion: { code: 'minion' }
            },
            state: {
                ...chunk.state,
                name: 'wisp',
                desc: ''
            }
        }, parent);
    }
}
