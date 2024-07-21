import type { App } from "../app";
import { BaseFunc } from "../types/base";
import { AppStatus } from "../types/status";

export namespace Lifecycle {
    export function app(...status: AppStatus[]) {
        return function (
            target: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<BaseFunc>
        ): TypedPropertyDescriptor<BaseFunc> {
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
}


