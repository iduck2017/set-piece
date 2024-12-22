import { CustomDef, 
    FactoryService, 
    LifecycleService, Props, PureDef, ValidatorService } from "@/set-piece";
import { MinionDef, MinionModel } from "./minion";
import { FeatureDef, FeatureModel } from "./feature";
import { RuleService } from "../services/rule";

export type ChargeRule = {
    isActived: boolean;
}

export type ChargeDef = FeatureDef<CustomDef<{
    code: 'charge-feature',
    stateDict: {
        isActived: boolean;
    },
    eventDict: {
        onChargeActive: [ChargeModel];
    },
    parent: MinionModel<MinionDef<PureDef>>
}>>

@FactoryService.useProduct('charge-feature')
export class ChargeModel extends FeatureModel<ChargeDef> {
    constructor(props: Props<ChargeDef>) {
        const rule = RuleService.ruleInfo.get(
            props.parent.constructor
        );
        const { isActived } = rule?.charge || {};

        super({
            ...props,
            stateDict: {
                isActived: isActived ?? false
            },
            paramDict: {
                name: 'Charge',
                desc: 'Can attack immediately'
            },
            childDict: {}
        });
    }

    @ValidatorService.useCondition(model => !model.stateDict.isActived)
    activeCharge() {
        const minion = this.referDict.minion;
        if (!minion) return;
        if (!this.stateDict.isActived) {
            this.baseStateDict.isActived = true;
            this.eventDict.onChargeActive(this);
        }
    }

    @LifecycleService.useLoader()
    private _listenSummon() {
        const minion = this.referDict.minion;
        const combative = minion?.childDict.combative;
        if (!combative) return;
        combative.getAction();
    }
}
