import { Model } from "@/model";
import { Demo } from "@/model/demo";
import { ChunkOf, CodeOf } from "@/type/model";

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