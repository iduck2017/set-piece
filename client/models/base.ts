import { 
    IdOf, 
    RuleOf,
    StatOf,
    InfoOf,
    ListOf,
    DictOf,
    ParentOf,
    RecvOf,
    CallOf,
    BaseDef 
} from "../types/definition";
import type { App } from "../app";
import { Calculable } from "../utils/calculable";
import { Callable } from "../utils/callable";
import { Receivable } from "../utils/receivable";
import { Inheritable } from "../utils/inheritable";
import { KeyRef } from "../types/reference";
import { CalcIntf } from "../types/common";
import { BaseIntf, ElemOf, Union, ValueOf } from "../types/base";
import { BaseModel } from "../types/model";
import { BaseConf } from "../types/config";
import type { DictSeq, ListSeq, SeqOf, BaseSeq } from "../types/sequence";


export abstract class Model<M extends BaseDef> {
    private readonly $id : IdOf<M>;
    private readonly $app: App;
    private readonly $key: string;
    
    protected readonly $calc: Calculable<RuleOf<M>, InfoOf<M>, StatOf<M>>;
    protected readonly $node: Inheritable<ListOf<M>, DictOf<M>, ParentOf<M>, BaseModel>;
    protected readonly $recv: Receivable<RecvOf<M>>;
    protected readonly $call: Callable<Union<CalcIntf, CallOf<M>>>;

    public readonly debug: BaseIntf;
    
    public get id() { return this.$id; }
    public get app() { return this.$app; }
    public get key() { return this.$key; }
    public get data() { return this.$calc.data; } 
    public get list() { return this.$node.list; } 
    public get dict() { return this.$node.dict; }
    public get children() { return this.$node.children; }

    public get bind() { return this.$call.bind.bind(this.$call); }
    public get unbind() { return this.$call.unbind.bind(this.$call); }

    public constructor(config: BaseConf<M>) {
        this.$app = config.app;
        this.$id = config.id;
        this.$key = config.key || config.app.ref.register();

        this.debug = {};

        this.$call = new Callable({
            target: this,
            ref   : {}
        });
        this.$recv = new Receivable({
            target: this,
            ref   : {},
            event : config.event
        });

        const list: ListOf<M> = [];
        const dict: DictOf<M> = {};

        for (const item of config.list) {
            list.push(config.app.fact.unseq({
                ...item,
                parent: this
            }));
        }
        for (const key in config.dict) {
            dict[key] = config.app.fact.unseq({
                ...config.dict[key],
                parent: this
            });
        }
        
        this.$node = new Inheritable({
            target: this,
            list  : list,
            dict  : dict,
            parent: config.parent
        });
        this.$calc = new Calculable({
            target: this,
            rule  : config.rule,
            info  : config.info,
            stat  : config.stat,
            event : this.$call.event
        });
        
        for (const key in config.call) {
            const models = this.app.ref.list<Model<any>>(config.call[key]);
            for (const model of models) {
                this.$call.bind(
                    key as keyof Union<CalcIntf, CallOf<M>>, 
                    model.$recv
                );
            }
        }
        for (const key in config.recv) {
            const models = this.app.ref.list<any>(config.recv[key]);
            for (const model of models) {
                model.call.bind(key, this.$recv);
            }
        }
        
        for (const key in this.$calc.info) this.$calc.update(key);
        for (const key in this.$calc.stat) this.$calc.update(key);
    }

    public destroy() {
        for (const child of this.$node.children) {
            child.destroy();
        }
        this.app.ref.remove(this);
        this.$node.parent.$node.del(this);
    }

    public seq(): BaseSeq<M> {
        const call: KeyRef<Union<CalcIntf, CallOf<M>>> = {};
        const recv: KeyRef<RecvOf<M>> = {};
        const dict = {} as DictSeq<DictOf<M>>;
        const list: ListSeq<ListOf<M>> = [];
        const stat = this.$calc.stat;
        const rule = this.$calc.rule;

        for (const key in this.$call.refer) {
            const list = this.$call.refer[key];
            if (list) {
                call[key as keyof Union<CalcIntf, CallOf<M>>] = [];
                for (const item of list) {
                    if (item.target instanceof Model) {
                        call[key]!.push(item.target.key);
                    }
                }
            }
        }
        for (const key in this.$recv.refer) {
            const list = this.$recv.refer[key];
            if (list) {
                recv[key as keyof Union<CalcIntf, CallOf<M>>] = [];
                for (const item of list) {
                    if (item.target instanceof Model) {
                        recv[key]!.push(item.target.key);
                    }
                }
            }
        }

        for (const child of this.$node.list) {
            list.push(child.seq() as SeqOf<ElemOf<ListOf<M>>>);
        }
        for (const key in this.$node.dict) {
            dict[key] = this.$node.dict[key].seq() as SeqOf<ValueOf<DictOf<M>>>;
        }

        const result: BaseSeq<M> = {
            id : this.$id,
            key: this.$key,
            stat,
            rule,
            list,
            dict,
            call,
            recv
        };

        return result; 
    }
}
