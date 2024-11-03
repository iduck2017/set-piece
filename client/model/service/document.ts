import { IModel } from "..";
import { Game } from "../game";
import { Archieve, ARCHIEVE_SAVE_PATH } from "./archieve";
import { RawModelDefine } from "../../type/define";
import { Service } from ".";
import { App } from "../app";

export type DocumentDefine = 
    RawModelDefine<{
        stateMap: {
            name: string,
            time: number
            animalCnt: number,
        },
        referMap: {
            
            isPlaying: boolean,
            savePath: string,
        }
        parent: Archieve,
        type: 'document'
    }>


@IModel.useProduct('document')
export class Document extends IModel<
    DocumentDefine
> {
    constructor(
        config: Document['config'],
        parent: Archieve
    ) {
        super({
            ...config,
            stateMap: {
                name: '',
                time: 0,
                animalCnt: 0,
                ...config.stateMap
            },
            referMap: {
                isPlaying: false,
                savePath: ''
            },
            childMap: {}
        }, parent);
    }

    @IModel.useLoader()
    private async _onload() {
        this.parent.stateModEventMap.curDocument.bind(this, ({ next }) => {
            this._rawReferMap.isPlaying = Boolean(next);
        });
        this._rawReferMap.savePath = `${ARCHIEVE_SAVE_PATH}_${this.code}`;
    }

    @IModel.useDebugger()
    @IModel.useValidator(model => !model._rawReferMap.isPlaying)
    async remove() {
        this.parent.remove(this);
        await localStorage.removeItem(this._rawReferMap.savePath);
        await Service.main.save();
    }
    

    @IModel.useDebugger()
    @IModel.useValidator(model => !model._rawReferMap.isPlaying)
    async start() {
        const raw = await localStorage.getItem(this._rawReferMap.savePath);
        if (!raw) {
            throw new Error('Save data not found.');
        }
        const config: Game['config'] = JSON.parse(raw);
        this.parent.start(this);
        App.main.start(config);
    }

    
    async update() {
        
    }
}