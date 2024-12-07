import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { ICard } from '.';
import { IMinion } from "../minion";

@Factory.useProduct('novice-engineer')
@IMinion.useFeat({
    rawAttack: 1,
    rawHealth: 1
})
export class NoviceEngineer extends ICard<
    'novice-engineer',
    {},
    {
        minion: IMinion,
    },
    {}
> {
    constructor(
        chunk: ChunkOf<NoviceEngineer>,
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
                name: 'Novice Engineer',
                desc: ''
                
            }
        }, parent);
    }
}
