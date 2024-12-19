import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { BattlecryElvenArcherModel } from "../features/battlecry-elven-archer";

/**
 * @prompt
 * Elven Archer 1/1/1 Battlecry: Deal 1 damage.
 */

export type ElvenArcherDef = MinionDef<
    CustomDef<{
        code: 'elven-archer',
        childDict: {
            battlecry: BattlecryElvenArcherModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 1,
    races: []
})
@Factory.useProduct('elven-archer')
export class ElvenArcherModel extends MinionModel<ElvenArcherDef> {
    constructor(props: Props<ElvenArcherDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Elven Archer',
                desc: 'Battlecry: Deal 1 damage.'
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'battlecry-elven-archer' },
                ...superProps.childDict
            }
        });
    }
} 