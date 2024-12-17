import { Def, Factory, Model, NodeModel, Props, Random, Validator } from "@/set-piece";
import { PlayerModel } from "./player";
import { MinionModel } from "./card/minion";
import { RaceType } from "@/hearthstone/services/database";

type BoardDef = Def.Create<{
    code: 'board',
    stateDict: {},
    paramDict: {},
    childList: MinionModel[],
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

    summonMinion<T extends MinionModel>(chunk: Model.Chunk<T>) {
        const target = this.appendChild(chunk);
        return target;
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    removeCard(target?: MinionModel) {
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

    disposeBody(card: MinionModel) {
        const chunk = this.removeCard(card);
        if (chunk) {
            this.parent.childDict.graveyard.appendCard(chunk);
        }
    }

    getMinionList(options: {
        excludeTarget?: MinionModel
        includeEnemy?: boolean,
        requiredRaces?: RaceType[]
    }) {
        let result = this.childList;
        if (options.includeEnemy) {
            const opponentBoard = this.opponent.childDict.board;
            result = result.concat(opponentBoard.childList);
        }
        if (options.excludeTarget) {
            result = result.filter(item => item !== options.excludeTarget);
        }
        if (options.requiredRaces) {
            const races = options.requiredRaces;
            result = result.filter((item: MinionModel) => (
                item.stateDict.races?.some(race => (
                    races.includes(race)
                ))
            ));
        }
        return result;
    }

}