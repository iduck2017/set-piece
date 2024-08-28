import type { Model } from "../models";
import { ModelDef } from "../type/definition";
import { ModelTmpl } from "../type/template";

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
}