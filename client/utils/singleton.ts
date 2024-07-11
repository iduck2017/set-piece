import { BaseClass } from "../types/base";

const $instances = new Set<BaseClass>();

export function singleton(IConstructor: BaseClass) {
    return class extends IConstructor {
        constructor(...config: any[]) {
            if ($instances.has(IConstructor)) {
                throw new Error();
            }
            $instances.add(IConstructor);
            super(...config);
        }
    } as any;
}
