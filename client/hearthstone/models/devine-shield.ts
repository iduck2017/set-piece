import { CustomDef, FactoryService, LifecycleService, Props, ValidatorService } from "@/set-piece";
import { MinionModel } from "./minion";
import { FeatureDef, FeatureModel } from "./feature";
import { RuleService } from "../services/rule";
import { AbortSignal } from "../../set-piece/utils/mutator";

export type DivineShieldRule = {
    isActived: boolean;
}

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
        const rule = RuleService.ruleInfo.get(
            props.parent.constructor
        )?.divineShield;
        const {
            isActived
        } = rule || {};
        super({
            ...props,
            stateDict: {
                isActived: isActived ?? false
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
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenDamageReceiveBefore() {
        const minion = this.referDict.minion;
        const combative = minion?.childDict.combative;
        if (!combative) return;
        this.bindEvent(
            combative.eventEmitterDict.onDamageReceiveBefore,
            (target, mutator) => {
                if (!mutator.data.isEnabled) return;
                if (!this.stateDict.isActived) return;
                mutator.data.isEnabled = false;
                mutator.data.isEnabled = AbortSignal;
                this.baseStateDict.isActived = false;
                this.eventDict.onBreak(minion);
            }
        );
    }
}
