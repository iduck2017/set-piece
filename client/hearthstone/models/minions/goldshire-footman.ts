import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";

/**
 * @prompt
 * Goldshire Footman 1/1/2 Taunt
 * Taunt is a fixed property in CombatableModel
 */

export type GoldshireFootmanDef = MinionDef<
    Def.Create<{
        code: 'goldshire-footman'
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 2,
    attack: 1,
    races: [],
    isTaunt: true
})
@Factory.useProduct('goldshire-footman')
export class GoldshireFootmanModel extends MinionModel<GoldshireFootmanDef> {
    constructor(props: Props<GoldshireFootmanDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Goldshire Footman',
                desc: 'Taunt'
            },
            stateDict: {}
        });
    }
} 