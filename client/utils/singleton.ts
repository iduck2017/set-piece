import { BaseClass } from "../types/base";

const $ref = new Set<BaseClass>();

export function singleton(IConstructor: BaseClass) {
    return class extends IConstructor {
        constructor(...config: any[]) {
            if ($ref.has(IConstructor)) {
                throw new Error();
            }
            $ref.add(IConstructor);
            super(...config);
        }
    } as any;
}
