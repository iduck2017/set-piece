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
                if (!SyncService.main._isApply) {
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

    private _isApply: boolean = false;
    private _isFlush: boolean = false;
    private readonly _actions: Array<{
        id: string;
        key: string;
        params: any[]
    }> = Delegator.ControlledList([], this._onActionChange.bind(this));

    async send(action: Action) {
        this._actions.push(action);
    }

    async _onActionChange() {
        if (!this._actions.length) return;
        if (this._isFlush) return;
        this._isFlush = true;
        for (const action of [ ...this._actions ]) {
            await this._run(action);
        }
        this._isFlush = false;
        this._onActionChange();
    }

    _run(action: Action) {
        const { id, key, params } = action;
        const model: any = Model.query(id);
        this._isApply = true;
        model[key].call(model, ...params);
        this._isApply = false;
    }
}