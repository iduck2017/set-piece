import { CardDef, CardModel, TargetCollector } from "./card";
import { CastableModel, CastableRule } from "./castable";
import { CombatableModel, CombatableRule } from "./combatable";
import { DataBase, RaceType } from "@/hearthstone/services/database";
import { Base, Chunk, CustomDef, Def, Dict, Event, Lifecycle, Props, PureDef } from "@/set-piece";

export type MinionRule = {
    readonly races: Readonly<RaceType[]>;
}

export type MinionDef<
    T extends Def = Def
> = CardDef<
    CustomDef<{
        code: string,
        paramDict: {
        },
        eventDict: {
            onBattlecry: [MinionModel, TargetCollector[]]
        },
        childDict: {
            combatable: CombatableModel   
        }
    }>
> & T

export abstract class MinionModel<
    T extends MinionDef = MinionDef
> extends CardModel<T> {
    private _minionEventDict: Readonly<Event.Dict<
        Def.EventDict<MinionDef<PureDef>>
    >> = this.eventDict;
    
    static useRule(
        rule: CombatableRule & CastableRule & MinionRule,
        isDerived?: boolean
    ) {
        return function(Type: Base.Class) {
            CombatableModel.useRule(rule)(Type);
            CastableModel.useRule(rule)(Type);
            if (!isDerived) {
                DataBase.useCard(rule)(Type);
            }
        };
    }

    static minionProps<T extends MinionDef>(
        props: Props<T>
    ) {
        const superProps = CardModel.cardProps(props);
        const childDict: Dict.Strict<Chunk.Dict<
            Def.ChildDict<MinionDef<PureDef>>
        >> = {
            ...superProps.childDict,
            castable: { code: 'castable' },
            combatable: { code: 'combatable' },
            ...props.childDict
        };
        return {
            ...superProps,
            childDict
        };
    }
    
    play(targetCollectorList: TargetCollector[]) {
        super.play(targetCollectorList);
        const target = this.refer.playerBoard?.summonMinion(this.chunk);
        target?._minionEventDict.onBattlecry(target, targetCollectorList);
    }

    @Lifecycle.useLoader()
    private _handleHealthAlter() {
        this.bindEvent(
            this.childDict.combatable.eventEmitterDict.onDie,
            () => {
                this.refer.playerBoard?.disposeMinion(this);
            }
        );
    }
}
