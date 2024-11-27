import { IModel } from "@/model";
import { Base } from "@/type/base";
import { Chunk } from "@/type/model";

export class Factory {
    private static _timestamp = Date.now(); 
    private static _refer = 36 ** 2;
    static get refer(): string {
        let now = Date.now();
        const ticket = Factory._refer;
        Factory._refer += 1;
        if (Factory._refer > 36 ** 3 - 1) {
            Factory._refer = 36 ** 2;
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
            parent: IModel
        ) => IModel<T>) {
            Factory._products[type] = Type;
        };
    }
}