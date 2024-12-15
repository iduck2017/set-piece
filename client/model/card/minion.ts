import { Def } from "@/type/define";
import { Props } from "@/type/props";
import { CardDef, CardModel } from ".";
import { CastableModel, CastableRule } from "../castable";
import { FeatureListModel } from "../feature";
import { CombatableModel, CombatableRule } from "../feature/combatable";
import { BoardModel } from "../board";
import { Event } from "@/type/event";
import { NodeEvent, NodeModel } from "../node";
import { Model } from "@/type/model";
import { Base, Dict } from "@/type/base";
import { Lifecycle } from "@/service/lifecycle";
import { Chunk } from "@/type/chunk";
import { DataBase } from "@/service/database";

export type MinionDef = Def.Create<{
    code: string,
    stateDict: {},
    paramDict: {},
    eventDict: {
        onBattlecry: [MinionModel]
    },
    childDict: {
        castable: CastableModel,
        combatable: CombatableModel   
    }
}>

export abstract class MinionModel<
    T extends Def = Def
> extends CardModel<MinionDef & T> {
    private static readonly _ruleMap: Map<Function, CombatableRule & CastableRule> = new Map();
    static useRule(rule: CombatableRule & CastableRule) {
        return function(Type: Base.Class) {
            CombatableModel.useRule(rule)(Type);
            CastableModel.useRule(rule)(Type);
            DataBase.useCard(rule)(Type);
        };
    }

    private _minionEventDict: Readonly<Event.Dict<Def.EventDict<MinionDef>>> = this.eventDict

    static minionProps<T>(
        props: Props<T & MinionDef & CardDef>
    ) {
        const superProps = CardModel.cardProps(props);
        const childDict: Dict.Strict<Chunk.Dict<Def.ChildDict<MinionDef & CardDef>>> = {
            ...superProps.childDict,
            castable: { code: 'castable' },
            combatable: { code: 'combatable' },
            ...props.childDict,
        }
        return {
            ...superProps,
            childDict
        }
    }
 
    play() {
        const board = this.parent.parent.childDict.board;
        super.play();
        if (board instanceof BoardModel) {
            const target = board.appendCard(this.chunk);
            console.log(target);
            if (target instanceof MinionModel) {
                target.eventDict.onBattlecry(target);
            }
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
        )
    }
}
