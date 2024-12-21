import { CardModel } from "./card";
import { PlayerModel } from "./player";
import { CustomDef, FactoryService, Model, NodeModel, Props, ValidatorService } from "@/set-piece";

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

@FactoryService.useProduct('hand')
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
        if (!target) return;
        this.eventDict.onCardAccess(target);
        return target;
    }

    @ValidatorService.useCondition(model => Boolean(model.childList.length))
    discardCard(target?: CardModel) {
        target = target ?? this.childList[0];
        const chunk = this.removeChild(target);
        if (!chunk) return;
        this.eventDict.onCardDiscard(target);
        return chunk;
    }

    playCard(target?: CardModel) {
        target = target ?? this.childList[0];
        const chunk = this.removeChild(target);
        if (!chunk) return;
        this.eventDict.onCardPlay(target);
        return chunk;
    }
}