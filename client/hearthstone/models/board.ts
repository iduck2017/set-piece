import { Def, Factory, Model, NodeModel, Props, Random, Validator } from "@/set-piece";
import { PlayerModel } from "./player";
import { MinionModel } from "./minion";
import { PlayerRefer } from "../utils/refers/player";

type BoardDef = Def.Create<{
    code: 'board',
    stateDict: {},
    paramDict: {},
    childList: MinionModel[],
    eventDict: {
        onMinionSummon: [MinionModel];
        onMinionRemove: [MinionModel];
    },
    parent: PlayerModel
}>

@Factory.useProduct('board')
export class BoardModel extends NodeModel<BoardDef> {
    readonly refer: PlayerRefer;

    constructor(props: Props<BoardDef>) {
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
        this.refer = new PlayerRefer(this);
    }
    
    summonMinion<T extends MinionModel>(chunk: Model.Chunk<T>) {
        const target = this.appendChild(chunk);
        if (target) {
            this.eventDict.onMinionSummon(target);
            return target;
        }
    }

    @Validator.useCondition(model => Boolean(model.childList.length))
    removeMinion(target?: MinionModel) {
        if (!target) target = this.childList[0];
        const chunk = this.removeChild(target);
        if (chunk) {
            this.eventDict.onMinionRemove(target);
            return chunk;
        }
    }

    @Validator.useCondition(model => (Boolean(
        model.refer.opponentBoard?.childList.length &&
        model.childList.length
    )))
    randomAttack() {
        const targetAlly = this.childList[Random.number(0, this.childList.length - 1)];
        const opponentBoard = this.refer.opponent?.childDict.board;
        if (!opponentBoard) return;
        const targetEnemy = opponentBoard.childList[
            Random.number(0, opponentBoard.childList.length - 1)
        ];
        if (!targetAlly || !targetEnemy) return;
        targetAlly.childDict.combatable.attack(
            targetEnemy.childDict.combatable
        );
    }
}