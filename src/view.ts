import { useMicroAction } from "./action/micro-action-manager";
import { frameConsumerRegistry } from "./frame/frame-consumer-registry";
import { frameService } from "./frame/frame-service";
import { tagRegistry } from "./tag/tag-registry";
import { viewChildRegistry } from "./view-child/view-child-registry";
import { viewRootRegistry } from "./view-route/view-root-registry";
import { viewRouteRegistry } from "./view-route/view-route-registry";

export abstract class View {
    protected readonly _brand = Symbol('view')

    public get name() {
        return this.constructor.name;
    }


    public get descendants(): View[] {
        const result: View[] = [];
        this.children.forEach(child => {
            result.push(child);
            result.push(...child.descendants);
        });
        return result;
    }

    public get children(): View[] {
        const result: View[] = [];
        const iterators = viewChildRegistry.query(this);
        iterators.forEach((iterator, key) => {
            result.push(...iterator(this, key));
        });
        return result;
    }

    private _parent?: View;
    public get parent() {
        return this._parent;
    }

    private _root: View = this;
    public get root() {
        return this._root;
    }

    protected abstract render(): void;

    protected abstract destroy(): void;

    private mount(parent: View) {
        if (this._parent) return;
        this._parent = parent;
        this.updateRoute();
    }

    private unmount() {
        if (!this._parent) return
        this._parent = undefined;
        this.updateRoute();
    }

    private updateRoute() {
        const routeTypeMap = viewRouteRegistry.query(this);
        routeTypeMap.forEach((type: Function, key: string) => {
            let ancestor: View | undefined = this;
            while (ancestor) {
                if (ancestor instanceof type) break;
                ancestor = ancestor.parent;
            }
            Reflect.set(this, key, ancestor);
        });
        let root: View = this;
        const prevActived = viewRootRegistry.check(this.root);
        while (root.parent) root = root.parent;
        this._root = root;
        const nextActived = viewRootRegistry.check(this.root);
        if (prevActived && !nextActived) this.destroy()
        this.children.forEach((child: View) => child.updateRoute());
        if (!prevActived && nextActived) this.render();
    }

    @useMicroAction()
    private init() {
        const loadersMap = frameConsumerRegistry.query(this);
        loadersMap.forEach((_loaders, key) => {
            const frameConsumerTag = tagRegistry.query(this, key);
            frameService.bind(frameConsumerTag);
        })
    }

    public get _internal() {
        return {
            mount: this.mount.bind(this),
            unmount: this.unmount.bind(this),
            init: this.init.bind(this),
        }
    }

}
