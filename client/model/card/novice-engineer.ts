import { Def } from "@/type/define";
import { CardDef, CardModel } from ".";
import { Props } from "@/type/props";
import { MinionDef, MinionModel } from "./minion";
import { FeatureListModel, FeatureModel } from "../feature";
import { FeatureDef } from "../feature";
import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";

export type NoviceEngineerDef = Def.Create<{
    code: 'novice-engineer',
    childDict: {
        battlecry: BattlecryNoviceEngineerModel
    }
}>

@MinionModel.useRule({
    manaCost: 2,
    health: 1,
    attack: 1
})
@Factory.useProduct('novice-engineer')
export class NoviceEngineerModel extends MinionModel<NoviceEngineerDef> {
    constructor(props: Props<NoviceEngineerDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                name: 'Novice Engineer',
                desc: 'Battlecry: Draw a card.'
            },
            childDict: {
                battlecry: { code: 'battlecry-novice-engineer' },
                ...superProps.childDict,
            }
        });
    }
}

export type BattlecryNoviceEngineerDef = Def.Create<{
    code: 'battlecry-novice-engineer',
    parent: NoviceEngineerModel
}>

@Factory.useProduct('battlecry-novice-engineer')
export class BattlecryNoviceEngineerModel extends FeatureModel<BattlecryNoviceEngineerDef> {
    constructor(props: Props<BattlecryNoviceEngineerDef & FeatureDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Novice Engineer\'s Battlecry',
                desc: 'Draw a card.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleBattlecry() {
        if (this.card instanceof MinionModel) {
            this.bindEvent(
                this.card.eventEmitterDict.onBattlecry,
                () => {
                    this.card.player.childDict.deck.drawCard()
                }
            )
        }
    }
}