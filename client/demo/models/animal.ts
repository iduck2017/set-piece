import { Props, Def, NodeModel } from "@/set-piece";
import { MetabolicModel } from "./metabolic";
import { ReproductiveModel } from "./reproductive";
import { DemoModel } from "./demo";

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