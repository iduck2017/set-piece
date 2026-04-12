import { useChild } from "../child/use-child";
import { Model } from "../model";
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

export class BoxModel extends Model {
    @useRoute(() => RoomModel)
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


const room = new RoomModel();
const box = new BoxModel();
const pineapple = new PineappleModel();
const apple = new AppleModel();

box.addApple(apple)
console.log(apple.room)
console.log(box.room);
console.log(apple.parent)

room.addBox(box);
console.log(box.parent)
console.log(box.room)
console.log(room.box)
console.log(apple.room)

box.setPineapple(pineapple)
console.log(pineapple.room);


room.removeBox()
console.log(box.room);
console.log(apple.room)
console.log(pineapple.room)
