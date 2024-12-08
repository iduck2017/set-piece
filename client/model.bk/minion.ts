import { Factory } from "@/service/factory";
import { IModel, Model } from "@/model.bk";
import { ChunkOf } from "@/type/define";
import { Class } from "@/type/base";
import { Card, ICard } from "./card";
import { Decor } from "@/service/decor";
import { Player } from "./player";
import { Validator } from "@/service/validator";
import { Team } from "./team";
import { Hand } from "./hand";
import { Lifecycle } from "@/service/lifecycle";

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
        readonly rawAttack?: number;
        readonly rawHealth?: number;
        readonly maxHealth: number;
    },
    {
    },
    {
        onBattlecry: void;
    }
> {
    private static _rules: Map<Function, MinionRule> = new Map();
    static useFeat(rule: MinionRule) {
        return function (Type: Class<Card>) {
            IMinion._rules.set(Type, rule);
        };
    }

    declare readonly parent: ICard;

    get opponent(): Player {
        return this.parent.opponent;
    }
    get player() {
        return this.parent.player;
    }
    get position() {
        return this.parent.parent;
    }

    constructor(
        chunk: ChunkOf<IMinion>,
        parent: Model
    ) {
        let rule = IMinion._rules.get(parent.constructor);
        rule = {
            rawHealth: chunk.state?.rawHealth || rule?.rawHealth || 1,
            rawAttack: chunk.state?.rawAttack || rule?.rawAttack || 1
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

    @Validator.useCondition(model => model.position instanceof Team)
    attack(target?: IMinion) {
        if (!target) {
            const team = this.opponent.child.team;
            target = team.child[0]?.child.minion;
        }
        if (target) {
            target.hurt(this.state.curAttack);
            this.hurt(target.state.curAttack);
        }
    }

    @Validator.useCondition(model => model.position instanceof Hand)
    play() {
        const card = this.parent;
        const team = this.player.child.team;
        const hand = this.player.child.hand;
        const chunk = hand.play(card);
        this._event.onBattlecry();
        if (chunk) {
            team.summon(chunk);
        }
    }

    @Lifecycle.useLoader()
    private _onHealthChange() {
        this.bind(
            this.event.onModelAlter,
            (target, data) => {
                // health change
                if (data.prev.curHealth !== data.next.curHealth) {
                    if (data.next.curHealth <= 0) {
                        this._die();
                        // console.log('minion die');
                    }
                }
            }
        );
    }

    @Validator.useCondition(model => model.position instanceof Team)
    @Validator.useCondition(model => model.state.curHealth <= 0)
    private _die() {
        const team = this.player.child.team;
        const tomb = this.player.child.tomb;
        const card = this.parent;
        const chunk = team.remove(card);
        console.log(chunk);
        if (chunk) {
            tomb.append(chunk);
        }
    }
}
