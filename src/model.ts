import { childRegistry } from "./child/child-registry";
import { decorConsumerRegistry } from "./decor/decor-consumer-registry";
import { decorService } from "./decor/decor-service";
import { effectRegistry } from "./effect/effect-registry";
import { Event } from "./event";
import { eventConsumerRegistry } from "./event/event-consumer-registry";
import { eventService } from "./event/event-service";
import { memoRegistry } from "./memo/memo-registry";
import { routeRegistry } from "./route/route-registry";
import { eventResolver, useStory } from "./event/event-resolver";
import { tagRegistry } from "./tag/tag-registry";
import { ticketService } from "./utils/ticket-service";
import { blinkManager } from "./action/blink-manager";
import { Frame } from "./frame";
import { frameService } from "./frame/frame-service";
import { frameConsumerRegistry } from "./frame/frame-consumer-registry";
import { useAnime } from "./frame/frame-resolver";
import { gcService } from "./utils/gc-service";
import { refConsumerRegistry } from "./ref/ref-consumer-registry";
import { refRegistry } from "./ref/ref-registry";
import { storeRegistry } from "./store/store-registry";
import { Constructor } from "./types";
import { modelResolver } from "./model-resolver";

type EmitOptions = {
    isDefer?: boolean;
    isAsync?: boolean;
}

type AsyncEmitOptions = EmitOptions & {
    isAsync: true;
}

export abstract class Model {
    protected readonly _brand = Symbol('model')

    protected _uuid: string = ticketService.query()
    public get uuid() {
        return this._uuid;
    }

    public get name() {
        return this.constructor.name;
    }

    private init() {
        gcService.register(this, `${this.constructor.name}#${this._uuid}`);
        const memoKeys = memoRegistry.query(this);
        memoKeys.forEach(key => Reflect.get(this, key))
        const effectKeys = effectRegistry.query(this);
        effectKeys
            .map(key => Reflect.get(this, key))
            .filter(effect => effect instanceof Function)
            .forEach(effect => effect.call(this))
        const decorLoaderMap = decorConsumerRegistry.query(this);
        const decorKeys = [...decorLoaderMap.keys()];
        const decorConsumerTags = decorKeys.map(key => tagRegistry.query(this, key));
        decorConsumerTags.forEach(tag => decorService.bind(tag));
        const eventLoaderMap = eventConsumerRegistry.query(this);
        const frameLoaderMap = frameConsumerRegistry.query(this);
        const eventKeys = [...eventLoaderMap.keys()];
        const frameKeys = [...frameLoaderMap.keys()];
        const eventConsumerTags = eventKeys.map(key => tagRegistry.query(this, key));
        const frameConsumerTags = frameKeys.map(key => tagRegistry.query(this, key));
        eventConsumerTags.forEach(tag => eventService.bind(tag));
        frameConsumerTags.forEach(tag => frameService.bind(tag));
    }

    protected emit(frame: Frame, options?: EmitOptions): unknown;
    protected emit(event: Event, options: AsyncEmitOptions): Promise<void>;
    protected emit(event: Event, options?: EmitOptions): unknown;
    @useAnime()
    @useStory()
    protected emit(target: Frame | Event, options: EmitOptions = {}) {
        if (target instanceof Frame) return frameService.emit(this, target);
        if (options.isAsync) return eventService.emitAsync(this, target);
        if (options.isDefer) return eventResolver.register(this, target);
        return eventService.emitSync(this, target);
    }

    protected unlink() {
        const refConsumers = refConsumerRegistry.query(this);
        refConsumers.forEach(tag => {
            const holder: any = tag.target;
            const value = Reflect.get(holder, tag.key);
            if (value === this) Reflect.set(holder, tag.key, undefined);
            if (value instanceof Array) {
                let index = value.indexOf(this);
                while (index >= 0) {
                    value.splice(index, 1);
                    index = value.indexOf(this);
                }
            }
        });
        refRegistry.query(this).forEach(key => {
            Reflect.set(this, key, undefined);
        });
    }

    public get _internal() {
        return {
            init: this.init.bind(this),
            mount: this.mount.bind(this),
            unmount: this.unmount.bind(this),
            unlink: this.unlink.bind(this)
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
        this.reroute();
    }

    private unmount() {
        if (!this._parent) return
        this._parent = undefined;
        this.reroute();
    }

    private reroute() {
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
        this.children.forEach((child: Model) => child.reroute());
    }
}

export function useModel(code: string) {
    return function(Constructor: Constructor<Model, undefined[]>): any {
        storeRegistry.register(code, Constructor);
        Constructor = blinkManager.delegate(Constructor);
        return class extends Constructor {
            constructor(...params: any[]) {
                super(...params);
                modelResolver.register(this);
            }
        } 
    }
}
