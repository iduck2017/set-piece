import { Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { ArgentProtectorModel } from "../minions/argent-protector";
import { TargetCollector } from "../card";
import { MinionModel } from "../minion";
import { validateTarget } from "@/hearthstone/utils/validator";

export type BattlecryArgentProtectorDef = FeatureDef<
    Def.Create<{
        code: 'battlecry-argent-protector',
        parent: ArgentProtectorModel
    }>
>

@Factory.useProduct('battlecry-argent-protector')
export class BattlecryArgentProtectorModel extends FeatureModel<BattlecryArgentProtectorDef> {
    constructor(props: Props<BattlecryArgentProtectorDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Argent Protector\'s Battlecry',
                desc: 'Give a friendly minion Divine Shield.'
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
                    TargetCollector<MinionModel> | undefined =
                    targetCollectorList.find(
                        item => item.uuid === this.uuid
                    );
                if (targetCollector?.result) {
                    targetCollector.result.childDict.combatable.getDevineShield();
                }
            }
        );
    }

    @Lifecycle.useLoader()
    private _handleTargetCheck() {
        const minion = this.refer.minion;
        if (!minion) return;

        this.bindEvent(
            minion.eventEmitterDict.onTargetCheck,
            (targetCollectorList: TargetCollector[]) => {
                const minionList = this.refer.queryMinionList({
                    excludeTarget: minion
                });
                if (minionList.length) {
                    targetCollectorList.push({
                        uuid: this.uuid,
                        hint: 'Choose a friendly minion',
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