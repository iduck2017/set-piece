import type { App } from "../../app";
import type { Model } from "../../models/base";
import { BaseFunction } from "../../types/base";
import { AppStatus, ModelStatus } from "../../types/status";
import { Exception } from "../exceptions";

function appStatus(...status: AppStatus[]) {
    return function (
        _target: unknown,
        _key: string,
        descriptor: TypedPropertyDescriptor<BaseFunction>
    ): TypedPropertyDescriptor<BaseFunction> {
        const original = descriptor.value;
        descriptor.value = function (
            this: { app: App },
            ...args
        ) {
            if (!status.includes(this.app.status)) {
                throw new Exception();
            }
            return original?.apply(this, args);
        };
        return descriptor;
    };
}

function modelStatus(...status: ModelStatus[]) {
    return function (
        _target: unknown,
        _key: string,
        descriptor: TypedPropertyDescriptor<BaseFunction>
    ): TypedPropertyDescriptor<BaseFunction> {
        const original = descriptor.value;
        descriptor.value = function(
            this: Model, 
            ...args
        ) {
            if (!status.includes(this.status)) {
                throw new Exception();
            }
            return original?.apply(this, args);
        };
        return descriptor;
    };
}

export {
    modelStatus,
    appStatus
};