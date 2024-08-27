import type { App } from "../app";
import type { Model } from "../models";
import { ModelDef } from "../type/definition";
import { ModelTmpl } from "../type/template";
import type { ModelReflect } from "../type/model";

export namespace Delegator {
    export function initOriginState<M extends ModelTmpl>(
        originState: M[ModelDef.State],
        target: Model<M>
    ) {
        return new Proxy(originState, {
            set: (origin, key: keyof M[ModelDef.State], value) => {
                origin[key] = value;
                target.updateState(key);
                return true;
            }
        });
    }

    export function initChildDict<M extends ModelTmpl>(
        childSequenceDict: ModelReflect.ChildChunkDict<M>,
        target: Model<M>,
        app: App
    ) {
        const origin = Object
            .keys(childSequenceDict)
            .reduce((result, key) => ({
                ...result,
                [key]: app.factoryService.unserialize(
                    childSequenceDict[key],
                    target
                )
            }), {});
        return new Proxy<M[ModelDef.ChildDict]>(origin, {
            set: (origin, key: keyof M[ModelDef.ChildDict], value) => {
                if (origin[key]) {
                    throw new Error();
                }
                origin[key] = value;
                return true;
            }
        });
    }
}