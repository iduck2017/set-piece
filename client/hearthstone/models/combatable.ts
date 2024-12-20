import { 
    Base, 
    CustomDef, 
    Factory, 
    Lifecycle, 
    Model, 
    NodeModel, 
    Props, 
    Validator 
} from "@/set-piece";
import { RaceType } from "../services/database";
import { CardModel } from "./card";
import { MinionModel } from "./minion";
import { GameModel } from "./game";
import { BoardModel } from "./board";
import { PlayerModel } from "./player";
import { HandModel } from "./hand";
import { GraveyardModel } from "./graveyard";
import { DeckModel } from "./deck";
import { TargetCollector } from "../types/collector";

export type CombatableRule = {
    health: number;
    attack: number;
    races: Readonly<RaceType[]>;

    isRush?: boolean;
    isCharge?: boolean;
    isWindfury?: boolean;
    isTaunt?: boolean;
    isStealth?: boolean;
    isFrozen?: boolean;

    cantAttack?: boolean;
    hasDivineShield?: boolean;
}

export type CombatableDef = CustomDef<{
    code: 'combatable';
    stateDict: {
        readonly fixHealth?: number;
        readonly fixAttack?: number;

        healthWaste: number;
        actionPoint: number;

        isAlive: boolean;
        isStealth: boolean;
        isFrozen: boolean;
        
        hasDivineShield: boolean;
    };
    paramDict: {
        maxHealth: number;
        attack: number;
        isTaunt: boolean;
        maxActionPoint: number;
        cantAttack: boolean;
        races: Readonly<RaceType[]>;
    }
    eventDict: {
        onDie: [CombatableModel] 
        onReceiveDamage: [CombatableModel, number]
        onDealDamage: [CombatableModel, number]
        onAttack: [CombatableModel, CombatableModel]
        onDestroy: [CombatableModel]
        onDevineShieldBreak: [CombatableModel]
        onDevineShieldAccess: [CombatableModel]
    },
    parent: PlayerModel | MinionModel
}>

@Factory.useProduct('combatable')
export class CombatableModel extends NodeModel<CombatableDef> {

    private static readonly _ruleMap: Map<Function, CombatableRule> = new Map();
    static useRule(rule: CombatableRule) {
        return function(Type: Base.Class) {
            CombatableModel._ruleMap.set(Type, rule);
        };
    }

    public get stateDict() {
        const stateDict = super.stateDict;
        return {
            ...stateDict,
            curHealth: stateDict.maxHealth - stateDict.healthWaste
        };
    }

    private get _minion() {
        return this.queryParent<MinionModel>(
            undefined,
            false,
            (model) => model instanceof MinionModel
        );
    }

    private get _card() {
        return this.queryParent<CardModel>(
            undefined,
            false,
            (model) => model instanceof CardModel
        );
    }

    get referDict() {
        return {
            game: this.queryParent<GameModel>('game', true),
            player: this.queryParent<PlayerModel>('player', true),
            board: this.queryParent<BoardModel>('board', true),
            hand: this.queryParent<HandModel>('hand', true),
            deck: this.queryParent<DeckModel>('deck', true),
            graveyard: this.queryParent<GraveyardModel>('graveyard', true),
            minion: this._minion,
            card: this._card
        };
    }

    constructor(props: Props<CombatableDef>) {
        const rule = CombatableModel._ruleMap.get(props.parent.constructor);
        const {
            health, 
            attack, 
            hasDivineShield, 
            races,
            isRush, 
            isCharge, 
            isWindfury, 
            isTaunt, 
            isStealth, 
            cantAttack
        } = rule || {};
        super({
            ...props,
            stateDict: {
                healthWaste: 0,
                isAlive: true,
                hasDivineShield: hasDivineShield ?? false,
                actionPoint: (isRush || isCharge) ? 1 : 0,
                isStealth: isStealth ?? false,
                isFrozen: false,
                ...props.stateDict
            },
            paramDict: {
                maxHealth: health ?? props.stateDict?.fixAttack ?? 1,
                attack: attack ?? props.stateDict?.fixAttack ?? 1,
                maxActionPoint: isWindfury ? 2 : 1,
                isTaunt: isTaunt ?? false,
                races: races ?? [],
                cantAttack: cantAttack ?? false 
            },
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    @Validator.useCondition(model => Boolean(model.referDict.board))
    private _listenHealthAlter() {
        this.bindEvent(
            this.eventEmitterDict.onStateAlter,
            (target: CombatableModel, prevState) => {
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
    @Validator.useCondition(model => Boolean(model.referDict.game))
    private _listenRoundStart() {
        const game = this.referDict.game;
        if (!game) return;
        this.bindEvent(
            game.eventEmitterDict.onRoundStart,
            () => {
                this.baseStateDict.actionPoint = 
                    this.stateDict.maxActionPoint;
            }
        );
    }


    @Validator.useCondition(model => model.stateDict.isAlive)
    private _die() {
        this.baseStateDict.isAlive = false;
        this.eventDict.onDie(this);
    }

    @Validator.useCondition(model => Boolean(model.referDict.board))
    @Validator.useCondition(model => model.stateDict.isAlive)
    @Validator.useCondition(model => model.stateDict.actionPoint > 0)
    willAttack() {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryTargetList({
            excludeTarget: this.referDict.card,
            excludePosition: this.referDict.player
        });
        console.log('[candidate-list]', candidateList);
        if (!candidateList.length) return;
        const targetCollectorList: TargetCollector[] = [ {
            hint: 'Choose a target',
            uuid: Factory.uuid,
            candidateList
        } ];
        return {
            list: targetCollectorList,
            index: 0,
            runner: this.attack.bind(this)
        };
    }

    @Validator.useCondition(model => model.stateDict.isAlive)
    @Validator.useCondition(model => model.stateDict.actionPoint > 0)
    attack(collectorList: TargetCollector<MinionModel>[]) {
        const collector = collectorList[0];
        const result = collector?.result;
        const target = result?.childDict.combatable;
        if (!target) return;
        this.baseStateDict.actionPoint -= 1;
        this._dealDamage(target);
        target._dealDamage(this);
        this.eventDict.onAttack(this, target);
    }

    private _dealDamage(target: CombatableModel) {
        const damage = this.stateDict.attack;
        target.receiveDamage(damage, target);
        this.eventDict.onDealDamage(this, damage);
    }

    @Validator.useCondition(model => model.stateDict.isAlive)
    receiveDamage(damage: number, source: Model) {
        source;
        if (this.stateDict.hasDivineShield) {
            this.baseStateDict.hasDivineShield = false;
            this.eventDict.onDevineShieldBreak(this);
            return;
        }
        this.baseStateDict.healthWaste += damage;
        this.eventDict.onReceiveDamage(this, damage);
    }

    @Validator.useCondition(model => model.stateDict.isAlive)
    destroy() {
        this._die();
        this.eventDict.onDestroy(this);
    }
    
    @Validator.useCondition(model => model.stateDict.isAlive)
    getDevineShield() {
        if (!this.stateDict.hasDivineShield) {
            this.baseStateDict.hasDivineShield = true;
            this.eventDict.onDevineShieldAccess(this);
        }
    }
}
