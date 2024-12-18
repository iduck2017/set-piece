import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { RaceType } from "@/hearthstone/services/database";

/**
 * @prompt
 * Murloc Scout 1/1/1
 * This is a token minion
 */

export type MurlocScoutDef = MinionDef<
    Def.Create<{
        code: 'murloc-scout'
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 1,
    races: [ RaceType.Murloc ]
}, true)
@Factory.useProduct('murloc-scout')
export class MurlocScoutModel extends MinionModel<MurlocScoutDef> {
    constructor(props: Props<MurlocScoutDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Murloc Scout',
                desc: ''
            },
            stateDict: {}
        });
    }
} 