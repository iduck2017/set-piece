import { Factory } from "@/service/factory";
import { Def } from "@/type/define";
import { NodeModel } from "../node";
import { Props } from "@/type/props";
import { CardModel } from "./card";
import { Validator } from "@/service/validator";
import { PlayerModel } from "./player";
import { Model } from "@/type/model";

type DeckDef = Def.Create<{
    code: 'deck',
    stateDict: {},
    paramDict: {},
    childList: CardModel[],
    eventDict: {},
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

    generateCard() {
        // const chunk = DataBase.randomSelect<CardDef>(
        //     DataBase.cardProductInfo.selectAll
        // );
        // const chunk = { code: 'abusive-sergeant' };
        // const chunk = { code: 'elven-archer' };
        // const chunk = { code: 'blood-imp' };
        const chunk = { code: 'big-game-hunter' };
        this.appendChild(chunk);
    }

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

    @Validator.useCondition(model => Boolean(model.childList.length))
    drawCard() {
        const chunk = this.removeCard();
        if (chunk) {
            const hand = this.parent.childDict.hand;
            const result = hand.appendCard(chunk);
            return result;
        }
    }
}