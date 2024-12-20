import { TargetCollector } from "../types/collector";
import { CardDef, CardModel, CardType } from "./card";
import { CastableModel, CastableRule } from "./castable";
import { CombatableModel, CombatableRule } from "./combatable";
import { DataBase } from "@/hearthstone/services/database";
import { 
    Base, 
    Chunk, 
    CustomDef, 
    Def, 
    Dict, 
    Event, 
    Lifecycle, 
    Props, 
    PureDef, 
    Validator
} from "@/set-piece";

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
        },
    }>
> & T

export abstract class MinionModel<
    T extends MinionDef = MinionDef
> extends CardModel<T> {
    private _minionEventDict: Readonly<Event.Dict<
        Def.EventDict<MinionDef<PureDef>>
    >> = this.eventDict;
    
    static useRule(
        rule: CombatableRule & CastableRule,
        isDerived?: boolean
    ) {
        return function(Type: Base.Class) {
            CombatableModel.useRule(rule)(Type);
            CastableModel.useRule(rule)(Type);
            if (isDerived) return;
            DataBase.useCard({
                ...rule,
                type: CardType.Minion
            })(Type);
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
        const player = this.referDict.player;
        const board = player?.childDict.board;
        if (!board) return;
        const target = board.summonMinion(this.chunk);
        if (!target) return;
        target._minionEventDict.onBattlecry(target, targetCollectorList);
    }

    @Validator.useCondition(model => Boolean(model.referDict.deck))
    recruit() {
        const player = this.referDict.player;
        const deck = player?.childDict.deck;
        deck?.recruitMinion(this);
    }

    @Lifecycle.useLoader()
    @Validator.useCondition(model => Boolean(model.referDict.board))
    private _handleHealthAlter() {
        this.bindEvent(
            this.childDict.combatable.eventEmitterDict.onDie,
            () => {
                const player = this.referDict.player;
                const board = player?.childDict.board;
                if (!board) return;
                board?.disposeMinion(this);
            }
        );
    }
}
