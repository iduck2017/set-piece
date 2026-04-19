import { childRegistry } from "./child/child-registry";
import { decorConsumerRegistry } from "./decor/decor-consumer-registry";
import { decorProducerResolver } from "./decor/decor-producer-resolver";
import { decorService } from "./decor/decor-service";
import { effectRegistry } from "./effect/effect-registry";
import { Event } from "./event";
import { eventConsumerRegistry } from "./event/event-consumer-registry";
import { eventService } from "./event/event-service";
import { mountHookRegistry } from "./hooks/use-mount-hook";
import { unmountHookRegistry } from "./hooks/use-unmount-hook";
import { useLog } from "./log/use-log";
import { memoRegistry } from "./memo/memo-registry";
import { weakRefResolver } from "./ref/weak-ref-resolver";
import { routeRegistry } from "./route/route-registry";
import { actionManager } from "./action/action-manager";
import { useMicroAction } from "./action/use-micro-action";
import { tagRegistry } from "./tag/tag-registry";

export class Model {
    protected readonly _brand = Symbol('model')

    public get name() {
        return this.constructor.name;
    }

    @useLog()
    @useMicroAction()
    public init() {
        const memoKeys = memoRegistry.query(this);
        memoKeys.forEach(key => Reflect.get(this, key))

        const effectKeys = effectRegistry.query(this);
        effectKeys.forEach(key => {
            const effect = Reflect.get(this, key);
            if (!(effect instanceof Function)) return;
            effect.call(this);
        })

        const eventLoaderMap = eventConsumerRegistry.query(this);
        eventLoaderMap.forEach((loaders, key) => {
            const eventConsumerTag = tagRegistry.query(this, key);
            eventService.bind(eventConsumerTag);
        })

        const decorLoaderMap = decorConsumerRegistry.query(this);
        decorLoaderMap.forEach((loaders, key) => {
            const decorConsumerTag = tagRegistry.query(this, key);
            decorService.bind(decorConsumerTag);
        })
    }

    protected emit(event: Event, options?: {
        isYield?: boolean;
        isAsync?: boolean;
    }) {
        if (options?.isYield) return actionManager.then(() => eventService.emitSync(this, event));
        if (options?.isAsync) return eventService.emitAsync(this, event);
        eventService.emitSync(this, event);
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
        this.children.forEach(child => {
            result.push(child);
            result.push(...child.descendants);
        });
        return result;
    }

    public get children(): Model[] {
        const result: Model[] = [];
        const iterators = childRegistry.query(this);
        iterators.forEach((iterator, key) => {
            result.push(...iterator(this, key));
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
        weakRefResolver.register(this);
    }

    private updateRoute() {
        const routeTypeMap = routeRegistry.query(this);
        routeTypeMap.forEach((type: Function, key: string) => {
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
        this.children.forEach((child: Model) => child.updateRoute());
    }

}