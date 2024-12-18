import { Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { ColdlightSeerModel } from "../minions/coldlight-seer";
import { BuffColdlightSeerModel } from "../effects/buff-coldlight-seer";
import { RaceType } from "@/hearthstone/services/database";

export type BattlecryColdlightSeerDef = FeatureDef<
    Def.Create<{
        code: 'battlecry-coldlight-seer',
        parent: ColdlightSeerModel
    }>
>

@Factory.useProduct('battlecry-coldlight-seer')
export class BattlecryColdlightSeerModel extends FeatureModel<BattlecryColdlightSeerDef> {
    constructor(props: Props<BattlecryColdlightSeerDef>) {
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
        const minion = this.refer.minion;
        if (!minion) return;

        this.bindEvent(
            minion.eventEmitterDict.onBattlecry,
            () => {
                const minionList = this.refer.queryMinionList({
                    requiredRaces: [ RaceType.Murloc ],
                    excludeTarget: minion
                });
                minionList.forEach(target => {
                    target.childDict.featureList.accessFeature<
                        BuffColdlightSeerModel
                    >({
                        code: 'buff-coldlight-seer'
                    });
                });
            }
        );
    }
} 