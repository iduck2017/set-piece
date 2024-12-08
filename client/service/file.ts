import { Model, NodeModel } from "@/model/node";

export class File {
    static async load<T extends NodeModel>(
        code: Model.Code<T>
    ): Promise<Model.Chunk<T>> {
        const result = await localStorage.getItem(code);
        if (result) {
            return JSON.parse(result);
        }
        return { code };
    }

    static async save<T extends NodeModel>(
        target: T
    ): Promise<void> {
        await localStorage.setItem(
            target.code, 
            JSON.stringify(target.chunk)
        );
    }

    private constructor() {}
}