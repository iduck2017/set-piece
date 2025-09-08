import { Method } from "../types";

export class StoryUtil {
    private static _isLock = false;
    public static get isLock() { return StoryUtil._isLock; }

    private static tasks: Method<void>[] = [];

    public static span() {
        return function(
            prototype: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Method>
        ) {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: unknown, ...args: any[]) {
                    const isLock = StoryUtil._isLock;
                    const tasks = [...StoryUtil.tasks];
                    if (!isLock) StoryUtil._isLock = true;
                    const result = handler.call(this, ...args);
                    while (StoryUtil.tasks.length) {
                        const tasks = [...StoryUtil.tasks];
                        StoryUtil.tasks = [];
                        tasks.forEach(task => task())
                    }
                    if (!isLock) StoryUtil._isLock = false;
                    StoryUtil.end(tasks)
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }


    public static then() {
        return function(
            prototype: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Method<void>>
        ): TypedPropertyDescriptor<Method<void>> {
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

    private static end(tasks: Method<void>[]) {
        StoryUtil.tasks = tasks;
    }
}