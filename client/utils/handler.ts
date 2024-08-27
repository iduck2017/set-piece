import type { App } from "../app";
import { Base } from "../type";
import type { EventReflect } from "../type/event";
import type { Emitter } from "./emitter";

export class Handler<E = any, P = any> {
    public readonly id: string;
    public readonly app: App;
    public readonly parent: P;
    public readonly execute: EventReflect.ExecuteFunc<E>;
    
    private readonly $emitterList: Array<Emitter<E>> = [];
    public get emitterList() { return [ ...this.$emitterList ]; }

    constructor(
        execute: EventReflect.ExecuteFunc<E>,
        config: string[],
        parent: P,
        app: App
    ) {
        this.execute = execute;
        const [ id, ...refer ] = config;
        this.id = id || app.referService.getUniqId();
        this.app = app;
        this.parent = parent;
        refer.forEach(key => {
            const emitter = app.referService.emitterReferManager.referDict[key];
            if (emitter) {
                emitter.bindHandler(this);
            }
        });
    }

    public $addEmitter(target: Emitter<E>) {
        if (this.$emitterList.includes(target)) {
            throw new Error();
        }
        this.$emitterList.push(target);
    }

    public $removeEmitter(target: Emitter<E>) {
        const index = this.$emitterList.indexOf(target);
        if (index === -1) {
            throw new Error();
        }
        this.$emitterList.splice(index, 1);
    }

    public destroy() { 
        this.$emitterList.forEach(item => item.unbindHandler(this)); 
    }
    
    public serialize() {
        return [
            this.id,
            ...this.$emitterList.map(item => item.id)
        ];
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
                    config[key] || [],
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