import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { BattlecryColdlightSeerModel } from "../features/battlecry-coldlight-seer";
import { RaceType } from "@/hearthstone/services/database";

/**
 * @prompt
 * Coldlight Seer 3/2/3 Battlecry: Give your other Murlocs +2 Health.
 */

export type ColdlightSeerDef = MinionDef<
    CustomDef<{
        code: 'coldlight-seer',
        childDict: {
            battlecry: BattlecryColdlightSeerModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 3,
    health: 3,
    attack: 2,
    races: [ RaceType.Murloc ]
})
@Factory.useProduct('coldlight-seer')
export class ColdlightSeerModel extends MinionModel<ColdlightSeerDef> {
    constructor(props: Props<ColdlightSeerDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Coldlight Seer',
                desc: 'Battlecry: Give your other Murlocs +2 Health.'
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'battlecry-coldlight-seer' },
                ...superProps.childDict
            }
        });
    }
}
