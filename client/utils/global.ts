import { Model } from "../model";
import { Base } from "./base";

export abstract class Global {
    protected static _singletonSet = new Set<Function>();
    protected static _modelSingletonSet = new Set<Function>();

    static useSingleton<T extends Base.Class>(
        IConstructor: T
    ) {
        console.log('useSingleton', IConstructor.name);
        return class extends IConstructor {
            constructor(...config: any) {
                if (
                    Global._singletonSet.has(IConstructor) ||
                    Global._modelSingletonSet.has(IConstructor)
                ) {
                    throw new Error();
                }
                super(...config);
                if (this instanceof Model) {
                    Global._modelSingletonSet.add(IConstructor);
                } else {
                    Global._singletonSet.add(IConstructor);
                }
                console.log(
                    Global._modelSingletonSet, Global._singletonSet
                );
            }
        };
    }
}