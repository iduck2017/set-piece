import { listChild } from "./child/as-custom-child";
import { findRoot, getRouteMap } from "./route/as-route";
import { emitEventAsync, emitEventSync, Event } from "./event/event";
import { addEventListeners, removeEventListeners } from "./event/listener";
import { runReloadHooks } from "./lifecycle/on-reload";
import { runMountHooks } from "./lifecycle/on-mount";
import { runUnmountHooks } from "./lifecycle/on-unmount";
import { runLoadHooks } from "./lifecycle/on-load";
import { runUnloadHooks } from "./lifecycle/on-unload";
import { appendThread } from "./transaction/as-thread";
import { clearMemories } from "./state/use-memory";
import { compareDomainMap, updateDomainMap } from "./route/domain";
import { addDecorListeners, removeDecorListeners } from "./state/listener";

export class Model {

    private _parent: Model | undefined;
    public get parent() {
        return this._parent;
    }

    private _root: Model = this;
    public get root() {
        return this._root;
    }

    public get _internal() {
        return {
            mount: this.mount.bind(this),
            unmount: this.unmount.bind(this),
            reload: this.reload.bind(this),
            unload: this.unload.bind(this),
            load: this.load.bind(this),

            emit: this.emit.bind(this),
        }
    }

    constructor() {
        this.load()
    }

    private mount(parent: Model) {
        if (this._parent) {
            console.error('Parent already exists');
            return;
        }
        this._parent = parent;
        this.updateRoute();
        runMountHooks(this);
    }

    private unmount() {
        if (!this._parent) {
            console.error('Parent not exists');
            return;
        }
        this.unload()
        runUnmountHooks(this);
        this._parent = undefined;
        this.updateRoute();
    }

    private updateRoute() {
        const isDomainChanged = compareDomainMap(this);
        if (isDomainChanged) {
            this.reload()
        }
        const routeMap = getRouteMap(this);
        routeMap.forEach((value, key) => {
            Reflect.set(this, key, value);
        })
        const root = findRoot(this);
        this._root = root;
        
        const children = listChild(this)
        children.forEach(child => child.updateRoute())
    }

    protected emit(event: Event, options?: {
        isYield?: boolean;
        isAsync?: boolean;
    }) {
        const isYield = options?.isYield ?? false;
        const isAsync = options?.isAsync ?? false;
        if (isYield) {
            appendThread(() => {
                emitEventSync(this, event);
            });
            return;
        }
        if (isAsync) {
            return emitEventAsync(this, event);
        }
        emitEventSync(this, event);
    }

    private unload() {
        runUnloadHooks(this);
        removeEventListeners(this);
        removeDecorListeners(this);
        clearMemories(this);
    }

    protected reload() {
        this.unload();
        this.load();
        runReloadHooks(this);
    }

    private load() {
        addEventListeners(this);
        addDecorListeners(this)
        updateDomainMap(this);
        runLoadHooks(this);
    }

}