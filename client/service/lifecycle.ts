import { NodeModel } from "@/model/node";
import { Base } from "@/type/base";

export class Lifecycle {
    private static readonly _loaders: Map<Function, string[]> = new Map();
    private static readonly _unloaders: Map<Function, string[]> = new Map();

    static getLoaders(target: NodeModel) {
        const result = [];
        let constructor: any = target.constructor;
        while (constructor.__proto__ !== null) {
            const keys = Lifecycle._loaders.get(constructor) || [];
            for (const key of keys) {
                result.push(Reflect.get(target, key));
            }
            constructor = constructor.__proto__;
        }
        return result;
    }
    static useLoader() {
        return function(
            target: NodeModel,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const keys = Lifecycle._loaders.get(target.constructor) || [];
            keys.push(key);
            Lifecycle._loaders.set(target.constructor, keys);
            return descriptor;
        };
    }

    static getUnloaders(target: NodeModel) {
        const result = [];
        let constructor: any = target.constructor;
        while (constructor.__proto__ !== null) {
            const keys = Lifecycle._unloaders.get(constructor) || [];
            for (const key of keys) {
                result.push(Reflect.get(target, key));
            }
            constructor = constructor.__proto__;
        }
        return result;
    }
    static useUnloader() {
        return function(
            target: NodeModel,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const keys = Lifecycle._unloaders.get(target.constructor) || [];
            keys.push(key);
            Lifecycle._unloaders.set(target.constructor, keys);
            return descriptor;
        };
    }
}