import React from "react";
import { BaseModel } from "../types/model";

export function ModelRender(model: BaseModel) {
    return <div id={model.referId}>
        <span>{model.constructor.name}</span>
    </div>;
}