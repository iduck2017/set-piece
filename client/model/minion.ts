import { Def } from "@/type/define";
import { Props } from "@/type/props";
import { CardDef, CardModel } from "./card";
import { CastableModel } from "./castable";
import { FeatureListModel } from "./feature";
import { CombatableModel } from "./combatable";
import { BoardModel } from "./board";

export type MinionDef = Def.Merge<{
    code: string,
    stateDict: {},
    paramDict: {},
    eventDict: {},
    childDict: {
        castable: CastableModel,
        featureList: FeatureListModel,
        combatable: CombatableModel   
    }
}>

export abstract class MinionModel<
    T extends Def = Def
> extends CardModel<MinionDef & T> {
    static mergeProps(
        props: Props<MinionDef & CardDef>
    ): Props.Strict<MinionDef & CardDef> {
        const superProps = CardModel.mergeProps(props);
        return {
            ...superProps,
            ...props,
            childDict: {
                ...superProps.childDict,
                castable: { code: 'castable' },
                combatable: { code: 'combatable' },
                ...props.childDict
            },
            stateDict: {}
        };
    }

    
    play() {
        const board = this.parent.parent.childDict.board;
        super.play();
        if (board instanceof BoardModel) {
            board.appendCard(this.chunk);
        }
    }
}
