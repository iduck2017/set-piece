import { Base } from "@/type/base";
import { Model } from "@/type/model";

export class Lifecycle {
    private static readonly _loaderInfo: Map<Function, string[]> = new Map();
    private static readonly _unloaderInfo: Map<Function, string[]> = new Map();

    static getLoaderList(target: Model) {
        const result = [];
        let constructor: any = target.constructor;
        while (constructor.__proto__ !== null) {
            const keys = Lifecycle._loaderInfo.get(constructor) || [];
            for (const key of keys) {
                result.push(Reflect.get(target, key));
            }
            constructor = constructor.__proto__;
        }
        return result;
    }
    static useLoader() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const keys = Lifecycle._loaderInfo.get(target.constructor) || [];
            keys.push(key);
            Lifecycle._loaderInfo.set(target.constructor, keys);
            return descriptor;
        };
    }

    static getUnloaderList(target: Model) {
        const result = [];
        let constructor: any = target.constructor;
        while (constructor.__proto__ !== null) {
            const keys = Lifecycle._unloaderInfo.get(constructor) || [];
            for (const key of keys) {
                result.push(Reflect.get(target, key));
            }
            constructor = constructor.__proto__;
        }
        return result;
    }
    static useUnloader() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const keys = Lifecycle._unloaderInfo.get(target.constructor) || [];
            keys.push(key);
            Lifecycle._unloaderInfo.set(target.constructor, keys);
            return descriptor;
        };
    }

    private constructor() {}
}