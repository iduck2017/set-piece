import { Model } from "@/model";
import { Class } from "@/type/base";
import { Chunk, ChunkOf } from "@/type/model";
import { Logger } from "./logger";
import { Mutable } from "utility-types";

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

    private static _products: Record<string, Class> = {};
    static get products() {
        return { ...Factory._products };
    }

    static useProduct<T extends string>(type: T) {
        return function (Type: new (
            chunk: Chunk<T>, 
            parent: Model
        ) => Model<T>) {
            console.log('UseProduct:', type);
            Factory._products[type] = Type;
        };
    }
}