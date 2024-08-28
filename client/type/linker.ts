import { Base } from ".";
import type { Emitter } from "../utils/emitter";
import type { Handler } from "../utils/handler";

/** 链接器相关类型 */
export namespace LinkerType {
    /** 链接器初始化参数 */
    export type Config = {
        id?: string
        list?: string[]
    }

    /** 链接器初始化参数集合 */
    export type ConfigDict<T extends Base.Dict> = {
        [K in keyof T]?: Config
    }

    /** 链接器序列化参数 */
    export type Chunk = Required<Config>

    export type ChunkDict<T extends Base.Dict> = {
        [K in keyof T]?: Chunk
    }

    /** 链接器触发接口 */
    export type EmitterFunc<E> = (event: E) => void;

    /** 链接器执行接口 */
    export type HandlerFunc<E> = (event: E) => void;

    /** 链接器触发接口集合 */
    export type EmitterIntf<D extends Base.Dict> = { 
        [K in keyof D]: EmitterFunc<D[K]> 
    }

    /** 链接器执行接口集合 */
    export type HandlerIntf<D extends Base.Dict> = { 
        [K in keyof D]: HandlerFunc<D[K]> 
    }

    /** 触发器集合 */
    export type EmitterDict<
        D extends Base.Dict, 
        P = any
    > = { 
        [K in keyof D]: Emitter<D[K], P> 
    }

    /** 链接器绑定接口 */
    export type BinderFunc<E> = (handler: Handler<E>) => void

    /** 链接器解绑接口 */
    export type UnbinderFunc<E> = (handler: Handler<E>) => void

    /** 链接器绑定接口集合 */
    export type BinderIntf<D extends Base.Dict> = { 
        [K in keyof D]: BinderFunc<D[K]> 
    }

    /** 链接器解绑接口集合 */
    export type UnbinderIntf<D extends Base.Dict> = { 
        [K in keyof D]: UnbinderFunc<D[K]> 
    }
    
    /** 接收器集合 */
    export type HandlerDict<
        D extends Base.Dict, 
        P = any
    > = { 
        [K in keyof D]: Handler<D[K], P> 
    }
}