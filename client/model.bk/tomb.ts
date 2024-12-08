import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model.bk";
import { ChunkOf } from "@/type/define";
import { Player } from "./player";
import { ICard, Card } from "./card";


@Factory.useProduct('tomb')
export class Tomb extends IModel<
    'tomb',
    {},
    Card[],
    {}
> {
    declare parent: Player;

    constructor(
        chunk: ChunkOf<Tomb>,
        parent: Player
    ) {
        super({
            child: [],
            ...chunk,
            state: {}
        }, parent);
    }
        
    append(chunk: ChunkOf<Card>) {
        this._child.push(chunk);
    }

}
