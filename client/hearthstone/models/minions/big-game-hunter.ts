import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { BattlecryBigGameHunterModel } from "../features/battlecry-big-game-hunter";

/**
 * @prompt
 * Big Game Hunter 3/4/2 Battlecry: Destroy a minion with 7 or more Attack.
 */

export type BigGameHunterDef = MinionDef<
    Def.Create<{
        code: 'big-game-hunter',
        childDict: {
            battlecry: BattlecryBigGameHunterModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 3,
    health: 2,
    attack: 4,
    races: []
})
@Factory.useProduct('big-game-hunter')
export class BigGameHunterModel extends MinionModel<BigGameHunterDef> {
    constructor(props: Props<BigGameHunterDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Big Game Hunter',
                desc: 'Battlecry: Destroy a minion with 7 or more Attack.'
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'battlecry-big-game-hunter' },
                ...superProps.childDict
            }
        });
    }
} 