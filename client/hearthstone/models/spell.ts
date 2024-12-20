import { Base, CustomDef, Def, Event, Lifecycle, Props, PureDef, Validator } from "@/set-piece";
import { CardDef, CardModel, CardType } from "./card";
import { CastableModel, CastableRule } from "./castable";
import { TargetCollector } from "../types/collector";
import { DataBase } from "../services/database";

export type SpellDef<
    T extends Def = Def
> = CardDef<
    CustomDef<{
        code: string,
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
        rule: CastableRule,
        isDerived?: boolean
    ) {
        return function(Type: Base.Class) {
            CastableModel.useRule(rule)(Type);
            if (isDerived) return;
            DataBase.useCard({
                ...rule,
                type: CardType.Spell
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
    
    @Lifecycle.useLoader()
    @Validator.useCondition(model => Boolean(model.referDict.hand))
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
