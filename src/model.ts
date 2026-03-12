import { listChild } from "./child/use-custom-child";
import { findRoot, getRouteMap } from "./route/use-route";
import { emitEventAsync, emitEventSync, Event } from "./event";
import { addListeners, listenerContext, removeListeners } from "./event/listener";
import { runReloadHooks } from "./lifecycle/use-reload-hook";
import { runMountHooks } from "./lifecycle/use-mount-hook";
import { runUnmountHooks } from "./lifecycle/use-unmount-hook";
import { runUnloadHooks } from "./lifecycle/use-unload-hook";
import { runCoroutine } from "./transaction/use-coroutine";
import { resetMemo } from "./state/use-memo";
import { compareDomainMap, updateDomainMap } from "./route/domain";
import { addModifiers, removeModifiers } from "./state/modifier";
import { runTrx, useTrx } from "./transaction/use-trx";
import { addWeakRef } from "./refer/weak-ref";

let uuid = 0;

export class Model {
    constructor() {
        uuid += 1;
        this._uuid = uuid.toString();
        this.reload()
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

    public get name() {
        return this.constructor.name;
    }

    public get _internal() {
        return {
            mount: this.mount.bind(this),
            unmount: this.unmount.bind(this),
            reload: this.reload.bind(this),
            emit: this.emit.bind(this),
        }
    }


    @useTrx()
    private _mount(parent: Model) {
        this._parent = parent;
        this.updateRoute();
    }
    private mount(parent: Model) {
        if (this._parent) {
            console.error('Parent already exists');
            return;
        }
        this._mount(parent);
        runMountHooks(this);
    }

    @useTrx()
    private _unmount() {
        addWeakRef(this); 
        this._parent = undefined;
        this.updateRoute();
    }
    private unmount() {
        if (!this._parent) {
            console.error('Parent not exists');
            return;
        }
        console.log('Unmount', this.name);
        runUnmountHooks(this);
        this._unmount()
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
            runCoroutine(() => {
                emitEventSync(this, event);
            });
            return;
        }
        if (isAsync) {
            return emitEventAsync(this, event);
        }
        emitEventSync(this, event);
    }

    private reloadState() {
        resetMemo(this);
    }

    private reloadEvent() {
        removeListeners(this);
        addListeners(this);
    }

    private reloadDecor() {
        removeModifiers(this);
        addModifiers(this);
    }

    
    @useTrx()
    private _reload() {
        this.reloadState();
        this.reloadDecor();
        this.reloadEvent();
        updateDomainMap(this);
    }
    protected reload() {
        runUnloadHooks(this);
        this._reload()
        runReloadHooks(this);
    }

}