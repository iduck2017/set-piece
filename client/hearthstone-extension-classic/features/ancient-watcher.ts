import { CustomDef, FactoryService, LifecycleService, Props, ValidatorService } from "@/set-piece";
import { MinionModel } from "../../hearthstone/models/minion";
import { FeatureDef, FeatureModel } from "../../hearthstone/models/feature";

export type AncientWatcherDef = FeatureDef<CustomDef<{
    code: 'ancient-watcher-feature',
    stateDict: {
        isActive: boolean;
    },
    eventDict: {
        onActive: [AncientWatcherModel];
    },
    parent: MinionModel
}>>

@FactoryService.useProduct('ancient-watcher-feature')
export class AncientWatcherModel extends FeatureModel<AncientWatcherDef> {
    constructor(props: Props<AncientWatcherDef>) {
        super({
            ...props,
            stateDict: {
                isActive: false
            },
            paramDict: {
                name: 'Ancient Watcher',
                desc: 'Cannot attack'
            },
            childDict: {}
        });
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenCombativeCheck() {
        const minion = this.referDict.minion;
        const combative = minion?.childDict.combative;
        if (!combative) return;
        this.bindEvent(
            combative.eventEmitterDict.onStateCheck,
            (combative, mutator) => {
                mutator.data.isAttackable = false;
                mutator.lock.isAttackable = true;
            }
        )
    }
}
