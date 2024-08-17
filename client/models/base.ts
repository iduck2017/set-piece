import { 
    IdOf, 
    RuleOf,
    StatOf,
    InfoOf,
    ListOf,
    DictOf,
    ParentOf,
    RecvOf,
    EmitOf,
    BaseDef 
} from "../types/definition";
import type { App } from "../app";
import { Calculable } from "../utils/calculable";
import { Emittable } from "../utils/emittable";
import { Receivable } from "../utils/receivable";
import { Inheritable } from "../utils/inheritable";
import {
    EmitMap, 
    ConnSeqMap, 
    RecvMap 
} from "../types/map";
import { BaseIntf } from "../types/base";
import { BaseModel } from "../types/model";
import type { 
    DictSeq,
    SaveSeq, 
    BaseSeq 
} from "../types/sequence";

/** 模型层 */
export abstract class Model<M extends BaseDef> {
    public readonly id: IdOf<M>;
    public readonly app: App;
    public readonly key: string;
    
    protected readonly $calc: Calculable<RuleOf<M>, InfoOf<M>, StatOf<M>>;
    protected readonly $node: Inheritable<ListOf<M>, DictOf<M>, ParentOf<M>, BaseModel>;
    protected readonly $emit: EmitMap<EmitOf<M>>;
    protected readonly $recv: RecvMap<RecvOf<M>>;

    public readonly debug: BaseIntf;
    
    public get data() { return this.$calc.cur; } 
    public get list() { return this.$node.list; } 
    public get dict() { return this.$node.dict; }
    public get children() { return this.$node.children; }

    /** 节点创建 */
    public constructor(
        intf: RecvOf<M>,
        conf: BaseSeq<M>,
        parent: ParentOf<M>,
        app: App
    ) {
        this.app = app;
        this.id = conf.id;
        this.key = conf.key || app.ref.get();

        /** 初始化接收器 */
        this.$recv = Object.keys(intf)
            .reduce((prev, key) => ({
                ...prev,
                [key]: new Receivable(
                    intf[key],
                    conf.recv?.[key] || [],
                    this, 
                    app
                )
            }), {} as RecvMap<RecvOf<M>>);
     
        /** 初始化发射器*/
        this.$emit = new Proxy(
            Object.keys(conf.emit || {})
                .reduce((prev, key) => ({
                    ...prev,
                    [key]: new Emittable(
                        conf.emit?.[key] || [],
                        this,
                        app
                    )
                }), {} as EmitMap<EmitOf<M>>),
            {
                get: (target, key: keyof EmitOf<M>) => {
                    if (!target[key]) { 
                        target[key] = new Emittable([], this, app); 
                    }
                    return target[key];
                },
                set: () => false
            }
        ); 

        /** 初始化节点树 */
        this.$node = new Inheritable({
            /** 反序列化子节点 */
            list: conf.list.map(item => {
                return app.fact.unseq(
                    item, 
                    this as any
                );
            }),
            dict: Object.keys(conf.dict)
                .reduce((prev, key) => ({
                    ...prev,
                    [key]: app.fact.unseq(
                        conf.dict[key],
                            this as any
                    )
                }), {} as DictOf<M>),
            parent
        }, this, app);

        /** 初始化数据层 */
        this.$calc = new Calculable(conf, this, app);
        this.debug = {};
    }

    /** 节点销毁 */
    public destroy() {
        for (const child of this.$node.children) child.destroy();
        for (const key in this.$emit) this.$emit[key].distroy();
        for (const key in this.$recv) this.$recv[key].distroy();
        this.app.ref.dict.del(this);
        this.$node.parent?.$node.del(this);
    }

    /** 节点序列化 */
    public seq(): SaveSeq<M> {
        const result: SaveSeq<M> = {
            id: this.id,
            key: this.key,
            stat: this.$calc.stat,
            rule: this.$calc.rule,
            /** 子节点序列化 */
            list: this.$node.list.map(item => item.seq() as any),
            dict: Object
                .keys(this.$node.dict)
                .reduce(
                    (prev, key) => ({
                        ...prev,
                        [key]: this.$node.dict[key].seq() as any
                    }), 
                    {} as DictSeq<DictOf<M>>
                ),
            emit: Object
                .keys(this.$emit)
                .reduce(
                    (prev, key) => ({
                        ...prev,
                        [key]: this.$emit[key].seq()
                    }), 
                    {} as ConnSeqMap<EmitOf<M>>
                ),
            recv: Object
                .keys(this.$recv)
                .reduce(
                    (prev, key) => ({
                        ...prev,
                        [key]: this.$recv[key].seq()
                    }), 
                    {} as ConnSeqMap<RecvOf<M>>
                ),
            hook: Object
                .keys(this.$calc.hook)
                .reduce(
                    (prev, key) => ({
                        ...prev,
                        [key]: this.$recv[key].seq()
                    }), 
                    {} as ConnSeqMap<RecvOf<M>>
                ),
            pipe: Object
                .keys(this.$calc.pipe)
                .reduce(
                    (prev, key) => ({
                        ...prev,
                        [key]: this.$recv[key].seq()
                    }), 
                    {} as ConnSeqMap<RecvOf<M>>
                )
            
        };

        return result; 
    }
}
