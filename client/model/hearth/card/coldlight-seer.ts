import { Def } from "@/type/define";
import { CardDef } from ".";
import { Props } from "@/type/props";
import { MinionDef, MinionModel } from "./minion";
import { FeatureModel, FeatureDef } from "..";
import { Factory } from "@/service/factory";
import { RaceType } from "@/service/database";
import { Lifecycle } from "@/service/lifecycle";

/**
 * @prompt
 * Coldlight Seer 3/2/3 Battlecry: Give your other Murlocs +2 Health.
 */

export type ColdlightSeerDef = Def.Create<{
    code: 'coldlight-seer',
    childDict: {
        battlecry: BattlecryMurlocHealthModel
    }
}>


@MinionModel.useRule({
    manaCost: 3,
    health: 3,
    attack: 2,
    races: [ RaceType.Murloc ]
})
@Factory.useProduct('coldlight-seer')
export class ColdlightSeerModel extends MinionModel<ColdlightSeerDef> {
    constructor(props: Props<ColdlightSeerDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            stateDict: {},
            paramDict: {
                races: [ RaceType.Murloc ],
                name: 'Coldlight Seer',
                desc: 'Battlecry: Give your other Murlocs +2 Health.'
            },
            childDict: {
                battlecry: { code: 'battlecry-murloc-health' },
                ...superProps.childDict
            }
        });
    }
}

export type BattlecryMurlocHealthDef = Def.Create<{
    code: 'battlecry-murloc-health',
    parent: ColdlightSeerModel
}>

@Factory.useProduct('battlecry-murloc-health')
export class BattlecryMurlocHealthModel extends FeatureModel<BattlecryMurlocHealthDef> {
    constructor(props: Props<BattlecryMurlocHealthDef & FeatureDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Coldlight Seer\'s Battlecry',
                desc: 'Give your other Murlocs +2 Health.'
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
                    const murlocAllyList = card.player.childDict.board.childList
                        .filter((minion: MinionModel<Def.Pure>) => 
                            minion !== this.card && 
                            minion instanceof MinionModel &&
                            minion.stateDict.races?.includes(RaceType.Murloc));
                    murlocAllyList.forEach(target => {
                        if (target instanceof MinionModel) {
                            const card: MinionModel<Def.Pure> = target;
                            const combatable = card.childDict.combatable;
                            this.bindEvent(
                                combatable.eventEmitterDict.onParamCheck,
                                (target, param) => {
                                    param.maxHealth += 2;
                                }
                            );
                        }
                    });
                }
            );
        }
    }
} 