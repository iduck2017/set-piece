import { Func } from "../types";

export class StoryUtil {

    private static _isLock = false;
    public static get isLock() { return StoryUtil._isLock; }
    private static tasks: Func[] = [];

    public static then<T>() {
        return function(
            prototype: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Func<T | undefined>>
        ): TypedPropertyDescriptor<Func<T | undefined>> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: unknown, ...args: any[]) {
                    if (!StoryUtil._isLock) return handler.call(this, ...args);
                    StoryUtil.tasks.push(() => handler.call(this, ...args));
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

}