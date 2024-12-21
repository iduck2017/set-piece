import { Base } from "@/set-piece";
import { CombativeRule } from "../models/combative";
import { CastableRule } from "../models/castable";

export type RuleDict = {
    combative: CombativeRule,
    castable: CastableRule,
    // divineShield: DivineShieldRule,
}

export class RuleService {
    private constructor() {}

    private static readonly _ruleInfo: Map<Function, Partial<RuleDict>> = new Map();
    static get ruleInfo() {
        return new Map(RuleService._ruleInfo);
    }
    
    static useRule(ruleDict: Partial<RuleDict>) {
        return function(Type: Base.Class) {
            const curRuleDict: Partial<RuleDict> = RuleService._ruleInfo.get(Type) || {};
            RuleService._ruleInfo.set(Type, {
                ...curRuleDict,
                ...ruleDict
            });
        };
    }
}