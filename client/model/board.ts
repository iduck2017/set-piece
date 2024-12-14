import { Factory } from "@/service/factory";
import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";
import { CardModel } from "./card";

type BoardDef = Def.Merge<{
    code: 'board',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {},
}>

@Factory.useProduct('board')
export class BoardModel extends NodeModel<BoardDef> {
    constructor(props: Props<BoardDef>) {
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
    }
}