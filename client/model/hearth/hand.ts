import { Factory } from "@/service/factory";
import { Def } from "@/type/define";
import { NodeModel } from "../node";
import { Props } from "@/type/props";
import { CardModel } from "./card";
import { Model } from "@/type/model";
import { PlayerModel } from "./player";

type HandDef = Def.Create<{
    code: 'hand',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {},
    parent: PlayerModel
}>

@Factory.useProduct('hand')
export class HandModel extends NodeModel<HandDef> {
    constructor(props: Props<HandDef>) {
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
    }

    appendCard(card: Model.Chunk<CardModel>) {
        const target = this.appendChild(card);
        return target;
    }

    removeCard(target?: CardModel) {
        if (!target) target = this.childList[0];
        const chunk = this.removeChild(target);
        return chunk;
    }

    clearCardList() {
        for (const child of [ ...this.childList ]) {
            this.removeChild(child);
        }
    }
}