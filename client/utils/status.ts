import type { App } from "../app";
import { BaseFunction } from "../types/base";
import { BaseModel } from "../types/model";
import { AppStatus, ModelStatus } from "../types/status";

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
                throw new Error();
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
            this: BaseModel, 
            ...args
        ) {
            if (!status.includes(this.status)) {
                console.log(status, this.status);
                throw new Error();
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