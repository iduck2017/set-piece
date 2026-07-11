import { useDep } from "../dep/dep-registry";
import { Model, useModel } from "../model";
import { useEffect } from "./effect-registry";

@useModel('effect-demo')
class EffectModel extends Model {
    @useDep()
    public count = 1;

    public records: number[] = [];

    @useEffect()
    private recordCount() {
        this.records.push(this.count);
    }
}

describe('useEffect', () => {
    it('runs effect during action flush', () => {
        const model = new EffectModel();

        expect(model.records).toEqual([1]);

        model.count = 2;
        expect(model.records).toEqual([1, 2]);
    });
});
