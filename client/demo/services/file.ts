import { Model } from "@/set-piece";

export class FileService {
    static async loadChunk<T extends Model>(
        code: Model.Code<T>
    ): Promise<Model.Chunk<T>> {
        const result = await localStorage.getItem(code);
        if (result) {
            return JSON.parse(result);
        }
        return { code };
    }

    static async saveChunk<T extends Model>(target: T): Promise<void> {
        await localStorage.setItem(
            target.code, 
            JSON.stringify(target.chunk)
        );
    }

    private constructor() {}
}