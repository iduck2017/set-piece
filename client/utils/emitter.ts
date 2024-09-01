import type { App } from "../app";
import { ConnectorDecl } from "../type/connector";
import { Connector } from "./connector";
import type { Handler } from "./handler";

/** 事件触发器 */
export class Emitter<
    E = any, 
    P = any
> extends Connector<Handler<E>, P> {
    constructor(
        config: ConnectorDecl.Config,
        parent: P,
        app: App
    ) {
        super(
            config.id || app.referService.getUniqId(),
            parent,
            app
        );
        app.referService.emitterReferManager.addRefer(this);
        config.idList?.forEach(id => {
            const handler = app.referService.handlerReferManager.referDict[id];
            if (handler) {
                console.log('hit handler', handler);
                this.bindHandler(handler);
            }
        });
    }

    /** 事件触发函数 */
    public emitEvent(event: E) {
        this.connectorList.forEach(item => {
            item.handleEvent(event);
        });
    }

    /** 绑定事件处理器 */
    public bindHandler(handler: Handler<E>) {
        this.addConnector(handler);
        handler.addConnector(this);
    }

    /** 解绑事件处理器 */
    public unbindHandler(handler: Handler<E>) {
        this.removeConnector(handler);
        handler.removeConnector(this);
    }
    
    public destroy() { 
        this.connectorList.forEach(item => {
            this.unbindHandler(item);
        }); 
        this.app.referService.emitterReferManager.removeRefer(this);
    }
}

export class SafeEmitter<
    E = any, 
    P = any
> {
    public readonly bindHandler: ConnectorDecl.Binder<E>;
    public readonly unbindHandler: ConnectorDecl.Binder<E>;

    constructor(emitter: Emitter<E, P>) {
        this.bindHandler = emitter.bindHandler.bind(emitter);
        this.unbindHandler = emitter.unbindHandler.bind(emitter);
    }
}