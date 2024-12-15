import { Factory } from "@/service/factory";
import { Def } from "@/type/define";
import { NodeModel } from "../node";
import { Props } from "@/type/props";
import { CardModel } from "./card";
import { Validator } from "@/service/validator";
import { Model } from "@/type/model";
import { PlayerModel } from "./player";
import { Random } from "@/util/random";

type BoardDef = Def.Create<{
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

    
    get opponent(): PlayerModel {
        const player = this.parent;
        const game = player.parent;
        return game.childDict.redPlayer === player ?
            game.childDict.bluePlayer :
            game.childDict.redPlayer;
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

    appendCard<T extends CardModel>(chunk: Model.Chunk<T>) {
        const target = this.appendChild(chunk);
        return target;
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    removeCard(target?: CardModel) {
        if (!target) target = this.childList[0];
        const chunk = this.removeChild(target);
        return chunk;
    }

    @Validator.useCondition(model => (
        model.opponent.childDict.board.childList.length > 0 &&
        model.childList.length > 0
    ))
    randomCommand() {
        const targetAlly = this.childList[Random.number(0, this.childList.length - 1)];
        const opponentBoard = this.opponent.childDict.board;
        const targetEnemy = opponentBoard.childList[
            Random.number(0, opponentBoard.childList.length - 1)
        ];
        if (
            targetEnemy?.childDict.combatable && 
            targetAlly?.childDict.combatable
        ) {
            targetAlly.childDict.combatable.attack(
                targetEnemy.childDict.combatable
            );
        }
    }

    disposeBody(card: CardModel) {
        const chunk = this.removeCard(card);
        if (chunk) {
            this.parent.childDict.graveyard.appendCard(chunk);
        }
    }
}