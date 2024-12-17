import { CardModel } from "./card/card";
import { PlayerModel } from "./player";
import { Def, Factory, Model, NodeModel, Props } from "@/set-piece";

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

    emptyCardList() {
        for (const child of [ ...this.childList ]) {
            this.removeChild(child);
        }
    }
}