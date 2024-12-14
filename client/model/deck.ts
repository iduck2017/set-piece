import { Factory } from "@/service/factory";
import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";
import { CardModel } from "./card";

type DeckDef = Def.Merge<{
    code: 'deck',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {},
}>

@Factory.useProduct('deck')
export class DeckModel extends NodeModel<DeckDef> {
    constructor(props: Props<DeckDef>) {
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
    }
}