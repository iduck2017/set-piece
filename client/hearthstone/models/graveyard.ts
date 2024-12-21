import { CardModel } from "./card";
import { PlayerModel } from "./player";
import { CustomDef, FactoryService, Model, NodeModel, Props, ValidatorService } from "@/set-piece";

type GraveyardDef = CustomDef<{
    code: 'graveyard',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {
        onCardAccess: [CardModel];
        onCardRemove: [CardModel];
    },
    parent: PlayerModel
}>

@FactoryService.useProduct('graveyard')
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

    accessCard(chunk: Model.Chunk<CardModel>) {
        const target = this.appendChild(chunk);
        if (!target) return;
        this.eventDict.onCardAccess(target);
        return target;
    }

    @ValidatorService.useCondition(model => !model.childList.length)
    removeCard(target?: CardModel) {
        target = target ?? this.childList[0];
        const chunk = this.removeChild(target);
        if (!chunk) return;
        this.eventDict.onCardRemove(target);
        return chunk;
    }
}