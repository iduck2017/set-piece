import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { ICard } from "./card";
import { Player } from "./player";


@Factory.useProduct('hand')
export class Hand extends IModel<
    'hand',
    {},
    ICard[],
    {}
> {
    declare parent: Player;

    constructor(
        chunk: ChunkOf<Hand>,
        parent: Player
    ) {
        super({
            child: [],
            ...chunk,
            state: {}
        }, parent);
    }

    append(chunk: ChunkOf<ICard>) {
        this._child.push(chunk);
    }

    remove(card?: ICard): ChunkOf<ICard> | undefined {
        if (!card) card = this.child[0];
        const index = this.child.indexOf(card);
        if (index >= 0) {
            this._child.splice(index, 1);
            const chunk = card.chunk;
            return chunk;
        }
    }
}
