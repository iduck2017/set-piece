import { Model } from "@/model.bk";
import { Demo } from "@/model.bk/demo";
import { ChunkOf, CodeOf } from "@/type/define";

export class File {
    static async load<T extends Model>(code: CodeOf<T>): Promise<ChunkOf<T>> {
        const result = await localStorage.getItem(code);
        if (result) {
            return JSON.parse(result);
        }
        return { code };
    }

    static async save<T extends Model>(target: T): Promise<void> {
        await localStorage.setItem(
            target.code, 
            JSON.stringify(target.chunk)
        );
    }

    private constructor() {}
}