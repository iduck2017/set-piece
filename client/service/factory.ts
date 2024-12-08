import { Base } from "@/type/base";
import { Random } from "@/util/random";

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

    private static _products: Record<string, Base.Class> = {};
    static get products() {
        return { ...Factory._products };
    }

    static useProduct<T extends string>(code: T) {
        return function (Type: Base.Class<{ code: T }>) {
            console.log('UseProduct:', code);
            Factory._products[code] = Type;
        };
    }
}