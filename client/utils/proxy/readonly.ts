import { Base } from "../../type";

export function ReadonlyProxy<T extends Base.Dict>(
    origin: T
): Readonly<T> {
    return new Proxy(origin, {
        set: () => false,
        deleteProperty: () => false
    });
}