# Inherit 

Recommend using the following methods to implement inheritance


应当将所有被继承的类设置为抽象函数，并对外暴露受保护的静态方法 superProps，实现一部分参数初始化工作。

以下是一个示例，抽象类AnimalModel 继承自 NodeModel

For all inherited classes, set them as abstract properties and expose a protected static method 'superProps', which implements part of the parameter initialization work.

Here is an example, the abstract class AnimalModel inherits from NodeModel

```typescript

import { Props, Def, NodeModel } from "@/set-piece";
import { MetabolicModel } from "./metabolic";
import { ReproductiveModel } from "./reproductive";

export type AnimalDef<T extends Def> = CustomDef<{
    code: string;
    stateDict: {
        isAlive: boolean;
        age: number;
    },
    eventDict: {
        onDie: [Model],
    },
    childDict: {
        metabolic: MetabolicModel,
        reproductive: ReproductiveModel<AnimalModel>
    }
}> & T

export abstract class AnimalModel<
    T extends Def = Def
> extends NodeModel<AnimalDef<T>> {
    protected static superProps(
        props: Props<AnimalDef<Def.Pure>>
    ): StrictProps<AnimalDef<Def.Pure>> {
        return {
            ...props,
            stateDict: {
                isAlive: true,
                age: 0,
                ...props.stateDict
            },
            paramDict: {},
            childDict: {
                metabolic: { code: 'metabolic' },
                reproductive: { code: 'reporductive'}
            }
        };
    }
}
```
The abstract class AvesModel inherits from AnimalModel. Based on Animal, it additionally implements flying effects

```typescript


import { Props, Def, NodeModel } from "@/set-piece";
import { MetabolicModel } from "./metabolic";
import { ReproductiveModel } from "./reproductive";

export type AvesModel<T extends Def> = CustomDef<{
    code: string;
    stateDict: {
        isAlive: boolean;
    },
    eventDict: {},
    childDict: {
        metabolic: MetabolicModel,
        reproductive?: ReproductiveModel<AnimalModel>
    }
}> & T

export abstract class AvesModel<
    T extends Def = Def
> extends NodeModel<AnimalDef<T>> {
    protected static superProps(
        props: Props<AnimalDef<Def.Pure>>
    ): StrictProps<AnimalDef<Def.Pure>> {
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
```