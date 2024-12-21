import { CustomDef, Def, FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { FeatureAngryChickenModel } from "../features/angry-chicken";
import { ClassNameType, ExpansionType, RaceType, RarityType } from "@/hearthstone/services/database";

/**
 * @prompt
 * Angry Chicken 1/1/1
 * Card Text: Enrage: +5 Attack.
 * Flavor Text: There is no beast more frightening (or ridiculous) than a fully enraged chicken.
 */

export type AngryChickenDef = MinionDef<
    CustomDef<{
        code: 'angry-chicken-minion-card',
        childDict: {
            feature: FeatureAngryChickenModel
        }
    }>
>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: [RaceType.Beast]
    },
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('angry-chicken-minion-card')
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
                feature: { code: 'angry-chicken-feature' },
                ...superProps.childDict
            }
        });
    }
} 