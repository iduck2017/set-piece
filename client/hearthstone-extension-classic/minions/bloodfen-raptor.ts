import { Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, ExpansionType, RarityType, RaceType } from "@/hearthstone/services/database";

/**
 * Card: Bloodfen Raptor
 * Cost: 2
 * Attack: 3
 * Health: 2
 * Race: Beast
 * Flavor: "Kill 30 raptors." - Hemet Nesingwary
 */

export type BloodfenRaptorDef = MinionDef<{
    code: 'bloodfen-raptor-minion-card',
}>

@MinionModel.useRule({
    combative: {
        health: 2,
        attack: 3,
        races: [RaceType.Beast]
    },
    castable: {
        manaCost: 2
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Free,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('bloodfen-raptor-minion-card')
export class BloodfenRaptorModel extends MinionModel<BloodfenRaptorDef> {
    constructor(props: Props<BloodfenRaptorDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Bloodfen Raptor',
                desc: '',
                flavor: '"Kill 30 raptors." - Hemet Nesingwary'
            },
            stateDict: {},
            childDict: {
                ...superProps.childDict
            }
        });
    }
} 