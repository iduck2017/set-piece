import { TargetCollector } from "../types/collector";
import { CardDef, CardModel, CardRule, CardType } from "./card";
import { CastableRule } from "./castable";
import { CombativeModel, CombativeRule } from "./combative";
import { DataBaseService } from "@/hearthstone/services/database";
import { 
    Base, 
    Chunk, 
    Def, 
    Dict, 
    Event, 
    LifecycleService, 
    Props, 
    PureDef, 
    ValidatorService
} from "@/set-piece";
import { DivineShieldModel, DivineShieldRule } from "./devine-shield";
import { RuleService } from "../services/rule";
import { TauntModel, TauntRule } from "./taunt";
import { ChargeModel, ChargeRule } from "./charge";

export type MinionDef<
    T extends Partial<Def> = Def
> = CardDef<{
    code: `${string}-minion-card`,
    eventDict: {
        onBattlecry: [MinionModel, TargetCollector[]]
    },
    childDict: {
        combative: CombativeModel   
        divineShield: DivineShieldModel
        taunt: TauntModel,
        charge: ChargeModel
    },
} & T>

export abstract class MinionModel<
    T extends MinionDef = MinionDef
> extends CardModel<T> {
    private _minionEventDict: Readonly<Event.Dict<
        Def.EventDict<MinionDef<PureDef>>
    >> = this.eventDict;
    
    static useRule(
        rule: {
            taunt?: TauntRule,
            charge?: ChargeRule,
            combative: CombativeRule,
            castable: CastableRule,
            divineShield?: DivineShieldRule,
            card: Omit<CardRule, 'type'>
        }
    ) {
        return function(Type: Base.Class) {
            RuleService.useRule(rule)(Type);
            if (rule.card.isDerived) return;
            DataBaseService.useCard({
                ...rule,
                card: {
                    ...rule.card,
                    type: CardType.Minion
                }
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
            taunt: { code: 'taunt-feature' },
            charge: { code: 'charge-feature' },
            castable: { code: 'castable' },
            combative: { code: 'combative-feature' },
            divineShield: { code: 'divine-shield-feature' },
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

    @ValidatorService.useCondition(model => Boolean(model.referDict.deck))
    recruit() {
        const player = this.referDict.player;
        const deck = player?.childDict.deck;
        deck?.recruitMinion(this);
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenHealthAlter() {
        this.bindEvent(
            this.childDict.combative.eventEmitterDict.onDie,
            () => {
                const player = this.referDict.player;
                const board = player?.childDict.board;
                if (!board) return;
                board?.disposeMinion(this);
            }
        );
    }
}
