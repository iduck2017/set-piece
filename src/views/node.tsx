import React from "react";
import { BaseModel } from "../types/model";

export function ModelRender(entity: BaseModel) {
    return <div>
        <span>{entity.modelID}</span>
    </div>;
}