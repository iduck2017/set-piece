import { effectRegistry } from "./effect/effect-registry";
import { trxManager } from "./trx/trx-manager";
import { Event } from "./event";
import { eventEmitter } from "./event/event-emiiter";
import { eventResolver } from "./event/event-resolver";
import { eventRegistry } from "./event/event-registry";
import { memoRegistry } from "./memo/memo-registry";
import { routeRegistry } from "./route/route-registry";
import { fieldRegistry } from "./utils/field-registry";
import { childRegistry } from "./child/child-registry";
import { mountHookRegistry } from "./hooks/use-mount-hook";
import { unmountHookRegistry } from "./hooks/use-unmount-hook";
import { decorConsumerRegistry } from "./decor/decor-consumer-registry";
import { decorConsumerResolver } from "./decor/decor-consumer-resolver";
import { decorProducerRegistry } from "./decor/decor-producer-registry";
import { stateManager } from "./state/state-manager";
import { weakRefModelResolver } from "./ref/weak-ref-model-resolver";
import { decorProducerResolver } from "./decor/decor-producer-resolver";

export class Model {
    protected readonly _brand = Symbol('model')

    private _isInited: boolean = false;
    public get isInited() {
        return this._isInited;
    }

    public get name() {
        return this.constructor.name;
    }

    public init() {
        console.log('Init model', this.name);

        const memoKeys = memoRegistry.query(this);
        memoKeys.forEach(key => {
            Reflect.get(this, key);
        })

        const effectKeys = effectRegistry.query(this);
        effectKeys.forEach(key => {
           const method: any = Reflect.get(this, key);
           method.call(this)
        })

        const eventLoaderMap = eventRegistry.query(this);
        eventLoaderMap.forEach((_loaders, key) => {
            const eventConsumerField = fieldRegistry.query(this, key);
            eventResolver.bind(eventConsumerField);
        })

        const decorEmitterMap = decorProducerRegistry.query(this);
        decorEmitterMap.forEach((loader, key) => {
            const decorType = loader();
            stateManager.register(this, decorType, key);
        });

        const decorLoaderMap = decorConsumerRegistry.query(this);
        decorLoaderMap.forEach((_loaders, key) => {
            const decorConsumerField = fieldRegistry.query(this, key);
            decorConsumerResolver.bind(decorConsumerField);
        })
        decorProducerResolver.resolve();
    }

    protected emit(event: Event, options?: {
        isYield?: boolean;
        isAsync?: boolean;
    }) {
        if (options?.isYield) {
            trxManager.then(() => eventEmitter.emitSync(this, event));
            return;
        }
        if (options?.isAsync) return eventEmitter.emitAsync(this, event);
        eventEmitter.emitSync(this, event);
    }

    public get _internal() {
        return {
            mount: this.mount.bind(this),
            unmount: this.unmount.bind(this),
            emit: this.emit.bind(this),
        }
    }

    public get descendants(): Model[] {
        const result: Model[] = [];
        childRegistry.query(this).forEach((iterator, key) => {
            result.push(...iterator(this as Model & Record<string, any>, key));
        });
        return result;
    }

    private _parent?: Model;
    public get parent() {
        return this._parent;
    }

    private _root: Model = this;
    public get root() {
        return this._root;
    }

    private mount(parent: Model) {
        if (this._parent) return;
        this._parent = parent;
        this.updateRoute();
        mountHookRegistry.run(this);
    }

    private unmount() {
        if (!this._parent) return
        unmountHookRegistry.run(this);
        this._parent = undefined;
        this.updateRoute();
        weakRefModelResolver.register(this);
    }

    private updateRoute() {
        const typeMap = routeRegistry.query(this);
        typeMap.forEach((type: Function, key: string) => {
            let ancestor: Model | undefined = this;
            while (ancestor) {
                if (ancestor instanceof type) break;
                ancestor = ancestor.parent;
            }
            Reflect.set(this, key, ancestor);
        });
        let root: Model = this;
        while (root.parent) root = root.parent;
        this._root = root;
        this.descendants.forEach((child: Model) => child.updateRoute());
    }

}
