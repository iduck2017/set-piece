import { useMicroAction } from "../common/action/micro-manager";
import { frameConsumerRegistry } from "../common/frame/frame-consumer-registry";
import { frameService } from "../common/frame/frame-service";
import { tagRegistry } from "../common/tag/tag-registry";
import { viewChildRegistry } from "./child/view-child-registry";
import { viewRootRegistry } from "./route/view-root-registry";
import { viewRouteRegistry } from "./route/view-route-registry";

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
        this.children.forEach((child: View) => child.updateRoute());
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
