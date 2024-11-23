import { Model } from "@//model";
import { Base } from "@/type/base";
import { Player } from "./player";

export type MinionRule = {
    rawAttack: number;
    curAttack: number;
    maxHealth: number;
    curHealth: number;
}

@Model.useProduct("minion")
export class Minion extends Model<{
    type: "minion";
    memoState: MinionRule,
    tempState: {},
    childDict: {},
    childList: {}
}> {
    static _isAlive() {
        return Model.useValidator(model => (
            model.parent instanceof Player &&
            model.parent.child.desk.includes(model)
        ));
    }

    private static readonly _rule: Map<Function, MinionRule> = new Map();
    static useRule(info: MinionRule) {
        return function (target: Base.Class<Model>) {
            Minion._rule.set(target, info);
        };
    }
    
    constructor(
        seq: Model.Seq<Minion>,
        parent: Model.Parent<Minion>
    ) {
        const rule = Minion._rule.get(parent.constructor);
        super({
            ...seq,
            childDict: {
                ...seq.childDict
            },
            childList: {
                ...seq.childList
            },
            memoState: {
                rawAttack: 1,
                curAttack: 1,
                maxHealth: 1,
                curHealth: 1,
                ...rule,
                ...seq.memoState
            },
            tempState: {
            }
        }, parent);
    }

    @Minion._isAlive()
    expose() {
        
    }
}
