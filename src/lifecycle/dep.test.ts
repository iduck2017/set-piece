import { Model } from "../model";
import { useMemo } from "../state/use-memo";
import { useDep } from "./use-dep";

export class FooModel extends Model {
    @useDep(1)
    private _values: number[] = [1];
    public appendValue(value: number) {
        this._values.push(value);
    }
    public shiftValue() {
        return this._values.shift();
    }
    public clearValue() {
        this._values = [];
    }

    @useMemo()
    public get sum() {
        return this._values.reduce((acc, value) => acc + value, 0);
    }
}

describe('dependency', () => {
    const foo = new FooModel();

    it('check-initial-status', () => {
        expect(foo.sum).toBe(1);
    })

    it('append-value', () => {
        foo.appendValue(1);
        expect(foo.sum).toBe(2);
    })

    it('shift-value', () => {
        foo.shiftValue();
        expect(foo.sum).toBe(1);
    })

    it('clear-value', () => {
        foo.clearValue();
        expect(foo.sum).toBe(0);
    })
})