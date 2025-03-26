import { Model } from "@/model/model";

export class StoreService {
    private static constructorRegistry: Map<string, any> = new Map();
    private static codeRegistry: Map<Function, string> = new Map();

    private constructor() {}
    
    static useProduct<I extends string>(code: I) {
        return function (constructor: new (...args: any[]) => { code: I }) {
            StoreService.constructorRegistry.set(code, constructor);
            StoreService.codeRegistry.set(constructor, code);
        };
    }

    static getProduct(code: string) {
        return StoreService.constructorRegistry.get(code);
    }

    private static ticket = Date.now() % (36 ** 2);
    private static timestamp = Date.now(); 

    private static uuidChecklist: Set<string> = new Set();
    static getTicket(uuid?: string) {
        let uuidChecked = uuid;
        if (!uuidChecked) uuidChecked = StoreService.uuid;
        if (StoreService.uuidChecklist.has(uuidChecked)) uuidChecked = StoreService.uuid;
        StoreService.uuidChecklist.add(uuidChecked);
        return uuidChecked;
    }

    private static get uuid(): string {
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