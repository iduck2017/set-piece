import { Model } from "../model";
import { useEffect } from "../utils/use-effect";

export class FooModel extends Model {

    @useEffect(s => s.updateSum?.())
    private _values: number[] = [];
    public setValues(values: number[]) {
        this._values = values;
    }

    private _sum: number;
    public get sum() {
        return this._sum;
    }
    public updateSum() {
        console.log('updateSum', this._values);
        let result = 0;
        this._values.forEach(value => {
            result += value;
        });
        this._sum = result;
        return result;
    }

    constructor() {
        super();
        this._sum = this.updateSum();
    }
}

describe('effect', () => {
    const foo = new FooModel();

    it('set-values', () => {
        expect(foo.sum).toBe(0);
        foo.setValues([1, 2, 3]);
        expect(foo.sum).toBe(6);
    })
});