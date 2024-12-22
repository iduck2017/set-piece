import { Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

/**
 * @prompt
 * Goldshire Footman
 * Class: Neutral
 * Expansion: Classic Cards
 * Rarity: Free
 * Cost: 1
 * Attack: 1
 * Health: 2
 * Card Text: Taunt
 * Flavor Text: If 1/2 minions are all that is defending Goldshire, you would think it would have been overrun years ago.
 */

export type GoldshireFootmanDef = MinionDef<{
    code: 'goldshire-footman-minion-card',
}>

@MinionModel.useRule({
    combative: {
        health: 2,
        attack: 1,
        races: [],
    },
    taunt: {
        isActived: true
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
@FactoryService.useProduct('goldshire-footman-minion-card')
export class GoldshireFootmanModel extends MinionModel<GoldshireFootmanDef> {
    constructor(props: Props<GoldshireFootmanDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: "Goldshire Footman",
                desc: "Taunt",
                flavor: "If 1/2 minions are all that is defending Goldshire, you would think it would have been overrun years ago."
            },
            stateDict: {},
        });
    }
} 