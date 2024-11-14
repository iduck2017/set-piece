import { Model } from "@/model";
import { Base } from "@/type/base";
import { Delegator } from "@/util/proxy";

export type Action = {
    id: string;
    key: string;
    params: any[]
}

export class SyncService {
    private static _main: SyncService;
    static get main() {
        if (!SyncService._main) {
            SyncService._main = new SyncService();
        }
        return SyncService._main;
    }
    private constructor() {
        
    }

    static useAction() {
        return function (
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const handler = descriptor.value;
            descriptor.value = function(this: Model, ...params) {
                if (SyncService.main._lock) {
                    const id = this.id;
                    SyncService.main.send({ 
                        id,
                        key,
                        params 
                    });
                    return;
                } else {
                    handler?.apply(this, params);
                    return; 
                }
            };
            return descriptor;
        };
    }

    private _lock: boolean = false;
    private readonly _actions: Array<{
        id: string;
        key: string;
        params: any[]
    }> = Delegator.ControlledList([], this._onActionChange.bind(this));

    async send(action: Action) {
        console.log('send');
        this._actions.push(action);
    }

    async _onActionChange() {
        console.log('flush');
        if (!this._actions.length) return;
        if (this._lock) return;
        this._lock = true;
        for (const action of [ ...this._actions ]) {
            await this._run(action);
        }
        this._lock = false;
        this._onActionChange();
    }

    _run(action: Action) {
        const { id, key, params } = action;
        const model: any = Model.query(id);
        model[key].call(model, ...params);
    }
}