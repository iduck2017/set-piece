import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";

/**
 * @prompt
 * Chillwind Yeti 4/4/5
 */
export type ChillwindYetiDef = MinionDef<
    Def.Create<{
        code: 'chillwind-yeti',
    }>
>

@MinionModel.useRule({
    manaCost: 4,
    health: 5,
    attack: 4,
    races: []
})
@Factory.useProduct('chillwind-yeti')
export class ChillwindYetiModel extends MinionModel<ChillwindYetiDef> {
    constructor(props: Props<ChillwindYetiDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Chillwind Yeti',
                desc: ''
            },
            stateDict: {}
        });
    }
}
