import { BaseModel, Model } from "@/model";
import { Plugin } from "@/plugins";
import { Callback, Value } from "@/types";

export class FiberService {
    private static _isAtomic = false;
    private static _modelChanged: BaseModel[] = [];
    
    static useAtomic() {
        return function(
            target: BaseModel | Plugin,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: BaseModel | Plugin, ...args: any[]) {
                    if ()
                    FiberService._snapshots.set(this, snapshot);
                    if (FiberService._isAtomic) return handler.apply(this, args);
                    FiberService._isAtomic = true;
                    console.log('Atomic+ ============')
                    const result = handler.apply(this, args);
                    FiberService._dirtyModels.forEach(model => model._unloadChild());
                    Model._fibers.forEach(model => model._commitChild());
                    Model._fibers.forEach(model => model._loadChild());
                    Model._fibers.forEach(model => model._disposeChild());
                    Model._fibers.forEach(model => model._commitState());
                    Model._fibers.forEach(model => model._commit());
                    console.log('Fiberic- ============')
                    FiberService._snapshots.clear();
                    FiberService._isAtomic = false;
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }
    
}