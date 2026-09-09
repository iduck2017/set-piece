import { Model } from "../model";
import { useChild } from "../hooks/use-child";
import { useDep } from "../hooks/use-dep";
import { useMemo } from "../hooks/use-memo";
import { useModel } from "../hooks/use-model";
import { useRef } from "../hooks/use-ref";
import { useState } from "../hooks/use-state";
import { storeService } from "./store-service";

/** Inherited fields exercise all three persistence registries. */
class StoreBase extends Model {
    @useState()
    private _label = 'default';
    public get label() { return this._label; }
    public set label(value: string) { this._label = value; }

    @useChild()
    private _child?: StoreNode;
    public get child() { return this._child; }
    public set child(value: StoreNode | undefined) {
        this._child = value;
    }

    @useRef()
    private _target?: StoreNode;
    public get target() { return this._target; }
    public set target(value: StoreNode | undefined) {
        this._target = value;
    }
}

@useModel('store-test-node')
class StoreNode extends StoreBase {
    @useState()
    private _value: unknown = 42;
    public get value() { return this._value; }
    public set value(value: unknown) { this._value = value; }

    @useChild()
    private _nodes: Array<StoreNode | undefined> = [];
    public get nodes() { return this._nodes; }
    public set nodes(value: Array<StoreNode | undefined>) {
        this._nodes = value;
    }

    @useRef()
    private _targets?: Array<StoreNode | undefined> = [];
    public get targets() { return this._targets; }
    public set targets(value: Array<StoreNode | undefined> | undefined) {
        this._targets = value;
    }

    @useDep()
    private _transient = 'local';
    public get transient() { return this._transient; }

    @useMemo()
    public get summary() { return `${this.label}:${this.value}`; }
}

/** Handwritten payloads verify load independently of save. */
function config(uuid: string, fields: Record<string, any> = {}) {
    return {
        uuid,
        type: 'store-test-node',
        _label: uuid,
        _value: 0,
        _nodes: [],
        _target: undefined,
        _targets: [],
        ...fields,
    };
}

function load(value: unknown): StoreNode {
    const model = storeService.load(value);
    expect(model).toBeInstanceOf(StoreNode);
    if (!(model instanceof StoreNode)) {
        throw new Error('Expected a restored StoreNode.');
    }
    return model;
}

function tree() {
    const root = new StoreNode();
    const first = new StoreNode();
    const second = new StoreNode();
    const leaf = new StoreNode();
    root.label = 'root';
    root.value = false;
    root.child = leaf;
    root.nodes = [first, undefined, second];
    root.target = root;
    root.targets = [first, undefined, first, second];
    first.target = second;
    second.target = root;
    leaf.target = first;
    return { root, first, second, leaf };
}

describe('storeService', () => {
    it('saves state, owned children, and reference UUIDs', () => {
        const { root, first, second, leaf } = tree();
        const saved = storeService.save(root);

        expect(saved).toEqual(config(root.uuid, {
            _label: 'root',
            _value: false,
            _child: config(leaf.uuid, {
                _label: 'default',
                _value: 42,
                _target: first.uuid,
            }),
            _nodes: [
                config(first.uuid, {
                    _label: 'default',
                    _value: 42,
                    _target: second.uuid,
                }),
                undefined,
                config(second.uuid, {
                    _label: 'default',
                    _value: 42,
                    _target: root.uuid,
                }),
            ],
            _target: root.uuid,
            _targets: [first.uuid, undefined, first.uuid, second.uuid],
        }));
        expect(saved).not.toHaveProperty('_transient');
        expect(saved).not.toHaveProperty('summary');
        expect(saved).not.toHaveProperty('_parent');
        expect(saved).not.toHaveProperty('_root');
    });

    it.each([
        ['zero', 0],
        ['false', false],
        ['empty string', ''],
        ['null', null],
        ['undefined', undefined],
        ['object', { count: 3 }],
        ['array', [1, 2, 3]],
    ])('preserves %s state values', (_name, value) => {
        const source = new StoreNode();
        source.value = value;
        expect(storeService.save(source)._value).toEqual(value);

        const restored = load(config('state', { _value: value }));
        expect(restored.value).toEqual(value);
    });

    it('restores the full tree before binding forward and cyclic refs', () => {
        const payload = config('root', {
            _child: config('leaf', { _target: 'second' }),
            _nodes: [
                config('first', { _target: 'second' }),
                undefined,
                config('second', { _target: 'root' }),
            ],
            _target: 'root',
            _targets: ['first', undefined, 'first', 'second'],
        });
        const root = load(payload);
        const first = root.nodes[0]!;
        const second = root.nodes[2]!;
        const leaf = root.child!;

        expect(root.uuid).toBe('root');
        expect(first.uuid).toBe('first');
        expect(second.uuid).toBe('second');
        expect(leaf.uuid).toBe('leaf');
        expect(first).toBeInstanceOf(StoreNode);
        expect(second).toBeInstanceOf(StoreNode);
        expect(leaf).toBeInstanceOf(StoreNode);
        expect(root.nodes).toHaveLength(3);
        expect(root.nodes[1]).toBeUndefined();
        expect(root.parent).toBeUndefined();
        expect(root.root).toBe(root);
        for (const child of [first, second, leaf]) {
            expect(child.parent).toBe(root);
            expect(child.root).toBe(root);
        }
        expect(first.target).toBe(second);
        expect(second.target).toBe(root);
        expect(leaf.target).toBe(second);
        expect(root.target).toBe(root);
        expect(root.targets).toEqual([first, undefined, first, second]);
        expect(root.targets?.[0]).toBe(first);
        expect(root.targets?.[2]).toBe(first);
    });

    it('round trips through JSON without reusing original models', () => {
        const { root, first, second, leaf } = tree();
        const saved = storeService.save(root);
        const payload = JSON.parse(JSON.stringify(saved));
        const restored = load(payload);

        expect(restored).not.toBe(root);
        expect(restored.uuid).toBe(root.uuid);
        expect(restored.child).not.toBe(leaf);
        expect(restored.nodes[0]).not.toBe(first);
        expect(restored.nodes[2]).not.toBe(second);
        expect(restored.target).toBe(restored);
        expect(restored.child?.target).toBe(restored.nodes[0]);
        expect(restored.nodes[0]?.target).toBe(restored.nodes[2]);
        expect(restored.nodes[2]?.target).toBe(restored);
        expect(restored.nodes[1]).toBeUndefined();
        expect(restored.targets?.[1]).toBeUndefined();
        const output = JSON.stringify(storeService.save(restored));
        expect(JSON.parse(output)).toEqual(payload);
    });

    it('keeps UUID lookup isolated between load calls', () => {
        const payload = config('root', {
            _nodes: [config('child', { _target: 'root' })],
            _target: 'child',
        });
        const first = load(payload);
        const second = load(payload);

        expect(second).not.toBe(first);
        expect(second.nodes[0]).not.toBe(first.nodes[0]);
        expect(first.target).toBe(first.nodes[0]);
        expect(second.target).toBe(second.nodes[0]);
        expect(second.nodes[0]?.target).toBe(second);
    });

    it('preserves ref array positions when UUIDs cannot be resolved', () => {
        const root = load(config('root', {
            _target: 'missing',
            _targets: ['missing', 'root', null, undefined],
        }));

        expect(root.target).toBeUndefined();
        expect(root.targets).toEqual([
            undefined, root, undefined, undefined,
        ]);
    });

    it('clears missing persisted fields and ignores unregistered fields', () => {
        const root = load({
            uuid: 'root',
            type: 'store-test-node',
            _transient: 'overwritten',
        });

        expect(root.label).toBeUndefined();
        expect(root.value).toBeUndefined();
        expect(root.child).toBeUndefined();
        expect(root.nodes).toBeUndefined();
        expect(root.target).toBeUndefined();
        expect(root.targets).toBeUndefined();
        expect(root.transient).toBe('local');
    });

    it('restores reactive state through setters', () => {
        const root = load(config('root', { _value: 3 }));
        expect(root.summary).toBe('root:3');

        root.value = 4;
        expect(root.summary).toBe('root:4');
    });

    it.each([
        undefined,
        null,
        false,
        'invalid',
        {},
        { uuid: 'root', type: 1 },
        { uuid: 1, type: 'store-test-node' },
        { uuid: 'root', type: 'store-test-unknown' },
    ])('returns undefined for invalid config %p', value => {
        expect(storeService.load(value)).toBeUndefined();
    });
});
