import { Factory } from "@/service/factory";
import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";
import { CardModel } from "./card";
import { PlayerModel } from "./player";

type GraveyardDef = Def.Merge<{
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
}