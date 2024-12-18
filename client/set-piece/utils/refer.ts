import { Base, Model } from "@/set-piece";

export class NodeRefer {
    private readonly _parent: Model;

    constructor(parent: Model) {
        this._parent = parent;
    }

    protected queryParent<T extends Model>(
        Type?: Base.Class<T>,
        validator?: ((model: Model) => boolean)
    ): T | undefined {
        let target: Model | undefined = this._parent;
        while (target) {
            const flag = 
                (!Type || target instanceof Type) &&
                (!validator || validator(target));
            if (flag) {
                const result: any = target;
                return result;
            }
            target = target.parent;
        }
        return undefined;
    }
}
