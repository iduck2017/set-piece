import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";
import { Base } from "@/type/base";

export type CastableRule = {
    manaCost: number;
}

export type CastableDef = Def.Merge<{
    code: string;
    stateDict: {
        readonly fixManaCost?: number;
    },
    paramDict: {
        manaCost: number;
    }
    eventDict: {},
    childDict: {}
}>

export abstract class CastableModel<
    T extends Def = Def
> extends NodeModel<T & CastableDef> {
    private static readonly _ruleMap: Map<Function, CastableRule>; 
    static useRule(rule: CastableRule) {
        return function(Type: Base.Class) {
            CastableModel._ruleMap.set(Type, rule);
        };
    }

    static mergeProps(props: Props<CastableDef>): Props.Strict<CastableDef> {
        const castableRule = CastableModel._ruleMap.get(this.constructor);
        return {
            ...props,
            stateDict: {
                ...props.stateDict
            },
            paramDict: {
                manaCost: props.stateDict?.fixManaCost || castableRule?.manaCost || 1
            },
            childDict: {}
        };
    }
}