import { Base } from "@/set-piece/types/base";
import { Random } from "@/set-piece/utils/random";

export class Factory {
    private static _timestamp = Date.now(); 
    private static _uuid = Random.number(
        36 ** 2, 
        36 ** 3 - 1
    );
    static get uuid(): string {
        let now = Date.now();
        const ticket = Factory._uuid;
        Factory._uuid += 1;
        if (Factory._uuid > 36 ** 3 - 1) {
            Factory._uuid = 36 ** 2;
            while (now === Factory._timestamp) {
                now = Date.now();
            }
        }
        this._timestamp = now;
        return now.toString(36) + ticket.toString(36);
    }

    private static _productDict: Record<string, Base.Class> = {};
    static get productDict() {
        return { ...Factory._productDict };
    }

    private static _productMap: Map<Base.Class, string> = new Map();
    static get productMap() {
        return new Map(Factory._productMap);
    }

    static useProduct<T extends string>(code: T) {
        return function (Type: Base.Class<{ code: T }>) {
            Factory._productDict[code] = Type;
            Factory._productMap.set(Type, code);
        };
    }

    private constructor() {}
}