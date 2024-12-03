import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { ICard } from "./card";


@Factory.useProduct('deck')
export class Deck extends IModel<
    'deck',
    {},
    ICard[],
    {}
> {
    constructor(
        chunk: ChunkOf<Deck>,
        parent: Model
    ) {
        super({
            ...chunk,
            child: [],
            state: {}
        }, parent);
    }
}
