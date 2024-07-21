import type { App } from "../app";
import { BaseFunc, BaseData } from "../types/base";
import { ChildUpdateDoneEvent, DataUpdateDoneEvent } from "../types/events";
import { BaseCalc, BaseModel } from "../types/model";
import { Renderer } from "./base";
import React from "react";

export class DebugRenderer extends Renderer<{
    dataUpdateDone : DataUpdateDoneEvent
    childUpdateDone: ChildUpdateDoneEvent
}> {
    private readonly $setChildren: React.Dispatch<React.SetStateAction<BaseModel[]>>;
    private readonly $setData    : React.Dispatch<React.SetStateAction<BaseData>>;

    constructor(config: {
        app        : App
        setData    : BaseFunc,
        setChildren: BaseFunc
    }) {
        const onDataUpdateDone = (data: { target: BaseCalc }) => {
            this.$setData(data.target.cur);
        };
        const onChildUpdateDone = (data: { target: BaseModel }) => {
            this.$setChildren(data.target.children);
        };

        super({
            app  : config.app,
            event: { 
                dataUpdateDone : onDataUpdateDone,
                childUpdateDone: onChildUpdateDone
            }
        });

        this.$setData = config.setData;
        this.$setChildren = config.setChildren;
    }

    public active(target: BaseModel) {
        target.bind('dataUpdateDone', this.$recv);
        target.bind('childUpdateDone', this.$recv);
    }
    
    public deactive() {
        this.$recv.dispose();
    }
}