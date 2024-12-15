import { Def } from "@/type/define";
import { CardDef } from ".";
import { Props } from "@/type/props";
import { MinionDef, MinionModel } from "./minion";
import { Factory } from "@/service/factory";

/**
 * @prompt
 * Chillwind Yeti 4/5 no other effects
 */

export type ChillwindYetiDef = Def.Create<{
    code: 'chillwind-yeti'
}>


@MinionModel.useRule({
    manaCost: 4,
    health: 5,
    attack: 4,
    races: []
})
@Factory.useProduct('chillwind-yeti')
export class ChillwindYetiModel extends MinionModel<ChillwindYetiDef> {
    constructor(props: Props<ChillwindYetiDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                races: [],
                name: 'Chillwind Yeti',
                desc: ''
            }
        });
    }
}
