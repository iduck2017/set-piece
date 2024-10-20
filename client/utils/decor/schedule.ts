import { Model } from "../../model";
import { Base } from "../../type";

export function useSchedule() {
    return function (
        _target: unknown,
        _key: string,
        descriptor: TypedPropertyDescriptor<Base.Function>
    ): TypedPropertyDescriptor<Base.Function> {
        const original = descriptor.value;
        descriptor.value = function(
            this: Model, 
            ...args
        ) {
            this.app.root?.childDict.timer.intf.updateTime(1);
            return original?.apply(this, args);
        };
        return descriptor;
    };
}