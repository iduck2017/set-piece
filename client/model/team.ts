import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { Player } from "./player";
import { Card, ICard } from "./card";
import { Dict } from "@/type/base";
import { IMinion } from "./minion";

@Factory.useProduct('team')
export class Team extends IModel<
    'team',
    {},
    Card[],
    {
        onSummon: Card,
    }
> {
    declare parent: Player;

    constructor(
        chunk: ChunkOf<Team>,
        parent: Player
    ) {
        super({
            child: [],
            ...chunk,
            state: {}
        }, parent);
    }
    
    summon(chunk: ChunkOf<Card>): Card | undefined {
        const uuid = chunk.uuid;
        this._child.push(chunk);
        const child = this.child.find(c => c.uuid === uuid);
        if (child) {
            this._event.onSummon(child);
            return child;
        }
    }

    remove(card?: Card): ChunkOf<Card> | undefined {
        if (!card) card = this.child[0];
        const index = this.child.indexOf(card);
        if (index >= 0) {
            this._child.splice(index, 1);
            const chunk = card.chunk;
            return chunk;
        }
    }
}
