import type { App } from "../app";
import type { Model } from "../models";
import { Base } from "../type";
import { Emitter } from "./emitter";
import { Handler } from "./handler";
import { Updater } from "./updater";
import { ModelDef } from "../type/definition";
import { ModelTmpl } from "../type/template";
import { EventReflect } from "../type/event";
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

    // export function initEmitterDict<D extends Base.Dict, P>(
    //     configDict: { [K in keyof D]?: string[] },
    //     parent: P,
    //     app: App
    // ) {
    //     const dict = {} as EventReflect.EmitterDict<D>;
    //     const origin = Object
    //         .keys(configDict)
    //         .reduce((result, key) => ({
    //             ...result,
    //             [key]: new Emitter<Base.Func, P>(
    //                 configDict[key] || [],
    //                 parent,
    //                 app
    //             )
    //         }), dict);
    //     return new Proxy(origin, {
    //         set: () => false,
    //         get: (target, key: keyof D) => {
    //             if (!target[key]) {
    //                 target[key] = new Emitter<any, P>([], parent, app);
    //             }
    //             return target[key];
    //         }
    //     });
    // }

    export function initBindIntf<D extends Base.Dict>(
        dict: EventReflect.EmitterDict<D>
    ) {
        return new Proxy({} as EventReflect.BindIntf<D>, {
            get: (target, key) => {
                return dict[key].bindHandler.bind(dict[key]);
            },
            set: () => false
        }); 
    }

    export function initUnbindIntf<D extends Base.Dict>(
        dict: EventReflect.EmitterDict<D>
    ) {
        return new Proxy({} as EventReflect.BindIntf<D>, {
            get: (target, key: keyof D) => {
                return dict[key].unbindHandler.bind(dict[key]);
            },
            set: () => false
        }); 
    }

    export function initUpdaterDict<M extends ModelTmpl>(
        configDict: { [K in keyof M[ModelDef.State]]?: string[] },
        parent: Model<M>,
        app: App
    ) {
        const dict = {} as ModelReflect.UpdaterDict<M>;
        const origin = Object
            .keys(configDict)
            .reduce((result, key) => ({
                ...result,
                [key]: new Updater(
                    key,
                    configDict[key] || [],
                    parent,
                    app
                )
            }), dict);
        return new Proxy(origin, {
            set: () => false,
            get: (target, key: keyof M[ModelDef.State]) => {
                if (!target[key]) { 
                    target[key] = new Updater(key, [], parent, app); 
                }
                return target[key];
            }
        });
    }

    export function initHandlerDict<E extends Base.Dict, P>(
        handleExecuteIntf: EventReflect.ExecuteIntf<E>,
        configDict: { [K in keyof E]?: string[] },
        parent: P,
        app: App
    ) {
        const dict = {} as { [K in keyof E]: Handler<E[K], P> };
        const origin = Object
            .keys(handleExecuteIntf)
            .reduce((result, key) => ({
                ...result,
                [key]: new Handler(
                    handleExecuteIntf[key],
                    configDict[key] || [],
                    parent,
                    app
                )
            }), dict);
        return new Proxy(origin, {
            set: () => false
        });
    }
}