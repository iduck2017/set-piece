import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";

/**
 * @prompt
 * Argent Squire 1/1/1 Divine Shield
 * Divine Shield is a fixed property in CombatableModel
 */

export type ArgentSquireDef = MinionDef<
    Def.Create<{
        code: 'argent-squire'
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 1,
    races: [],
    hasDivineShield: true
})
@Factory.useProduct('argent-squire')
export class ArgentSquireModel extends MinionModel<ArgentSquireDef> {
    constructor(props: Props<ArgentSquireDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Argent Squire',
                desc: 'Divine Shield'
            },
            stateDict: {
            }
        });
    }
} 