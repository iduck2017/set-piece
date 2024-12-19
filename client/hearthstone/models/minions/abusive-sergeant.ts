import { CardDef } from "../card";
import { BattlecryAbusiveSergeantModel } from "../features/battlecry-abusive-sergeant";
import { MinionModel, MinionDef } from "../minion";

/**
 * @propmt
 * Abusive Sergeant 1/2/1 Battlecry: Give a minion +2 Attack this turn
 * use GameModel event onRoundEnd 
 */
import { CustomDef, Def, Factory, Props } from "@/set-piece";

export type AbusiveSergeantDef = MinionDef<
    CustomDef<{
        code: 'abusive-sergeant',
        childDict: {
            battlecry: BattlecryAbusiveSergeantModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 2,
    races: []
})
@Factory.useProduct('abusive-sergeant')
export class AbusiveSergeantModel extends MinionModel<AbusiveSergeantDef> {
    constructor(props: Props<AbusiveSergeantDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                name: 'Abusive Sergeant',
                desc: 'Battlecry: Give a minion +2 Attack this turn.'
            },
            childDict: {
                battlecry: { code: 'battlecry-abusive-sergeant' },
                ...superProps.childDict
            }
        });
    }

    debug() {
        super.debug();
        this.childDict.battlecry.debug();
    }
}

