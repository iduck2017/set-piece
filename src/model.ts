import { childRegistry } from "./child/child-registry";
import { decorConsumerRegistry } from "./decor/decor-consumer-registry";
import { decorService } from "./decor/decor-service";
import { effectRegistry } from "./effect/effect-registry";
import { Event } from "./event";
import { eventConsumerRegistry } from "./event/event-consumer-registry";
import { eventService } from "./event/event-service";
import { memoRegistry } from "./memo/memo-registry";
import { routeRegistry } from "./route/route-registry";
import { routeResolver } from "./route/route-resolver";
import { eventResolver } from "./event/event-resolver";
import { useStory } from "./hooks/use-story";
import { tagRegistry } from "./tag/tag-registry";
import { ticketService } from "./utils/ticket-service";
import { Frame } from "./frame";
import { frameService } from "./frame/frame-service";
import { frameConsumerRegistry } from "./frame/frame-consumer-registry";
import { useAnime } from "./hooks/use-anime";
import { gcService } from "./utils/gc-service";
import { refConsumerRegistry } from "./ref/ref-consumer-registry";
import { refRegistry } from "./ref/ref-registry";

type EmitOptions = {
    isDefer?: boolean;
    isAsync?: boolean;
}

export abstract class Model {
    protected readonly _brand = Symbol('model')

    protected _uuid: string = ticketService.query()
    public get uuid() { return this._uuid; }

    public get name() { return this.constructor.name; }

    /**
     * Initialize all reactive registrations for this model.
     *
     * This runs from `ModelResolver` inside a blink. It warms memo getters,
     * executes effects once, and binds decor, event, and frame consumers for
     * the first time.
     *
     * @returns Nothing.
     */
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

    /**
     * Emit a frame through the anime frame queue.
     *
     * @param frame - Frame instance to queue for bound consumers.
     * @param options - Currently ignored for frames.
     * @returns The frame emission result.
     */
    protected emit(frame: Frame, options?: EmitOptions): unknown;
    /**
     * Emit an event asynchronously.
     *
     * @param event - Event instance to deliver.
     * @param options - Emit options with `isAsync: true`.
     * @returns Promise resolved after all async consumers finish.
     */
    protected emit(event: Event, options?: EmitOptions): Promise<void>;
    /**
     * Emit an event synchronously or defer it to the current story.
     *
     * @param event - Event instance to deliver.
     * @param options - Optional deferred emit settings.
     * @returns The event emission result.
     */
    protected emit(event: Event, options?: EmitOptions): void;
    /**
     * Route the payload by runtime type and emit options.
     *
     * Frames go through `frameService`. Events can be sync, async, or deferred
     * through `eventResolver`.
     *
     * @param target - Frame or event payload to emit.
     * @param options - Event emit options.
     * @returns The chosen service result.
     */
    @useAnime()
    @useStory()
    protected emit(target: Frame | Event, options: EmitOptions = {}) {
        if (target instanceof Frame) return frameService.emit(this, target);
        if (options.isAsync) return eventService.emitAsync(this, target);
        if (options.isDefer) return eventResolver.register(this, target);
        return eventService.emitSync(this, target);
    }

    /**
     * Remove this model from ref holders and clear refs held by this model.
     *
     * This is an internal cleanup helper used before a model leaves the object
     * graph.
     *
     * @returns Nothing.
     */
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
            reroute: this.reroute.bind(this),
            unlink: this.unlink.bind(this)
        }
    }

    public get descendants(): Model[] {
        const descendants: Model[] = [];
        this.children.forEach(child => {
            descendants.push(child);
            descendants.push(...child.descendants);
        });
        return descendants;
    }

    public get children(): Model[] {
        const children: Model[] = [];
        const iterators = childRegistry.query(this);
        iterators.forEach((iterator, key) => {
            children.push(...iterator(this, key));
        });
        return children;
    }

    private _parent?: Model;
    public get parent() { return this._parent; }

    private _root: Model = this;
    public get root() { return this._root; }

    /**
     * Attach this model to a parent and queue derived route refresh.
     *
     * `useChild()` calls this when a model becomes owned child state.
     *
     * @param parent - Parent model that now owns this child.
     * @returns Nothing.
     */
    private mount(parent: Model) {
        if (this._parent) return;
        this._parent = parent;
        routeResolver.register(this);
    }

    /**
     * Detach this model from its parent and queue derived route refresh.
     *
     * `useChild()` calls this when a child is removed or replaced.
     *
     * @returns Nothing.
     */
    private unmount() {
        if (!this._parent) return
        this._parent = undefined;
        routeResolver.register(this);
    }

    /**
     * Recompute nearest route ancestors, root, and descendant routes.
     *
     * `RouteResolver` calls this after mount/unmount changes. It updates route
     * fields for this model and all descendants.
     *
     * @returns Nothing.
     */
    private reroute() {
        const routes = routeRegistry.query(this);
        routes.forEach((RouteCtor: Function, key: string) => {
            let ancestor: Model | undefined = this;
            while (ancestor) {
                if (ancestor instanceof RouteCtor) break;
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
