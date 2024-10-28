import { App } from "../app";
import { Base } from "../utils/base";

export class Service {
    static #singletonSet = new WeakSet<Function>();
    protected static useSingleton<T extends Base.Class>(
        IConstructor: T
    ) {
        return class extends IConstructor {
            constructor(...config: any) {
                if (Service.#singletonSet.has(IConstructor)) {
                    throw new Error();
                }
                Service.#singletonSet.add(IConstructor);
                super(...config);
            }
        };
    }

    readonly app: App;
    constructor(app: App) {
        this.app = app;
    }
}