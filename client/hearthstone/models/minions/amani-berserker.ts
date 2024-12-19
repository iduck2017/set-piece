import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { FeatureAmaniBerserkerModel } from "../features/feature-amani-berserker";

/**
 * @prompt
 * Amani Berserker 2/2/3 Enrage: +3 Attack.
 * use combatable.eventEmitterDict.onStateAlter to monitor health changes
 */

export type AmaniBerserkerDef = MinionDef<
    CustomDef<{
        code: 'amani-berserker',
        childDict: {
            feature: FeatureAmaniBerserkerModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 2,
    health: 3,
    attack: 2,
    races: []
})
@Factory.useProduct('amani-berserker')
export class AmaniBerserkerModel extends MinionModel<AmaniBerserkerDef> {
    constructor(props: Props<AmaniBerserkerDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Amani Berserker',
                desc: 'Enrage: +3 Attack.'
            },
            stateDict: {},
            childDict: {
                feature: { code: 'feature-amani-berserker' },
                ...superProps.childDict
            }
        });
    }
} 