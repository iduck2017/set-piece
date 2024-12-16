import { Def } from "@/type/define";
import { CardDef } from "./card";
import { Props } from "@/type/props";
import { MinionDef, MinionModel } from "./minion";
import { FeatureModel, FeatureDef } from "../feature";
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
    attack: 1,
    races: []
})
@Factory.useProduct('novice-engineer')
export class NoviceEngineerModel extends MinionModel<NoviceEngineerDef> {
    constructor(props: Props<NoviceEngineerDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                races: [],
                name: 'Novice Engineer',
                desc: 'Battlecry: Draw a card.'
            },
            childDict: {
                battlecry: { code: 'battlecry-novice-engineer' },
                ...superProps.childDict
            }
        });
    }

    debug() {
        super.debug();
        this.childDict.battlecry.debug();
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
            const card: MinionModel<Def.Pure> = this.card;
            this.bindEvent(
                card.eventEmitterDict.onBattlecry,
                () => {
                    this.card.player.childDict.deck.drawCard();
                }
            );
        }
    }

}