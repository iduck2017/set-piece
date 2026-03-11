import { listChild } from "./child/use-custom-child";
import { findRoot, getRouteMap } from "./route/use-route";
import { emitEventAsync, emitEventSync, Event } from "./event";
import { addListeners, listenerContext, removeListeners } from "./event/listener";
import { runReloadHooks } from "./lifecycle/use-reload-hook";
import { runMountHooks } from "./lifecycle/use-mount-hook";
import { runUnmountHooks } from "./lifecycle/use-unmount-hook";
import { runLoadHooks } from "./lifecycle/use-load-hook";
import { runUnloadHooks } from "./lifecycle/use-unload-hook";
import { appendCoroutine } from "./transaction/use-coroutine";
import { resetMemo } from "./state/use-memo";
import { compareDomainMap, updateDomainMap } from "./route/domain";
import { addDecorListeners, removeDecorListeners } from "./state/modifier";
import { runTrx, useTrx } from "./transaction/use-trx";

let uuid = 0;

export class Model {
    constructor() {
        uuid += 1;
        this._uuid = uuid.toString();
        this.load()
    }

    private _uuid: string;
    public get uuid() {
        return this._uuid;
    }

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
            appendCoroutine(() => {
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
        removeListeners(this);
        removeDecorListeners(this);
        resetMemo(this);
    }

    @useTrx()
    protected reload() {
        this.unload();
        this.load();
        runReloadHooks(this);
        // console.log('Finish reload', listenerContext.get(this))
    }

    private load() {
        addListeners(this);
        addDecorListeners(this)
        updateDomainMap(this);
        runLoadHooks(this);
    }

}