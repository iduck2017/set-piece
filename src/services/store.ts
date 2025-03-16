import { Model } from "@/model/model";

export class StoreService {
    private static productConstructors: Map<string, any> = new Map();
    private static productCodes: Map<Function, string> = new Map();

    private constructor() {}
    
    static useProduct<T extends string>(code: T) {
        return function (constructor: new (...args: any[]) => Model) {
            StoreService.productConstructors.set(code, constructor);
            StoreService.productCodes.set(constructor, code);
        };
    }

    private static ticket = Date.now() % (36 ** 2);
    private static timestamp = Date.now(); 
    
    static get uuid(): string {
        let now = Date.now();
        const ticket = StoreService.ticket;
        StoreService.ticket += 1;
        if (StoreService.ticket > 36 ** 3 - 1) {
            StoreService.ticket = 36 ** 2;
            while (now === StoreService.timestamp) now = Date.now();
        }
        StoreService.timestamp = now;
        return now.toString(36) + ticket.toString(36);
    }
}