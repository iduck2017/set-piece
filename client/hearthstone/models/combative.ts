import { 
    CustomDef, 
    FactoryService, 
    LifecycleService, 
    Model, 
    Props, 
    ValidatorService 
} from "@/set-piece";
import { RaceType } from "../services/database";
import { MinionModel } from "./minion";
import { PlayerModel } from "./player";
import { TargetCollector } from "../types/collector";
import { FeatureDef, FeatureModel } from "./feature";
import { RuleService } from "../services/rule";
import { Mutator } from "../../set-piece/utils/mutator";

export type CombativeRule = {
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
}


export type CombativeDef = FeatureDef<CustomDef<{
    code: 'combative-feature';
    stateDict: {
        readonly fixHealth?: number;
        readonly fixAttack?: number;
        healthWaste: number;
        actionPoint: number;
        isAlive: boolean;
        isStealth: boolean;
        isFrozen: boolean;
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
        onDie: [CombativeModel] 
        onDamageReceive: [CombativeModel, {
            source?: Model,
            damage: number
        }]
        onDamagePredict: [CombativeModel, Mutator<{ 
            isEnabled: boolean 
        }>]
        onDamageDeal: [CombativeModel, {
            damage: number,
            target?: Model
        }]
        onHealthRestore: [CombativeModel, {
            health: number,
            source?: Model
        }],
        onRestorePredict: [CombativeModel, Mutator<{ 
            isEnabled: boolean 
        }>]
        onAttack: [CombativeModel, CombativeModel]
        onDestroy: [CombativeModel]
    },
    parent: PlayerModel | MinionModel
}>>

@FactoryService.useProduct('combative-feature')
export class CombativeModel extends FeatureModel<CombativeDef> {

    public get stateDict() {
        const stateDict = super.stateDict;
        return {
            ...stateDict,
            curHealth: stateDict.maxHealth - stateDict.healthWaste
        };
    }

    constructor(props: Props<CombativeDef>) {
        const rule = RuleService.ruleInfo.get(
            props.parent.constructor
        )?.combative;
        const {
            health, 
            attack, 
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
                actionPoint: (isRush || isCharge) ? 1 : 0,
                isStealth: isStealth ?? false,
                isFrozen: false,
                ...props.stateDict
            },
            paramDict: {
                name: 'Combative',
                desc: '',
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


    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenHealthAlter() {
        this.bindEvent(
            this.eventEmitterDict.onStateAlter,
            (target: CombativeModel, prevState) => {
                console.log('[listen-health-alter]', { ...prevState }, { ...target.stateDict });

                if (
                    prevState.curHealth > 0 && 
                    target.stateDict.curHealth <= 0
                ) {
                    this._die();
                }
            }
        );
    }
    
    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.game))
    private _listenTurnStart() {
        const game = this.referDict.game;
        if (!game) return;
        this.bindEvent(
            game.eventEmitterDict.onTurnEnd,
            () => {
                this.baseStateDict.actionPoint = 
                    this.stateDict.maxActionPoint;
            }
        );
    }


    @ValidatorService.useCondition(model => model.stateDict.isAlive)
    private _die() {
        this.baseStateDict.isAlive = false;
        this.eventDict.onDie(this);
    }

    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    @ValidatorService.useCondition(model => model.stateDict.isAlive)
    @ValidatorService.useCondition(model => model.stateDict.actionPoint > 0)
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
            uuid: FactoryService.uuid,
            candidateList
        } ];
        return {
            list: targetCollectorList,
            index: 0,
            runner: this.attack.bind(this)
        };
    }

    @ValidatorService.useCondition(model => model.stateDict.isAlive)
    @ValidatorService.useCondition(model => model.stateDict.actionPoint > 0)
    attack(collectorList: TargetCollector<MinionModel>[]) {
        const collector = collectorList[0];
        const result = collector?.result;
        const target = result?.childDict.combative;
        if (!target) return;
        this.baseStateDict.actionPoint -= 1;
        this._dealDamage(target);
        target._dealDamage(this);
        this.eventDict.onAttack(this, target);
    }

    private _dealDamage(target: CombativeModel) {
        const damage = this.stateDict.attack;
        const source = target.parent;
        target.receiveDamage(damage, source);
        this.eventDict.onDamageDeal(this, {
            damage,
            target: this.parent
        });
    }

    @ValidatorService.useCondition(model => model.stateDict.isAlive)
    receiveDamage(damage: number, source?: Model) {
        const mutator = new Mutator({ isEnabled: true });
        this.eventDict.onDamagePredict(this, mutator);
        if (!mutator.data.isEnabled) return;
        this.baseStateDict.healthWaste += damage;
        this.eventDict.onDamageReceive(this, {
            damage,
            source
        });
    }

    @ValidatorService.useCondition(model => model.stateDict.isAlive)
    restoreHealth(health: number, source?: Model) {
        const mutator = new Mutator({ isEnabled: true });
        this.eventDict.onRestorePredict(this, mutator);
        if (!mutator.data.isEnabled) return;
        if (health < 0) return;
        this.baseStateDict.healthWaste -= Math.min(
            health,
            this.stateDict.healthWaste
        );
        this.eventDict.onHealthRestore(this, {
            health,
            source
        });
    }

    @ValidatorService.useCondition(model => model.stateDict.isAlive)
    destroy() {
        this._die();
        this.eventDict.onDestroy(this);
    }
    
}
