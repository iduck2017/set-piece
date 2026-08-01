import { childRegistry } from "./child/child-registry";
import { depCollector } from "./dep/dep-collector";
import { depService } from "./dep/dep-service";
import { decorConsumerRegistry } from "./decor/decor-consumer-registry";
import { decorService } from "./decor/decor-service";
import { effectRegistry } from "./effect/effect-registry";
import { Event, PrevEvent } from "./event";
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
import { useBlink } from "./hooks/use-blink";
import { gcService } from "./utils/gc-service";
import { refResolver } from "./ref/ref-resolver";
import { useDep } from "./hooks/use-dep";
import { useMemo } from "./hooks/use-memo";
import { useAction } from "./hooks/use-action";

/**
 * Base class for reactive domain objects managed by set-piece.
 */
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
        /** Warm memo getters so their dependencies are collected immediately. */
        const memoKeys = memoRegistry.query(this);
        memoKeys.forEach(key => Reflect.get(this, key))
        /** Run initial effects after memo state is available. */
        const effectKeys = effectRegistry.query(this);
        effectKeys
            .map(key => Reflect.get(this, key))
            .filter(effect => effect instanceof Function)
            .forEach(effect => effect.call(this))
        /** Bind decor consumers before event and frame listeners. */
        const decorLoaderMap = decorConsumerRegistry.query(this);
        const decorKeys = [...decorLoaderMap.keys()];
        const decorConsumerTags = decorKeys.map(key => tagRegistry.query(this, key));
        decorConsumerTags.forEach(tag => decorService.bind(tag));
        /** Bind message consumers after all local initialization is done. */
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
     * @returns The frame emission result.
     */
    protected emit(frame: Frame): unknown;
    /**
     * Emit an event through the story queue.
     *
     * `PrevEvent` is emitted synchronously. Other events are deferred until the
     * current story resolves.
     *
     * @param event - Event instance to deliver.
     * @returns The event emission result.
     */
    protected emit(event: Event): void;
    /**
     * Route the payload by runtime type.
     *
     * Frames go through `frameService`. Previous-value events emit
     * synchronously, while normal events are queued through `eventResolver`.
     *
     * @param target - Frame or event payload to emit.
     * @returns The chosen service result.
     */
    @useAnime()
    @useStory()
    protected emit(target: Frame | Event) {
        if (target instanceof Frame) return frameService.emit(this, target);
        if (target instanceof PrevEvent) return eventService.emit(this, target);
        return eventResolver.register(this, target);
    }

    public get _internal() {
        return {
            init: this.init.bind(this),
            mount: this.mount.bind(this),
            unmount: this.unmount.bind(this),
            reroute: this.reroute.bind(this)
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

    @useDep()
    private _parent?: Model;
    @useMemo()
    public get parent() { return this._parent; }

    @useDep()
    private _root: Model = this;
    @useMemo()
    public get root() { return this._root; }

    /**
     * Attach this model to a parent and queue derived route refresh.
     *
     * `useChild()` calls this when a model becomes owned child state.
     *
     * @param parent - Parent model that now owns this child.
     * @returns Nothing.
     */
    @useAction()
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
    @useAction()
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
        /** Resolve each route property to the nearest matching ancestor. */
        const routes = routeRegistry.query(this);
        routes.forEach((RouteCtor: Function, key: string) => {
            let ancestor: Model | undefined = this;
            while (ancestor) {
                if (ancestor instanceof RouteCtor) break;
                ancestor = ancestor.parent;
            }
            Reflect.set(this, key, ancestor);
        });
        /** Recompute root from the parent chain after route links update. */
        let root: Model = this;
        while (root.parent) root = root.parent;
        this._root = root;
        refResolver.register(this);
        /** Propagate route changes through the mounted subtree. */
        this.children.forEach((child: Model) => child.reroute());
    }
}
