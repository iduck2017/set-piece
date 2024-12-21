import { CustomDef, Def, FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { BattlecryElvenArcherModel } from "../battlecry/elven-archer";

/**
 * @prompt
 * Elven Archer 1/1/1
 * Card Text: Battlecry: Deal 1 damage.
 * Flavor Text: Don't bother asking her out on a date. She'll shoot you down.
 */

export type ElvenArcherDef = MinionDef<
    CustomDef<{
        code: 'minion-elven-archer',
        childDict: {
            battlecry: BattlecryElvenArcherModel
        }
    }>
>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: []
    },
    castable: {
        manaCost: 1
    }
})
@FactoryService.useProduct('minion-elven-archer')
export class ElvenArcherModel extends MinionModel<ElvenArcherDef> {
    constructor(props: Props<ElvenArcherDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Elven Archer',
                desc: 'Battlecry: Deal 1 damage.',
                flavor: 'Don\'t bother asking her out on a date. She\'ll shoot you down.'
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'battlecry-elven-archer' },
                ...superProps.childDict
            }
        });
    }
} 