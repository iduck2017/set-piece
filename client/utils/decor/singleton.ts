import { Base } from "../../type";

const _singletonDict = new Set<Base.Class>();

export function useSingleton<T extends Base.Class>(
    IConstructor: T
) {
    return class extends IConstructor {
        constructor(...config: any) {
            if (_singletonDict.has(IConstructor)) {
                throw new Error();
            }
            _singletonDict.add(IConstructor);
            super(...config);
        }
    };
}
