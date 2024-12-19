import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { BattlecryFlameImpModel } from "../features/battlecry-flame-imp";
import { RaceType } from "@/hearthstone/services/database";

/**
 * @prompt
 * Flame Imp 1/3/2 Battlecry: Deal 3 damage to your hero.
 */

export type FlameImpDef = MinionDef<
    CustomDef<{
        code: 'flame-imp',
        childDict: {
            battlecry: BattlecryFlameImpModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 2,
    attack: 3,
    races: [ RaceType.Demon ]
})
@Factory.useProduct('flame-imp')
export class FlameImpModel extends MinionModel<FlameImpDef> {
    constructor(props: Props<FlameImpDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Flame Imp',
                desc: 'Battlecry: Deal 3 damage to your hero.'
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'battlecry-flame-imp' },
                ...superProps.childDict
            }
        });
    }
} 