import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { Player } from "./player";
import { ICard } from "./card";
import { Dict } from "@/type/base";

@Factory.useProduct('team')
export class Team extends IModel<
    'team',
    {},
    ICard[],
    {}
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
