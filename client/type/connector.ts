import { IBase } from ".";
import type { Emitter } from "../utils/emitter";
import type { Handler } from "../utils/handler";

/** 链接器相关类型 */
export namespace IConnector {
    /** 链接器序列化参数 */
    export type Chunk = Required<Config>
    export type ChunkDict<T extends IBase.Dict> = {
        [K in keyof T]?: Chunk
    }

    /** 链接器初始化参数 */
    export type Config = {
        id?: string
        idList?: string[]
    }
    export type ConfigDict<T extends IBase.Dict> = {
        [K in keyof T]?: Config
    }

    /** 链接器触发及接收函数 */
    export type Caller<E> = (event: E) => void;
    export type CallerDict<D extends IBase.Dict> = { 
        [K in keyof D]: (event: D[K]) => void;
    }

    /** 链接器绑定及解绑函数 */
    export type BinderDict<D extends IBase.Dict> = { 
        [K in keyof D]: (handler: Handler<D[K]>) => void
    }
    
    /** 事件触发器集合 */
    export type EmitterDict<
        D extends IBase.Dict, 
        P = any
    > = { 
        [K in keyof D]: Emitter<D[K], P> 
    }
    
    /** 事件接收器集合 */
    export type HandlerDict<
        D extends IBase.Dict, 
        P = any
    > = { 
        [K in keyof D]: Handler<D[K], P> 
    }

}