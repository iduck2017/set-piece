import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";

/**
 * @prompt
 * Chillwind Yeti: 4/4/5
 * Flavor: He always dreamed of coming down from the mountains and opening a noodle shop, but he never got the nerve.
 */

export type ChillwindYetiDef = MinionDef<
    CustomDef<{
        code: 'minion-chillwind-yeti'
    }>
>

@MinionModel.useRule({
    manaCost: 4,
    health: 5,
    attack: 4,
    races: []
})
@Factory.useProduct('minion-chillwind-yeti')
export class ChillwindYetiModel extends MinionModel<ChillwindYetiDef> {
    constructor(props: Props<ChillwindYetiDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Chillwind Yeti',
                desc: '',
                flavor: 'He always dreamed of coming down from the mountains and opening a noodle shop, but he never got the nerve.'
            },
            stateDict: {}
        });
    }
} 