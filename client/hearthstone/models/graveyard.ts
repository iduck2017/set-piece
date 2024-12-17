import { Factory } from "@/set-piece/service/factory";
import { Def } from "@/set-piece/type/define";
import { NodeModel } from "../../set-piece/node";
import { Props } from "@/set-piece/type/props";
import { CardModel } from "./card/card";
import { PlayerModel } from "./player";
import { Model } from "@/set-piece/type/model";

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