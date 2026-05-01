import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { depManager } from "../dep/dep-manager";
import { useMemo } from "./use-memo";
import { useModel } from "../use-model";

@useModel('foo')
export class FooModel extends Model {
    constructor(level: number) {
        super();
        this.level = level;
    }

    @useDep()
    public kelvin: number = 3

    @useDep()
    public child?: FooModel;


    public level: number;

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
    get celsius() {
        return this.kelvin - 273
    }
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