import { Props, Def, NodeModel, ValidatorService, CustomDef } from "@/set-piece";

export type AnimalDef<
    T extends Partial<Def> = Def
> = CustomDef<{
    code: `${string}-animal`;
    stateDict: {
        isAlive: boolean;
        curAge: number;
        curCalories: number;
    },
    paramDict: {
        name: string;
        desc: string;
        maxAge: number;
        maxCalories: number;
    }
    eventDict: {
        onBorn: [AnimalModel];
        onDie: [AnimalModel];
    },
} & T>

export abstract class AnimalModel<
    T extends AnimalDef = AnimalDef
> extends NodeModel<T> {
    static animalProps<T extends AnimalDef>(
        props: Props<T>
    ) {
        return {
            ...props,
            stateDict: {
                isAlive: true,
                curAge: 0,
                curCalories: 0,
                ...props.stateDict
            },
            childDict: {}
        };
    }

    @ValidatorService.useCondition(model => model.stateDict.isAlive)
    diagest() {
        this.baseStateDict.curCalories -= 1;
    }

    @ValidatorService.useCondition(model => model.stateDict.isAlive)
    growup() {
        this.baseStateDict.curAge += 1;
        if (this.stateDict.curAge >= this.stateDict.maxAge) {
            this.baseStateDict.isAlive = false;
        }
    }
}

export type AvesDef<
    T extends Partial<Def> = Def
> = AnimalDef<{
    code: `${string}-aves-animal`;
    stateDict: {
        isFlying: boolean;
    }
    eventDict: {
        onFly: [AvesModel];
        onLand: [AvesModel];
    }
} & T>

export abstract class AvesModel<
    T extends AvesDef = AvesDef
> extends AnimalModel<T> {
    static avesProps<T extends AvesDef>(
        props: Props<T>
    ) {
        const superProps = AnimalModel.animalProps(props);
        return {
            ...superProps,
            stateDict: {
                isFlying: true,
                ...superProps.stateDict
            }
        };
    }

    @ValidatorService.useCondition(model => model.stateDict.isAlive)
    fly() {
        this.baseStateDict.isFlying = true;
    }
}

export type PenguinDef = AvesDef<{
    code: 'penguin-aves-animal';
    stateDict: {
        isSwimming: boolean;
    },
    eventDict: {
        onSwim: [PenguinModel];
    }
}>;

export class PenguinModel extends AvesModel<PenguinDef> {
    constructor(props: Props<PenguinDef>) {
        const superProps = AvesModel.avesProps(props);
        super({
            ...superProps,
            stateDict: {
                isSwimming: false,
                ...superProps.stateDict
            },
            childDict: {
                ...superProps.childDict
            },
            paramDict: {
                name: 'penguin',
                desc: 'penguin',
                maxAge: 10,
                maxCalories: 100
            }
        });
        this.queryParent<AnimalModel>('animal');
        this.queryParent<AvesModel>('aves-啊');
    }
}
