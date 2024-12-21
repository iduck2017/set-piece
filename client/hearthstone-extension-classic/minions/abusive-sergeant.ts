/**
 * @propmt
 * Abusive Sergeant 1/2/1 Battlecry: Give a minion +2 Attack this turn
 * use GameModel event onRoundEnd 
 */
import { CardDef } from "@/hearthstone/models/card";
import { MinionModel } from "@/hearthstone/models/minion";
import { MinionDef } from "@/hearthstone/models/minion";
import { BattlecryAbusiveSergeantModel } from "../battlecry/abusive-sergeant";
import { CustomDef, Def, FactoryService, Props } from "@/set-piece";

export type AbusiveSergeantDef = MinionDef<
    CustomDef<{
        code: 'minion-abusive-sergeant',
        childDict: {
            battlecry: BattlecryAbusiveSergeantModel
        }
    }>
>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 2,
        races: []
    },
    castable: {
        manaCost: 1
    }
})
@FactoryService.useProduct('minion-abusive-sergeant')
export class AbusiveSergeantModel extends MinionModel<AbusiveSergeantDef> {
    constructor(props: Props<AbusiveSergeantDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                name: 'Abusive Sergeant',
                desc: 'Battlecry: Give a minion +2 Attack this turn.',
                flavor: 'ADD ME TO YOUR DECK, MAGGOT!'
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

