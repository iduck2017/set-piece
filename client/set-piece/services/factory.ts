import { Base } from "@/set-piece/types/base";
import { Random } from "@/set-piece/utils/random";

export class FactoryService {
    private static _timestamp = Date.now(); 
    private static _uuid = Random.number(
        36 ** 2, 
        36 ** 3 - 1
    );
    static get uuid(): string {
        let now = Date.now();
        const ticket = FactoryService._uuid;
        FactoryService._uuid += 1;
        if (FactoryService._uuid > 36 ** 3 - 1) {
            FactoryService._uuid = 36 ** 2;
            while (now === FactoryService._timestamp) {
                now = Date.now();
            }
        }
        this._timestamp = now;
        return now.toString(36) + ticket.toString(36);
    }

    private static _productDict: Record<string, Base.Class> = {};
    static get productDict() {
        return { ...FactoryService._productDict };
    }

    private static _productMap: Map<Base.Class, string> = new Map();
    static get productMap() {
        return new Map(FactoryService._productMap);
    }

    static useProduct<T extends string>(code: T) {
        return function (Type: Base.Class<{ code: T }>) {
            FactoryService._productDict[code] = Type;
            FactoryService._productMap.set(Type, code);
        };
    }

    private constructor() {}
}