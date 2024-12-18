import { DataBase } from "../services/database";
import { CardDef, CardModel } from "./card";
import { PlayerModel } from "./player";
import { Def, Factory, Model, NodeModel, Props, Validator } from "@/set-piece";

type DeckDef = Def.Create<{
    code: 'deck',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {
        onCardDiscard: [CardModel];
        onCardDraw: [CardModel];
        onCardGenerate: [CardModel];
    },
    parent: PlayerModel
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

    generateCard<T extends CardModel>(chunk?: Model.Chunk<T>) {
        if (!chunk) {
            chunk = DataBase.randomSelect<CardDef>(
                DataBase.cardProductInfo.selectAll
            );
        }
        const target = this.appendChild(chunk);
        if (target) {
            this.eventDict.onCardGenerate(target);
            return target;
        }
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    discardCard(target?: CardModel) {
        if (!target) target = this.childList[0];
        const chunk = this.removeChild(target);
        if (chunk) {
            this.eventDict.onCardDiscard(target);
            return chunk;
        }
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    drawCard(target?: CardModel) {
        const chunk = this.discardCard(target);
        if (chunk) {
            const hand = this.parent.childDict.hand;
            const result = hand.accessCard(chunk);
            if (result) {
                this.eventDict.onCardDraw(result);
                return result;
            }
        }
    }
}