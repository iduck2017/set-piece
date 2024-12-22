import { FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, RarityType, ExpansionType, RaceType } from "@/hearthstone/services/database";

/**
 * Card: Murloc Raider
 * Cost: 1
 * Attack: 2
 * Health: 1
 * Race: Murloc
 * Flavor: Mrrraggglhlhghghlgh, mrgaaag blarrghlgaahahl mrgggg glhalhah a bghhll graggmgmg Garrosh mglhlhlh mrghlhlhl!!
 */

export type MurlocRaiderDef = MinionDef<{
    code: 'murloc-raider-minion-card',
}>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 2,
        races: [RaceType.Murloc]
    },
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Free,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('murloc-raider-minion-card')
export class MurlocRaiderModel extends MinionModel<MurlocRaiderDef> {
    constructor(props: Props<MurlocRaiderDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Murloc Raider',
                desc: '',
                flavor: 'Mrrraggglhlhghghlgh, mrgaaag blarrghlgaahahl mrgggg glhalhah a bghhll graggmgmg Garrosh mglhlhlh mrghlhlhl!!'
            },
            stateDict: {},
            childDict: {
                ...superProps.childDict
            }
        });
    }
} 