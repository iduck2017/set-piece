import { Model } from "@/model";
import { Demo } from "@/model/demo";
import { ChunkOf, CodeOf } from "@/type/model";

export class File {
    private static _isSaving = false; 
    static get isSaving() {
        return File._isSaving;
    }

    static async load<T extends Model>(code: CodeOf<T>): Promise<ChunkOf<T>> {
        const result = await localStorage.getItem(code);
        if (result) {
            return JSON.parse(result);
        }
        return { code };
    }

    static async save<T extends Model>(target: T): Promise<void> {
        File._isSaving = true;
        await localStorage.setItem(
            target.code, 
            JSON.stringify(target.chunk)
        );
        File._isSaving = false;
    }

    private constructor() {}
}