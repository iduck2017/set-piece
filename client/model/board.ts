import { Factory } from "@/service/factory";
import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";
import { CardModel } from "./card";
import { Validator } from "@/service/validator";
import { Model } from "@/type/model";
import { PlayerModel } from "./player";
import { Lifecycle } from "@/service/lifecycle";

type BoardDef = Def.Merge<{
    code: 'board',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {},
    parent: PlayerModel
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

    // @Lifecycle.useLoader()
    // private _handleChildDie() {
    //     this.childList.forEach(child => {
    //         const combatable = child.childDict.combatable;
    //         if (combatable) {
    //             this.bindEvent(
    //                 combatable.eventEmitterDict.onDie,
    //                 () => {
    //                     this.removeChild(child);
    //                 }
    //             );
    //         }
    //     });
    // }

    appendCard(chunk: Model.Chunk<CardModel>) {
        const target = this.appendChild(chunk);
        return target;
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    removeCard(target?: CardModel) {
        if (!target) target = this.childList[0];
        const chunk = this.removeChild(target);
        return chunk;
    }
}