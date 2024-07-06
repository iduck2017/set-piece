import { BaseConstructor } from "../types/base";

const _instances = new Set<BaseConstructor>();

export function singleton(IConstructor: BaseConstructor) {
    return class extends IConstructor {
        constructor(...config: any[]) {
            if (_instances.has(IConstructor)) {
                throw new Error();
            }
            _instances.add(IConstructor);
            super(...config);
        }
    } as any;
}
