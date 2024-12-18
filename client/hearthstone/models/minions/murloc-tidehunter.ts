import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { RaceType } from "@/hearthstone/services/database";
import { BattlecryMurlocTidehunterModel } from "../features/battlecry-murloc-tidehunter";

/**
 * @prompt
 * Murloc Tidehunter 2/2/1 Battlecry: Summon a 1/1 Murloc Scout.
 */

export type MurlocTidehunterDef = MinionDef<
    Def.Create<{
        code: 'murloc-tidehunter',
        childDict: {
            battlecry: BattlecryMurlocTidehunterModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 2,
    health: 1,
    attack: 2,
    races: [ RaceType.Murloc ]
})
@Factory.useProduct('murloc-tidehunter')
export class MurlocTidehunterModel extends MinionModel<MurlocTidehunterDef> {
    constructor(props: Props<MurlocTidehunterDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Murloc Tidehunter',
                desc: 'Battlecry: Summon a 1/1 Murloc Scout.'
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'battlecry-murloc-tidehunter' },
                ...superProps.childDict
            }
        });
    }
}
