import { Node } from "@/model/node";
import { Base } from "@/type/base";
import { Delegator } from "@/util/proxy";

export type Action = {
    uuid: string;
    key: string;
    params: any[]
}

export class Sync {
    private static _main: Sync;
    static get main() {
        if (!Sync._main) {
            Sync._main = new Sync();
        }
        return Sync._main;
    }

    static useAction() {
        return function (
            target: Node,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const handler = descriptor.value;
            descriptor.value = function(this: Node, ...params) {
                if (!Sync.main._isApply) {
                    const uuid = this.refer;
                    Sync.main.send({ 
                        uuid: uuid,
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
    private readonly _actions: Array<Action> = Delegator.Observed(
        [], this._onActionChange.bind(this)
    );

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
        
    }
}