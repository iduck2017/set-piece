import { useAction } from "../hooks/use-action";
import { useChild } from "../hooks/use-child";
import { useModel } from "../hooks/use-model";
import { useRef } from "../hooks/use-ref";
import { Model } from "../model";

@useModel('ref-resolver-node')
class RefNodeModel extends Model {
    @useRef()
    private _target?: RefNodeModel;
    public get target() { return this._target; }
    public set target(value: RefNodeModel | undefined) { this._target = value; }

    @useRef()
    private _targets?: Array<RefNodeModel | undefined> = [];
    public get targets() { return this._targets; }
    public set targets(value: Array<RefNodeModel | undefined> | undefined) {
        this._targets = value;
    }
}

@useModel('ref-resolver-root')
class RefRootModel extends Model {
    @useChild()
    private _nodes: RefNodeModel[] = [];

    public add(...nodes: RefNodeModel[]) {
        this._nodes.push(...nodes);
    }

    public remove(node: RefNodeModel) {
        const index = this._nodes.indexOf(node);
        if (index === -1) return;
        this._nodes.splice(index, 1);
    }

    @useAction()
    public removeAndInspect(node: RefNodeModel, holder: RefNodeModel) {
        this.remove(node);
        return {
            separated: node.root !== holder.root,
            target: holder.target,
        };
    }
}

describe('useRef', () => {
    it('removes an active single ref when its holder leaves the root', () => {
        const root = new RefRootModel();
        const holder = new RefNodeModel();
        const target = new RefNodeModel();
        root.add(holder, target);
        holder.target = target;

        root.remove(holder);

        expect(holder.root).toBe(holder);
        expect(target.root).toBe(root);
        expect(holder.target).toBeUndefined();
    });

    it('removes a passive single ref when its target leaves the root', () => {
        const root = new RefRootModel();
        const holder = new RefNodeModel();
        const target = new RefNodeModel();
        root.add(holder, target);
        holder.target = target;

        root.remove(target);

        expect(holder.root).toBe(root);
        expect(target.root).toBe(target);
        expect(holder.target).toBeUndefined();
    });

    it('delays ref removal until the outer action finishes', () => {
        const root = new RefRootModel();
        const holder = new RefNodeModel();
        const target = new RefNodeModel();
        root.add(holder, target);
        holder.target = target;

        const snapshot = root.removeAndInspect(target, holder);

        expect(snapshot.separated).toBe(true);
        expect(snapshot.target).toBe(target);
        expect(holder.target).toBeUndefined();
    });

    it('splices invalid array refs and keeps duplicate links tracked', () => {
        const root = new RefRootModel();
        const holder = new RefNodeModel();
        const kept = new RefNodeModel();
        const removed = new RefNodeModel();
        root.add(holder, kept, removed);
        holder.targets = [kept, removed, undefined, removed];
        const targets = holder.targets!;

        targets.pop();
        root.remove(removed);

        expect(holder.targets).toBe(targets);
        expect(holder.targets).toEqual([kept, undefined]);
    });
});
