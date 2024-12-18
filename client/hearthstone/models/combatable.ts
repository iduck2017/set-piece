import { Base, Def, Factory, Lifecycle, 
    Model, NodeModel, Props, Validator } from "@/set-piece";
import { RaceType } from "../services/database";
import { CardRefer } from "../utils/refers/card";

export type CombatableRule = {
    health: number;
    attack: number;
    isDivineShield?: boolean;
    isRush?: boolean;
    isCharge?: boolean;
    isWindfury?: boolean;
    isTaunt?: boolean;
    races: Readonly<RaceType[]>;
}

export type CombatableDef = Def.Create<{
    code: 'combatable';
    stateDict: {
        readonly fixHealth?: number;
        readonly fixAttack?: number;
        curHealth: number;
        isAlive: boolean;
        hasDivineShield: boolean;
        actionPoint: number;
    };
    paramDict: {
        maxHealth: number;
        attack: number;
        isTaunt: boolean;
        maxActionPoint: number;
        races: Readonly<RaceType[]>;
    }
    eventDict: {
        onDie: [CombatableModel] 
        onReceiveDamage: [CombatableModel, number]
        onDealDamage: [CombatableModel, number]
        onAttack: [CombatableModel, CombatableModel]
        onDestroy: [CombatableModel]
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

    readonly refer: CardRefer;

    constructor(props: Props<CombatableDef>) {
        let rule: CombatableRule | undefined = undefined;
        let target: Model | undefined = props.parent;
        while (target) {
            const tempRule = CombatableModel._ruleMap.get(target.constructor);
            if (tempRule) rule = Object.assign(rule || {}, tempRule);
            target = target.parent;
        }
        const {
            health, attack, isDivineShield, races,
            isRush, isCharge, isWindfury, isTaunt
        } = rule || {};
        super({
            ...props,
            stateDict: {
                curHealth: props.stateDict?.fixHealth || health || 1,
                isAlive: true,
                hasDivineShield: isDivineShield || false,
                actionPoint: (isRush || isCharge) ? 1 : 0,
                ...props.stateDict
            },
            paramDict: {
                maxHealth: health || props.stateDict?.fixAttack || 1,
                attack: attack || props.stateDict?.fixAttack || 1,
                maxActionPoint: isWindfury ? 2 : 1,
                isTaunt: isTaunt || false,
                races: races || []
            },
            childDict: {}
        });
        this.refer = new CardRefer(this);
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

    @Lifecycle.useLoader()
    private _handleActionPointReset() {
        const game = this.refer.game;
        if (!game) return;
        this.bindEvent(
            game.eventEmitterDict.onRoundStart,
            () => {
                this.baseStateDict.actionPoint = this.paramDict.maxActionPoint;
            }
        );
    }

    @Validator.useCondition(model => model.stateDict.isAlive)
    private _die() {
        this.baseStateDict.isAlive = false;
        this.eventDict.onDie(this);
    }

    @Validator.useCondition(model => model.stateDict.isAlive)
    @Validator.useCondition(model => model.stateDict.actionPoint > 0)
    attack(target: CombatableModel) {
        if (target) {
            this.baseStateDict.actionPoint -= 1;
            this._dealDamage(target);
            target._dealDamage(this);
            this.eventDict.onAttack(this, target);
        }
    }

    private _dealDamage(target: CombatableModel) {
        const damage = this.stateDict.attack;
        target.receiveDamage(damage, target);
        this.eventDict.onDealDamage(this, damage);
    }

    receiveDamage(damage: number, source: Model) {
        if (this.stateDict.hasDivineShield) {
            this.baseStateDict.hasDivineShield = false;
            return;
        }
        this.baseStateDict.curHealth -= damage;
        this.eventDict.onReceiveDamage(this, damage);
    }

    destroy() {
        this._die();
        this.eventDict.onDestroy(this);
    }
}
