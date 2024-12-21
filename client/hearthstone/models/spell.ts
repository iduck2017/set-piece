import { 
    Base,
    Def,
    CustomDef,
    Event,
    Props,
    PureDef,
    LifecycleService,
    ValidatorService
} from "@/set-piece";
import { CardDef, CardModel, CardRule, CardType } from "./card";
import { CastableRule } from "./castable";
import { TargetCollector } from "../types/collector";
import { DataBaseService } from "../services/database";
import { RuleService } from "../services/rule";

export type SpellDef<
    T extends Def = Def
> = CardDef<
    CustomDef<{
        code: `${string}-spell-card`,
        paramDict: {
        },
        eventDict: {
            onCast: [SpellModel, TargetCollector[]]
        },
    }>
> & T

export abstract class SpellModel<
    T extends SpellDef = SpellDef
> extends CardModel<T> {
    private _spellEventDict: Readonly<Event.Dict<
        Def.EventDict<SpellDef<PureDef>>
    >> = this.eventDict;
    private _spellEventEmitterDict: Readonly<Event.EmitterDict<
        Def.EventDict<SpellDef<PureDef>>
    >> = this.eventEmitterDict;

    static useRule(
        rule: {
            castable: CastableRule,
            card: Omit<CardRule, 'type'>
        },
        isDerived?: boolean
    ) {
        return function(Type: Base.Class) {
            RuleService.useRule(rule)(Type);
            if (isDerived) return;
            DataBaseService.useCard({
                ...rule,
                card: {
                    ...rule.card,
                    type: CardType.Spell
                }
            })(Type);
        };
    }

    static spellProps<T extends SpellDef>(
        props: Props<T>
    ) {
        const superProps = CardModel.cardProps(props);
        return superProps;
    }

    play(targetCollectorList: TargetCollector[]) {
        super.play(targetCollectorList);
        this.cast(targetCollectorList);
        this._spellEventDict.onCast(this, targetCollectorList);
    }

    protected abstract handleCollectorCheck(
        targetCollectorList: TargetCollector[]
    ): void;
    
    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.hand))
    private _listenCollectorCheck() {
        this.bindEvent(
            this._spellEventEmitterDict.onCollectorCheck,
            this.handleCollectorCheck
        );
    }

    protected abstract cast(
        targetCollectorList: TargetCollector[]
    ): void;
}
