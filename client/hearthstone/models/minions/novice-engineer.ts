import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { BattlecryNoviceEngineerModel } from "../features/battlecry-novice-engineer";

/**
 * @prompt
 * Novice Engineer 1/1/1 Battlecry: Draw a card.
 */

export type NoviceEngineerDef = MinionDef<
    CustomDef<{
        code: 'novice-engineer',
        childDict: {
            battlecry: BattlecryNoviceEngineerModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 1,
    races: []
})
@Factory.useProduct('novice-engineer')
export class NoviceEngineerModel extends MinionModel<NoviceEngineerDef> {
    constructor(props: Props<NoviceEngineerDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Novice Engineer',
                desc: 'Battlecry: Draw a card.'
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'battlecry-novice-engineer' },
                ...superProps.childDict
            }
        });
    }
}