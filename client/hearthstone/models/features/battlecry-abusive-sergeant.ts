import { CustomDef, Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { CardModel, TargetCollector } from "../card";
import { AbusiveSergeantModel } from "../minions/abusive-sergeant";
import { BuffAbusiveSergeantModel } from "../effects/buff-abusive-sergeant";
import { validateTarget } from "@/hearthstone/utils/validator";

export type BattlecryAbusiveSergeantDef = FeatureDef<
    CustomDef<{
        code: 'battlecry-abusive-sergeant',
        parent: AbusiveSergeantModel
    }>
>

@Factory.useProduct('battlecry-abusive-sergeant')
export class BattlecryAbusiveSergeantModel extends FeatureModel<BattlecryAbusiveSergeantDef> {
    constructor(props: Props<BattlecryAbusiveSergeantDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Abusive Sergeant\'s Battlecry',
                desc: 'Give a minion +2 Attack this turn.'
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
            (target, targetCollectorList) => {
                const targetCollector:
                    TargetCollector<CardModel> | undefined = 
                    targetCollectorList.find(
                        item => item.uuid === this.uuid
                    );
                if (targetCollector?.result) {
                    targetCollector.result.childDict.featureList.accessFeature<
                        BuffAbusiveSergeantModel
                    >({
                        code: 'buff-abusive-sergeant'
                    });
                }
            }
        );
    }

    @Lifecycle.useLoader()
    private _handleTargetCheck() {
        const card = this.refer.card;
        if (!card) return;
        this.bindEvent(
            card.eventEmitterDict.onTargetCheck,
            (targetCollectorList: TargetCollector[]) => {
                const minionList = this.refer.queryMinionList({});
                if (minionList.length) {
                    targetCollectorList.push({
                        uuid: this.uuid,
                        hint: 'Choose a minion.',
                        validator: (model) => validateTarget(
                            model,
                            { isMinionOnBoard: true }
                        )
                    });
                }
            }
        );
    }
}