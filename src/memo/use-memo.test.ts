import { Model } from "../model";
import { useModel } from "../hooks/use-model";
import { depManager } from "../dep/dep-manager";
import { useMemo } from "../hooks/use-memo";
import { useDep } from "../hooks/use-dep";

@useModel('foo')
export class FooModel extends Model {
    constructor(level?: number) {
        super();
        this._level = level ?? 1;
    }

    @useDep()
    private _kelvin: number = 3
    public get kelvin() { return this._kelvin; }
    public set kelvin(value: number) { this._kelvin = value; }

    @useDep()
    private _child?: FooModel;
    public get child() { return this._child; }
    public set child(value: FooModel | undefined) { this._child = value; }

    private _level: number;
    public get level() { return this._level; }

    @useMemo()
    get descendant(): FooModel {
        return this.child?.descendant ?? this;
        // let descendant: FooModel | undefined = this;
        // while (descendant?.child) {
        //     descendant = descendant.child;
        // }
        // console.log('Get descendant', descendant);
        // return descendant;
    }

    @useMemo()
    get celsius() { return this.kelvin - 273 }
}


describe('demo', () => {

    it('check descendants', () => {
        const foo = new FooModel(1);
        const fooL2 = new FooModel(2);
        const fooL3 = new FooModel(3);
        expect(foo.descendant).toBe(foo)
        foo.child = fooL2;
        expect(foo.descendant).toBe(fooL2);
        fooL2.child = fooL3;
        expect(foo.descendant).toBe(fooL3);
        expect(fooL3.descendant).toBe(fooL3);
        expect(fooL2.descendant).toBe(fooL3);
    })
})
