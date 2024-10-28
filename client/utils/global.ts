import { Base } from "./base";

export abstract class Global {
    static #singletonSet = new WeakSet<Function>();
    static useSingleton<T extends Base.Class>(
        IConstructor: T
    ) {
        return class extends IConstructor {
            constructor(...config: any) {
                if (Global.#singletonSet.has(IConstructor)) {
                    throw new Error();
                }
                Global.#singletonSet.add(IConstructor);
                super(...config);
            }
        };
    }
}