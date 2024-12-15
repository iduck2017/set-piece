import { Factory } from "@/service/factory";
import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";
import { CardModel } from "./card";
import { PlayerModel } from "./player";
import { Model } from "@/type/model";

type GraveyardDef = Def.Create<{
    code: 'graveyard',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {},
    parent: PlayerModel
}>

@Factory.useProduct('graveyard')
export class GraveyardModel extends NodeModel<GraveyardDef> {
    constructor(props: Props<GraveyardDef>) {
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
    }

    appendCard(chunk: Model.Chunk<CardModel>) {
        const target = this.appendChild(chunk);
        return target;
    }
}