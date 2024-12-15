import { Def } from "@/type/define";
import { NodeModel } from "../node";
import { Props } from "@/type/props";
import { MetabolicModel } from "./metabolic";
import { ReproductiveModel } from "./reproductive";
import { DemoModel } from ".";

export type AnimalDef = Def.Create<{
    code: string;
    stateDict: {
        isAlive: boolean;
    },
    eventDict: {},
    childDict: {
        metabolic: MetabolicModel,
        reproductive?: ReproductiveModel<AnimalModel>
    }
    parent: AnimalModel | DemoModel
}>

export abstract class AnimalModel<
    T extends Def = Def
> extends NodeModel<T & AnimalDef> {
    static superProps(props: Props<AnimalDef>): Props.Strict<AnimalDef> {
        return {
            ...props,
            stateDict: {
                isAlive: true,
                ...props.stateDict
            },
            paramDict: {},
            childDict: {
                metabolic: { code: 'metabolic' }
            }
        };
    }
}