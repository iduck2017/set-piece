import { FactoryService, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "./feature";
import { RuleService } from "../services/rule";

export type TauntDef = FeatureDef<{
    code: 'taunt-feature'
    stateDict: {
        isActived: boolean
    }
}>

export type TauntRule = {
    isActived: boolean;
}

@FactoryService.useProduct('taunt-feature')
export class TauntModel extends FeatureModel<TauntDef> {
    constructor(props: Props<TauntDef>) {
        const rule = RuleService.ruleInfo.get(
            props.parent.constructor
        );
        const { isActived } = rule?.taunt || {};
        
        super({
            ...props,
            paramDict: {
                name: "Taunt",
                desc: "This minion must be attacked first."
            },
            stateDict: {
                isActived: isActived ?? false
            },
            childDict: {}
        });
    }
}
