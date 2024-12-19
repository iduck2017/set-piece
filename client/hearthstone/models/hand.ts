import { CardModel } from "./card";
import { PlayerModel } from "./player";
import { CustomDef, Def, Factory, Model, NodeModel, Props } from "@/set-piece";

type HandDef = CustomDef<{
    code: 'hand',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {
        onCardAccess: [CardModel];
        onCardDiscard: [CardModel];
        onCardPlay: [CardModel];
    },
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

    accessCard(card: Model.Chunk<CardModel>) {
        const target = this.appendChild(card);
        if (target) {
            this.eventDict.onCardAccess(target);
            return target;
        }
    }

    discardCard(target?: CardModel) {
        if (!target) target = this.childList[0];
        const chunk = this.removeChild(target);
        if (chunk) {
            this.eventDict.onCardDiscard(target);
            return chunk;
        }
    }

    playCard(target?: CardModel) {
        if (!target) target = this.childList[0];
        const chunk = this.removeChild(target);
        if (chunk) {
            this.eventDict.onCardPlay(target);
            return chunk;
        }
    }
}