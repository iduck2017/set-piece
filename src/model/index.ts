import { childRegistry } from "./child/child-registry";
import { decorConsumerRegistry } from "./decor/decor-consumer-registry";
import { decorService } from "./decor/decor-service";
import { effectRegistry } from "./effect/effect-registry";
import { Event } from "./event";
import { eventConsumerRegistry } from "./event/event-consumer-registry";
import { eventService } from "./event/event-service";
import { memoRegistry } from "./memo/memo-registry";
import { weakRefResolver } from "./ref/weak-ref-resolver";
import { routeRegistry } from "./route/route-registry";
import { actionManager } from "../common/action/manager";
import { tagRegistry } from "../common/tag/tag-registry";
import { deferEffectRegistry } from "./effect/defer-effect-registry";
import { ticketService } from "../common/utils/ticket-service";
import { useMicroAction } from "../common/action/micro-manager";
import { Frame } from "../common/frame";
import { frameService } from "../common/frame/frame-service";

export abstract class Model {
    protected readonly _brand = Symbol('model')

    protected _uuid: string = ticketService.query()
    public get uuid() {
        return this._uuid;
    }

    public get name() {
        return this.constructor.name;
    }

    @useMicroAction()
    private init() {
        const memoKeys = memoRegistry.query(this);
        memoKeys.forEach(key => Reflect.get(this, key))
        const effectKeys = [
            ...effectRegistry.query(this),
            ...deferEffectRegistry.query(this),
        ];
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


    protected emitFrame(frame: Frame) {
        frameService.emit(this, frame);
    }

    protected emitEvent(event: Event) {
        eventService.emitSync(this, event);
    }

    protected emitDeferEvent(event: Event) {
        return actionManager.then(() => eventService.emitSync(this, event));
    }

    protected emitAsyncEvent(event: Event) {
        return eventService.emitAsync(this, event);
    }

    public get _internal() {
        return {
            init: this.init.bind(this),
            mount: this.mount.bind(this),
            unmount: this.unmount.bind(this),
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
    }

    private unmount() {
        if (!this._parent) return
        this._parent = undefined;
        this.updateRoute();
        weakRefResolver.register(this);
    }

    private updateRoute() {
        const routeTypeMap = routeRegistry.query(this);
        routeTypeMap.forEach((Constructor: Function, key: string) => {
            let ancestor: Model | undefined = this;
            while (ancestor) {
                if (ancestor instanceof Constructor) break;
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