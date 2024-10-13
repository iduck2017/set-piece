import { Base } from "../configs";

const _singletonDict = new Set<Base.Class>();

export function singleton(IConstructor: Base.Class) {
    return class extends IConstructor {
        constructor(...config: any) {
            if (_singletonDict.has(IConstructor)) {
                throw new Error();
            }
            _singletonDict.add(IConstructor);
            super(...config);
        }
    } as any;
}
