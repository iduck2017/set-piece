import { CustomDef, FactoryService, Model, NodeModel, Props } from "@/set-piece";
import { RuleService } from "../services/rule";

export type CastableRule = {
    manaCost: number;
}

export type CastableDef = CustomDef<{
    code: 'castable';
    stateDict: {
        readonly fixManaCost?: number;
    },
    paramDict: {
        curManaCost: number;
    }
    eventDict: {},
    childDict: {}
}>

@FactoryService.useProduct('castable')
export class CastableModel extends NodeModel<CastableDef> {

    constructor(props: Props<CastableDef>) {
        let rule: CastableRule | undefined = undefined;
        let target: Model | undefined = props.parent;
        while (target) {
            const tempRule = RuleService.ruleInfo.get(target.constructor)?.castable;
            if (tempRule) rule = Object.assign(rule || {}, tempRule);
            target = target.parent;
        }
        const { manaCost } = rule || {};
        
        super({
            ...props,
            stateDict: {
                ...props.stateDict
            },
            paramDict: {
                curManaCost: props.stateDict?.fixManaCost ?? manaCost ?? 1
            },
            childDict: {}
        });
    }
}