import { useChild } from "../child/use-child";
import { useCustomChild } from "../child/use-custom-child";
import { Model } from "../model";
import { useRoute } from "./use-route";

export class PineappleModel extends Model {
    @useRoute(() => TruckModel)
    private _truck?: TruckModel;
    public get truck() {
        return this._truck;
    }
}

export class BoxModel extends Model {
    @useRoute(() => TruckModel)
    private _truck?: TruckModel;
    public get truck() {
        return this._truck;
    }

    @useChild()
    private _pineapple?: PineappleModel;
    public get pineapple() {
        return this._pineapple;
    }

    public setPineapple(pineapple: PineappleModel) {
        this._pineapple = pineapple;
    }
    public removePineapple() {
        this._pineapple = undefined;
    }
}

export class TruckModel extends Model {
    @useChild()
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


describe('use-route', () => {
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
        box.setPineapple(pineapple);
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