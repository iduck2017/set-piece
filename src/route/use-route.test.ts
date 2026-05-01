import { useChild } from "../child/use-child";
import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { useRoute } from "./use-route";

export class PineappleModel extends Model {
    @useRoute(() => RoomModel)
    private _room?: RoomModel;
    public get room() {
        return this._room;
    }
}

export class AppleModel extends Model {
    @useRoute(() => RoomModel)
    private _room?: RoomModel;
    public get room() {
        return this._room;
    }
}

function useRoomRoute<
    I extends Model & Record<string, any>,
    K extends string
>(): I[K] extends RoomModel | undefined ?
        undefined extends I[K] ?
            TypedPropertyDecorator<I, K> :
            TypedPropertyDecorator<never, never> :
        TypedPropertyDecorator<never, never>  {
    return function(
        prototype: I,
        key: K
    ) {
        useRoute(() => RoomModel)(prototype, key)
    }
}


export class BoxModel extends Model {
    @useRoomRoute()
    private _room?: RoomModel;
    public get room() {
        return this._room;
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

    @useChild()
    private _apples: AppleModel[] = [];
    public get apples() {
        return this._apples;
    }
    public addApple(apple: AppleModel) {
        this._apples.push(apple);
    }
    public removeApples() {
        this._apples = []
    }

}

export class RoomModel extends Model {
    @useChild()
    private _box?: BoxModel;
    public get box() {
        return this._box;
    }
    public addBox(box: BoxModel) {
        this._box = box;
    }
    public removeBox() {
        this._box = undefined;
    }
}



describe('use-route', () => {
    const room = new RoomModel();
    const box = new BoxModel();
    const pineapple = new PineappleModel();

    it('check-root', () => {
        expect(room.root).toBe(room);
        expect(box.root).toBe(box);
        expect(pineapple.root).toBe(pineapple);
    });

    it('check-parent', () => {
        expect(room.parent).toBeUndefined();
        expect(box.parent).toBeUndefined();
        expect(pineapple.parent).toBeUndefined();
    });

    it('put-pineapple', () => {
        box.setPineapple(pineapple);
        expect(box.root).toBe(box);
        expect(pineapple.root).toBe(box);
        
        expect(pineapple.parent).toBe(box);

        expect(box.room).toBe(undefined);
        expect(pineapple.room).toBe(undefined);
    })

    it('load-box', () => {
        console.log('Load box');
        room.addBox(box);
        expect(room.root).toBe(room);
        expect(box.root).toBe(room);
        expect(pineapple.root).toBe(room);
        
        expect(room.parent).toBeUndefined();
        expect(box.parent).toBe(room);
        expect(pineapple.parent).toBe(box);

        expect(box.room).toBe(room);
        expect(pineapple.room).toBe(room);
    })

    it('unload-box', () => {
        room.removeBox();
        expect(room.root).toBe(room);
        expect(box.root).toBe(box);
        expect(pineapple.root).toBe(box);
        
        expect(box.room).toBeUndefined();
        expect(pineapple.room).toBeUndefined();
    })

});