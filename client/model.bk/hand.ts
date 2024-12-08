import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model.bk";
import { ChunkOf } from "@/type/define";
import { Card, ICard } from "./card";
import { Player } from "./player";


@Factory.useProduct('hand')
export class Hand extends IModel<
    'hand',
    {},
    Card[],
    {
        onPlay: Card
    }
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

    append(chunk: ChunkOf<Card>): Card | undefined {
        const uuid = chunk.uuid;
        this._child.push(chunk);
        const card = this.child.find(c => c.uuid === uuid);
        return card;
    }

    play(card?: Card): ChunkOf<Card> | undefined {
        if (!card) card = this.child[0];
        const index = this.child.indexOf(card);
        if (index >= 0) {
            this._child.splice(index, 1);
            this._event.onPlay(card);
            const chunk = card.chunk;
            return chunk;
        }
    }
}
