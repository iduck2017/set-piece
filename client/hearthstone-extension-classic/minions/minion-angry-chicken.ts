import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { FeatureAngryChickenModel } from "../features/feature-angry-chicken";
import { RaceType } from "@/hearthstone/services/database";

/**
 * @prompt
 * Angry Chicken 1/1/1
 * Card Text: Enrage: +5 Attack.
 * Flavor Text: There is no beast more frightening (or ridiculous) than a fully enraged chicken.
 */

export type AngryChickenDef = MinionDef<
    CustomDef<{
        code: 'minion-angry-chicken',
        childDict: {
            feature: FeatureAngryChickenModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 1,
    races: [RaceType.Beast]
})
@Factory.useProduct('minion-angry-chicken')
export class AngryChickenModel extends MinionModel<AngryChickenDef> {
    constructor(props: Props<AngryChickenDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Angry Chicken',
                desc: 'Enrage: +5 Attack.',
                flavor: 'There is no beast more frightening (or ridiculous) than a fully enraged chicken.'
            },
            stateDict: {},
            childDict: {
                feature: { code: 'feature-angry-chicken' },
                ...superProps.childDict
            }
        });
    }
} 