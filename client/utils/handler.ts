import type { App } from "../app";
import { Base } from "../type";
import type { EventReflect } from "../type/event";
import { CurSor, CursorConfig } from "./cursor";
import type { Emitter } from "./emitter";

/** 接收器 */
export class Handler<
    E = any, 
    P = any
> extends CurSor<Emitter<E>, P> {
    public readonly handleEvent: EventReflect.ExecuteFunc<E>;
    
    constructor(
        execute: EventReflect.ExecuteFunc<E>,
        config: CursorConfig,
        parent: P,
        app: App
    ) {
        super(
            config.id || app.referService.getUniqId(),
            parent, 
            app
        );
        this.handleEvent = execute;
        config.cursorIdList?.forEach(id => {
            const emitter = app.referService.emitterReferManager.referDict[id];
            if (emitter) {
                emitter.bindHandler(this);
            }
        });
    }
}


export class HandlerProxy<D extends Base.Dict, P = any> {
    public readonly dict: EventReflect.HandlerDict<D>;

    constructor(
        intf: EventReflect.ExecuteIntf<D>,
        config: EventReflect.ChunkDict<D>,
        parent: P,
        app: App
    ) {
        this.dict = new Proxy(
            Object.keys(intf).reduce((result, key) => ({
                ...result,
                [key]: new Handler(
                    intf[key],
                    config[key] || {},
                    parent,
                    app
                )
            }), {}), 
            { set: () => false }
        ) as EventReflect.HandlerDict<D>;
    }

    public serialize() {
        return Object.keys(this.dict).reduce((dict, key) => ({
            ...dict,
            [key]: this.dict[key].serialize()   
        }), {});
    }
    
    public destroy() {
        Object.values(this.dict).forEach(item => item.destroy());
    }
}