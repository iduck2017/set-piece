import { CustomDef, FactoryService, LifecycleService, Props, ValidatorService } from "@/set-piece";
import { MinionModel } from "./minion";
import { FeatureDef, FeatureModel } from "./feature";

export type DivineShieldDef = FeatureDef<CustomDef<{
    code: 'divine-shield-feature',
    stateDict: {
        isActived: boolean;
    },
    eventDict: {
        onActive: [MinionModel];
        onBreak: [MinionModel];
    },
    parent: MinionModel
}>>

@FactoryService.useProduct('divine-shield-feature')
export class DivineShieldModel extends FeatureModel<DivineShieldDef> {
    constructor(props: Props<DivineShieldDef>) {
        super({
            ...props,
            stateDict: {
                isActived: false
            },
            paramDict: {
                name: 'Divine Shield',
                desc: ''
            },
            childDict: {}
        });
    }

    @ValidatorService.useCondition(model => model.stateDict.isActived)
    getDevineShield() {
        const minion = this.referDict.minion;
        if (!minion) return;
        if (!this.stateDict.isActived) {
            this.baseStateDict.isActived = true;
            this.eventDict.onActive(minion);
        }
    }

    @LifecycleService.useLoader()
    private _listenDamageReceive(options: { enable: boolean }) {
        const minion = this.referDict.minion;
        if (!minion) return;
        const combative = minion.childDict.combative;
    }
}
