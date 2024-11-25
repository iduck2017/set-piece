import { Node, Chunk } from "@/model/node";
import { Base } from "@/type/base";

export class Factory {
    private static _timestamp = Date.now(); 
    private static _uuid = 36 ** 2;
    
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
        return ticket.toString(36) + now.toString(36);
    }

    private static _products: Record<string, Base.Class> = {};
    static get products() {
        return { ...Factory._products };
    }

    static useProduct<T extends string>(type: T) {
        return function (Type: new (
            chunk: Chunk<T>, 
            parent: Node
        ) => Node<T>) {
            Factory._products[type] = Type;
        };
    }
}