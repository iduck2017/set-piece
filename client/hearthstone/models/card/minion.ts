import { CardDef, CardModel, TargetCollector } from "./card";
import { CastableModel, CastableRule } from "../castable";
import { CombatableModel, CombatableRule } from "../combatable";
import { BoardModel } from "../board";
import { DataBase, RaceType } from "@/hearthstone/services/database";
import { Base, Chunk, Def, Dict, Event, Lifecycle, Props } from "@/set-piece";

export type MinionRule = {
    readonly races: Readonly<RaceType[]>;
}

export type MinionDef = Def.Create<{
    code: string,
    paramDict: {
        readonly races: Readonly<RaceType[]>;
    },
    eventDict: {
        onBattlecry: [MinionModel, TargetCollector[]]
    },
    childDict: {
        castable: CastableModel,
        combatable: CombatableModel   
    }
}>

export abstract class MinionModel<
    T extends Def = Def
> extends CardModel<MinionDef & T> {
    private _minionEventDict: Readonly<Event.Dict<Def.EventDict<MinionDef>>> = this.eventDict;
    
    static isOnBoard(card: unknown) {
        return card instanceof MinionModel &&
            card.parent instanceof BoardModel;
    }

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

    static minionProps<T>(
        props: Props<T & MinionDef & CardDef>
    ) {
        const superProps = CardModel.cardProps(props);
        const childDict: Dict.Strict<Chunk.Dict<Def.ChildDict<MinionDef & CardDef>>> = {
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
        const board = this.parent.parent.childDict.board;
        super.play(targetCollectorList);
        if (board instanceof BoardModel) {
            const target = board.summonMinion(this.chunk);
            target?._minionEventDict.onBattlecry(target, targetCollectorList);
        }
    }

    @Lifecycle.useLoader()
    private _handleHealthAlter() {
        this.bindEvent(
            this.childDict.combatable.eventEmitterDict.onDie,
            () => {
                if (this.parent instanceof BoardModel) {
                    this.parent.disposeBody(this);
                }
            }
        );
    }
}
