import { asChild } from "../child/as-child";
import { asCustomChild } from "../child/as-custom-child";
import { Model } from "../model";
import { asRoute } from "./as-route";

export class PineappleModel extends Model {
    @asRoute(() => TruckModel)
    private _truck?: TruckModel;
    public get truck() {
        return this._truck;
    }
}

export class BoxModel extends Model {
    @asRoute(() => TruckModel)
    private _truck?: TruckModel;
    public get truck() {
        return this._truck;
    }

    @asChild()
    private _pineapple?: PineappleModel;
    public get pineapple() {
        return this._pineapple;
    }

    public putPineapple(pineapple: PineappleModel) {
        this._pineapple = pineapple;
    }
    public takePineapple() {
        this._pineapple = undefined;
    }
}

export class TruckModel extends Model {
    @asChild()
    private _box?: BoxModel;
    public get box() {
        return this._box;
    }
    public loadBox(box: BoxModel) {
        this._box = box;
    }
    public unloadBox() {
        this._box = undefined;
    }
}


describe('route', () => {
    const truck = new TruckModel();
    const box = new BoxModel();
    const pineapple = new PineappleModel();

    it('check-root', () => {
        expect(truck.root).toBe(truck);
        expect(box.root).toBe(box);
        expect(pineapple.root).toBe(pineapple);
    });

    it('check-parent', () => {
        expect(truck.parent).toBeUndefined();
        expect(box.parent).toBeUndefined();
        expect(pineapple.parent).toBeUndefined();
    });

    it('put-pineapple', () => {
        box.putPineapple(pineapple);
        expect(box.root).toBe(box);
        expect(pineapple.root).toBe(box);
        
        expect(pineapple.parent).toBe(box);

        expect(box.truck).toBe(undefined);
        expect(pineapple.truck).toBe(undefined);
    })

    it('load-box', () => {
        console.log('Load box');
        truck.loadBox(box);
        expect(truck.root).toBe(truck);
        expect(box.root).toBe(truck);
        expect(pineapple.root).toBe(truck);
        
        expect(truck.parent).toBeUndefined();
        expect(box.parent).toBe(truck);
        expect(pineapple.parent).toBe(box);

        expect(box.truck).toBe(truck);
        expect(pineapple.truck).toBe(truck);
    })

    it('unload-box', () => {
        truck.unloadBox();
        expect(truck.root).toBe(truck);
        expect(box.root).toBe(box);
        expect(pineapple.root).toBe(box);
        
        expect(box.truck).toBeUndefined();
        expect(pineapple.truck).toBeUndefined();
    })

});