import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { RaceType } from "@/hearthstone/services/database";

/**
 * @prompt
 * Bluegill Warrior 2/2/1 Charge
 * isCharge is a fixed property in CombatableModel
 */
export type BluegillWarriorDef = MinionDef<
    Def.Create<{
        code: 'bluegill-warrior'
    }>
>

@MinionModel.useRule({
    manaCost: 2,
    health: 1,
    attack: 2,
    races: [ RaceType.Murloc ],
    isCharge: true
})
@Factory.useProduct('bluegill-warrior')
export class BluegillWarriorModel extends MinionModel<BluegillWarriorDef> {
    constructor(props: Props<BluegillWarriorDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Bluegill Warrior',
                desc: 'Charge'
            },
            stateDict: {}
        });
    }
} 