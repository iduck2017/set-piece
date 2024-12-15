import { Factory } from "@/service/factory";
import { Props } from "@/type/props";
import { NodeModel } from "../node";
import { Def } from "@/type/define";
import { Base } from "@/type/base";
import { Lifecycle } from "@/service/lifecycle";
import { Validator } from "@/service/validator";
import { Model } from "@/type/model";
import { RaceType } from "@/service/database";

export type CombatableRule = {
    health: number;
    attack: number;
    isDivineShield?: boolean;
    // races?: RaceType[];
}

export type CombatableDef = Def.Create<{
    code: 'combatable';
    stateDict: {
        readonly fixHealth?: number;
        readonly fixAttack?: number;
        curHealth: number;
        isAlive: boolean;
        isDivineShield: boolean;
    };
    paramDict: {
        maxHealth: number;
        attack: number;
        // readonly races: RaceType[];
    }
    eventDict: {
        onDie: [CombatableModel] 
        onHurt: [CombatableModel, number]
    },
}>

@Factory.useProduct('combatable')
export class CombatableModel extends NodeModel<CombatableDef> {
    private static readonly _ruleMap: Map<Function, CombatableRule> = new Map();
    static useRule(rule: CombatableRule) {
        return function(Type: Base.Class) {
            CombatableModel._ruleMap.set(Type, rule);
        };
    }

    constructor(props: Props<CombatableDef>) {
        const combatableRule = CombatableModel._ruleMap.get(props.parent.constructor);
        super({
            ...props,
            stateDict: {
                curHealth: props.stateDict?.fixHealth || combatableRule?.health || 1,
                isAlive: true,
                isDivineShield: combatableRule?.isDivineShield || false,
                ...props.stateDict
            },
            paramDict: {
                // races: combatableRule?.races || [],
                maxHealth: combatableRule?.health || props.stateDict?.fixAttack || 1,
                attack: combatableRule?.attack || props.stateDict?.fixAttack || 1
            },
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleHealthAlter() {
        this.bindEvent(
            this.eventEmitterDict.onStateAlter,
            (target, prevState) => {
                if (
                    prevState.curHealth > 0 && 
                    target.stateDict.curHealth <= 0
                ) {
                    this._die();
                }
            }
        );
    }

    @Validator.useCondition(model => model.stateDict.isAlive)
    private _die() {
        this.baseStateDict.isAlive = false;
        // if (this.parent instanceof CardModel) {
        //     const board = this.parent.player.childDict.board;
        //     board.removeCard(this.parent);
        // }
        this.eventDict.onDie(this);
    }

    @Validator.useCondition(model => model.stateDict.isAlive)
    attack(target: CombatableModel) {
        // if (!target && this.parent instanceof CardModel) {
        //     const opponent = this.parent.opponent;
        //     const card = opponent.childDict.board.childList[0];
        //     if (card) {
        //         target = card.childDict.combatable;
        //     }
        // }
        if (target) {
            this._dealDamage(target);
            target._dealDamage(this);
        }
    }

    private _dealDamage(target: CombatableModel) {
        const damage = this.stateDict.attack;
        const enemyDamage = target.stateDict.attack;
        target.receiveDamage(damage, this.parent);
        this.receiveDamage(enemyDamage, target.parent);
    }

    receiveDamage(damage: number, source: Model) {
        if (this.stateDict.isDivineShield) {
            this.baseStateDict.isDivineShield = false;
            return;
        }
        this.baseStateDict.curHealth -= damage;
        this.eventDict.onHurt(this, damage);
    }

    destroy() {
        this._die();
    }
}
