import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { FeatureAngryChickenModel } from "../features/feature-angry-chicken";

/**
 * @prompt
 * Angry Chicken 1/1/1 Enrage: +5 Attack.
 * use combatable.eventEmitterDict.onStateAlter to monitor health changes
 */

export type AngryChickenDef = MinionDef<
    Def.Create<{
        code: 'angry-chicken',
        childDict: {
            feature: FeatureAngryChickenModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 1,
    races: []
})
@Factory.useProduct('angry-chicken')
export class AngryChickenModel extends MinionModel<AngryChickenDef> {
    constructor(props: Props<AngryChickenDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Angry Chicken',
                desc: 'Enrage: +5 Attack.'
            },
            stateDict: {},
            childDict: {
                feature: { code: 'feature-angry-chicken' },
                ...superProps.childDict
            }
        });
    }
}
