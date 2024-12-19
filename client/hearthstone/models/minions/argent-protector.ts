import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { BattlecryArgentProtectorModel } from "../features/battlecry-argent-protector";

/**
 * @prompt
 * Argent Protector 2/2/2 Battlecry: Give a friendly minion Divine Shield.
 */

export type ArgentProtectorDef = MinionDef<
    Def.Create<{
        code: 'argent-protector',
        childDict: {
            battlecry: BattlecryArgentProtectorModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 2,
    health: 2,
    attack: 2,
    races: []
})
@Factory.useProduct('argent-protector')
export class ArgentProtectorModel extends MinionModel<ArgentProtectorDef> {
    constructor(props: Props<ArgentProtectorDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Argent Protector',
                desc: 'Battlecry: Give a friendly minion Divine Shield.'
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'battlecry-argent-protector' },
                ...superProps.childDict
            }
        });
    }
} 