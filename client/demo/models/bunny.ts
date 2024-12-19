import { AnimalDef, AnimalModel } from "./animal";
import { Def, Props, Factory } from "@/set-piece";
import { ReproductiveModel } from "./reproductive";

type BunnyDef = AnimalDef<
    CustomDef<{
        code: 'bunny',
        stateDict: {
            age: number,
            readonly name: string,
        },
        childDict: {
            reproductive: ReproductiveModel<BunnyModel>
        },
        eventDict: {},
        childList: BunnyModel[]
    }>
>

@Factory.useProduct('bunny')
export class BunnyModel extends AnimalModel<BunnyDef> {
    constructor(props: Props<BunnyDef>) {
        const superProps = AnimalModel.animalProps(props);
        super({
            ...props,
            childDict: {
                ...superProps.childDict,
                reproductive: {
                    code: 'reproductive'
                },
                ...props.childDict
            },
            stateDict: {
                ...superProps.stateDict,
                name: 'bunny',
                age: 0,
                curAge: 0,
                curCalories: 0,
                ...props.stateDict
            },
            paramDict: {
                name: 'bunny',
                desc: 'bunny',
                maxAge: 10,
                maxCalories: 100
            }
        });
    }
}