import React from "react";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { CardComp } from "./card";
import { Link } from "./common";
import { BoardModel } from "../models/board";

export function BoardComp(props: {
    model: BoardModel
}) {
    const model = useModel(props.model);

    return <ModelComp 
        model={props.model} 
        form={
            <Link model={props.model} action='randomAttack' />
        }
        menu={model.childList.map(child => (
            <CardComp key={child.uuid} model={child} />
        ))}
    />;
}

