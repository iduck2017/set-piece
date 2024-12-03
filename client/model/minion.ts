import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model";
import { ChunkOf } from "@/type/model";
import { Class } from "@/type/base";
import { ICard } from "./card";
import { Decor } from "@/service/decor";

type MinionRule = {
    rawHealth: number;
    rawAttack: number;
}

@Decor.useMutators({
    curAttack: true,
    maxHealth: true
})
@Factory.useProduct('minion')
export class IMinion extends IModel<
    'minion',
    {
        curHealth: number;
        readonly curAttack: number;
        readonly fixAttack?: number;
        readonly fixHealth?: number;
        readonly maxHealth: number;
    },
    {
    },
    {}
> {
    private static _rules: Map<Function, MinionRule> = new Map();
    static useFeature(rule: MinionRule) {
        return function (Type: Class<ICard>) {
            IMinion._rules.set(Type, rule);
        };
    }

    constructor(
        chunk: ChunkOf<IMinion>,
        parent: Model
    ) {
        const defaultRule: MinionRule = {
            rawHealth: 1,
            rawAttack: 1
        };
        const overrideRule: Partial<MinionRule> = {
            rawHealth: chunk.state?.fixHealth,
            rawAttack: chunk.state?.fixAttack
        };
        const rule = {
            ...defaultRule,
            ...IMinion._rules.get(parent.constructor),
            ...overrideRule
        };
        super({
            ...chunk,
            child: {},
            state: {
                curHealth: rule.rawHealth,
                ...chunk.state,
                curAttack: rule.rawAttack,
                maxHealth: rule.rawHealth
            }
        }, parent);
    }

    hurt(damage: number) {
        this._state.curHealth -= damage;
    }

    attack(target: IMinion) {
        target.hurt(this.state.curAttack);
    }
}
