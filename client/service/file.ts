import { Demo } from "@/model/demo";
import { ChunkOf } from "@/type/model";

export class File {
    static async load(): Promise<ChunkOf<Demo>> {
        const result = await localStorage.getItem("demo");
        if (result) {
            return JSON.parse(result);
        }
        return { code: 'demo' };
    }

    static async save(data: ChunkOf<Demo>): Promise<void> {
        await localStorage.setItem(
            "demo", 
            JSON.stringify(data)
        );
    }

    private constructor() {}
}