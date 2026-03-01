import { listChild } from "./child/as-custom-child";
import { findRoot, findRouteMap } from "./route/as-route";
import { emitEventAsync, emitEventSync, Event } from "./event/event";
import { addListeners, removeListeners, transferListeners } from "./event/listener";
import { runReloadHooks } from "./lifecycle/on-reload";
import { runMountHooks } from "./lifecycle/on-mount";
import { runUnmountHooks } from "./lifecycle/on-unmount";
import { appendThread } from "./transaction/as-thread";
import { useEffect } from "./lifecycle/use-effect";

export class Model {

    private _parent: Model | undefined;
    public get parent() {
        return this._parent;
    }

    @useEffect(transferListeners)
    private _root: Model = this;
    public get root() {
        return this._root;
    }

    public get _internal() {
        return {
            bindParent: this.bindParent.bind(this),
            unbindParent: this.unbindParent.bind(this),
            reload: this.reload.bind(this),
            emit: this.emit.bind(this),
        }
    }

    constructor() {
        this.load();
    }

    private bindParent(parent: Model) {
        if (this._parent) {
            console.error('Parent already exists');
            return;
        }
        this._parent = parent;
        this.updateRoute();
        this.mount();
    }

    private unbindParent() {
        if (!this._parent) {
            console.error('Parent not exists');
            return;
        }
        this.unmount();
        this._parent = undefined;
        this.updateRoute();
    }

    private updateRoute() {
        const routeMap = findRouteMap(this);
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

    private load() {
        addListeners(this);
    }

    private unload() {
        removeListeners(this);
    }

    private mount() {
        runMountHooks(this);
    }

    private unmount() {
        runUnmountHooks(this);
    }

    protected reload() {
        this.unload();
        this.load();
        runReloadHooks(this);
    }

}