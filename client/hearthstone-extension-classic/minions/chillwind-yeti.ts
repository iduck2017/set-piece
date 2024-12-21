import { CustomDef, Def, FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

/**
 * @prompt
 * Chillwind Yeti: 4/4/5
 * Flavor: He always dreamed of coming down from the mountains and opening a noodle shop, but he never got the nerve.
 */

export type ChillwindYetiDef = MinionDef<{
    code: 'chillwind-yeti-minion-card'
}>

@MinionModel.useRule({
    combative: {
        health: 5,
        attack: 4,
        races: []
    },
    castable: {
        manaCost: 4
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('chillwind-yeti-minion-card')
export class ChillwindYetiModel extends MinionModel<ChillwindYetiDef> {
    constructor(props: Props<ChillwindYetiDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Chillwind Yeti',
                desc: '',
                flavor: 'He always dreamed of coming down from the mountains and opening a noodle shop, but he never got the nerve.'
            },
            stateDict: {}
        });
    }
} 