import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { FeatureAcolyteOfPainModel } from "../features/feature-acolyte-of-pain";

/**
 * @prompt
 * Acolyte of Pain: 3/1/3 Whenever this minion takes damage, draw a card.
 */

export type AcolyteOfPainDef = MinionDef<
    CustomDef<{
        code: 'acolyte-of-pain',
        childDict: {
            feature: FeatureAcolyteOfPainModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 3,
    health: 3,
    attack: 1,
    races: []
})
@Factory.useProduct('acolyte-of-pain')
export class AcolyteOfPainModel extends MinionModel<AcolyteOfPainDef> {
    constructor(props: Props<AcolyteOfPainDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Acolyte of Pain',
                desc: 'Whenever this minion takes damage, draw a card.'
            },
            stateDict: {},
            childDict: {
                feature: { code: 'feature-acolyte-of-pain' },
                ...superProps.childDict
            }
        });
    }
} 