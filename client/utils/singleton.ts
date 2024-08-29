import { IBase } from "../type";

const $ref = new Set<IBase.Class>();

export function singleton(IConstructor: IBase.Class) {
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
