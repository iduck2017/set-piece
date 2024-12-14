import React from "react";
import { ModelComp } from ".";
import { BoardModel } from "@/model/board";
import { useModel } from "./use-model";
import { CardComp } from "./card";

export function BoardComp(props: {
    model: BoardModel
}) {
    const model = useModel(props.model);

    return <ModelComp 
        model={props.model} 
        menu={model.childList.map(child => (
            <CardComp key={child.uuid} model={child} />
        ))}
    />;
}

