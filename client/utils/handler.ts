import type { App } from "../app";
import { IConnector } from "../type/connector";
import { Connector } from "./connector";
import type { Emitter } from "./emitter";

/** 事件接收器 */
export class Handler<
    E = any, 
    P = any
> extends Connector<Emitter<E>, P> {
    public handleEvent: IConnector.Caller<E>;

    constructor(
        config: IConnector.Config,
        parent: P,
        app: App
    ) {
        super(
            config.id || app.referService.getUniqId(),
            parent, 
            app
        );
        this.handleEvent = () => {};
        config.idList?.forEach(id => {
            const emitter = app.referService.emitterReferManager.referDict[id];
            if (emitter) {
                emitter.bindHandler(this);
            }
        });
    }

    public destroy() { 
        this.connectorList.forEach(item => {
            item.unbindHandler(this);
        }); 
    }
}
