import { Model } from "..";
import { Game } from "../game";
import { ARCHIEVE_SAVE_PATH } from "./archieve";
import { App } from "../app";
import { RawModelDefine } from "../../type/define";

export type DocumentDefine = 
    RawModelDefine<{
        stateMap: {
            name: string,
            time: number
            animalCnt: number,
        },
        type: 'document'
    }>


@Model.useProduct('document')
export class Document extends Model<
    DocumentDefine
> {
    constructor(
        config: Document['config'],
        parent: Document
    ) {
        super({
            ...config,
            stateMap: {
                name: '',
                time: 0,
                animalCnt: 0,
                ...config.stateMap
            },
            childMap: {}
        }, parent);
    }

    get savePath() {
        return `${ARCHIEVE_SAVE_PATH}_${this.code}`;
    }

    @Model.useDebug()
    async load() {
        const raw = await localStorage.getItem(this.savePath);
        if (!raw) throw new Error();
        const config: Game['config'] = JSON.parse(raw);
        await App.main.start(config);
    }

    @Model.useDebug()
    async remove() {
        await localStorage.removeItem(this.savePath);
        this._unmount();
    }

    
    @Model.useDebug()
    async save() {
        const record = App.game.config;
        this._rawStateMap.time = record.stateMap?.time || 0;
        this._rawStateMap.animalCnt = record.childSet?.length || 0;
        await localStorage.setItem(
            this.savePath, 
            JSON.stringify(record)
        );
        await App.service.save();
    }


    @Model.useDebug()
    async quit() {
        this.save();
        App.main.quit();
    }
}