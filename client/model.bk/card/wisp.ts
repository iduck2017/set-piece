import { Factory } from "@/service/factory";
import { Model } from "@/model.bk";
import { ChunkOf } from "@/type/define";
import { ICard } from ".";
import { IMinion } from "../minion";
import { BattlecryDrawCard } from "../feat/battlecry-draw-card";

@Factory.useProduct('wisp')
@IMinion.useFeat({
    rawAttack: 1,
    rawHealth: 1
})
@BattlecryDrawCard.useFeature({
    rawCount: 1
})
export class Wisp extends ICard<
    'wisp',
    {},
    {
        minion: IMinion,
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
