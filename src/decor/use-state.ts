import { Decor } from ".";
import { useDep } from "../dep/use-dep";
import { Model } from "../model";

export function useState<
    M extends Model & Record<string, any>,
    K extends string,
>() {
    return function(
        prototype: M,
        key: K,
    ) {
        useDep()(prototype, key);
    }
}
