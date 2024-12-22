import { Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, ExpansionType, RarityType, RaceType } from "@/hearthstone/services/database";

/**
 * Card: Stonetusk Boar
 * Cost: 1
 * Attack: 1
 * Health: 1
 * Race: Beast
 * Text: Charge
 * Flavor: This card is boaring.
 */

export type StonetuskBoarDef = MinionDef<{
    code: 'stonetusk-boar-minion-card',
}>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: [RaceType.Beast]
    },
    charge: {
        isActived: true
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
@FactoryService.useProduct('stonetusk-boar-minion-card')
export class StonetuskBoarModel extends MinionModel<StonetuskBoarDef> {
    constructor(props: Props<StonetuskBoarDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Stonetusk Boar',
                desc: 'Charge',
                flavor: 'This card is boaring.'
            },
            stateDict: {},
            childDict: {
                ...superProps.childDict
            }
        });
    }
} 