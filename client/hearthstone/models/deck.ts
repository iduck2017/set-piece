import { DataBaseService } from "../services/database";
import { CardDef, CardModel } from "./card";
import { MinionModel } from "./minion";
import { PlayerModel } from "./player";
import { CustomDef, FactoryService, Model, NodeModel, Props, ValidatorService } from "@/set-piece";

type DeckDef = CustomDef<{
    code: 'deck',
    stateDict: {
        templateCode?: `${string}-card`,
    },
    paramDict: {},
    childList: CardModel[],
    eventDict: {
        onCardDiscard: [CardModel];
        onCardDraw: [CardModel];
        onCardGenerate: [CardModel];
        onMinionRecruit: [MinionModel];
    },
    parent: PlayerModel
}>

@FactoryService.useProduct('deck')
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

    setTemplateCode(templateCode: `${string}-card`) {
        this.baseStateDict.templateCode = templateCode;
    }

    generateCard<T extends CardModel>(chunk?: Model.Chunk<T>) {
        chunk = this.stateDict.templateCode ?
            { code: this.stateDict.templateCode } :
            chunk ?? DataBaseService.randomSelect<CardDef>(
                DataBaseService.cardProductInfo.selectAll
            );
        const target = this.appendChild(chunk);
        if (!target) return;
        this.eventDict.onCardGenerate(target);
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

    @ValidatorService.useCondition(model => Boolean(model.childList.length))
    drawCard(target?: CardModel) {
        target = target ?? this.childList[0];
        const chunk = this.removeChild(target);
        if (!chunk) return;
        const hand = this.parent.childDict.hand;
        const result = hand.accessCard(chunk);
        if (!result) return;
        this.eventDict.onCardDraw(result);
        return result;
    }

    @ValidatorService.useCondition(model => Boolean(model.childList.length))
    recruitMinion(target: MinionModel) {
        const chunk = this.removeChild(target);
        if (!chunk) return;
        const board = this.parent.childDict.board;
        const result = board.summonMinion(chunk);
        if (!result) return;
        this.eventDict.onMinionRecruit(result);
        return result;
    }
    
}