import React from "react";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { CardComp } from "./card";
import { BoardModel } from "../models/board";
import { Link } from "./common";

export function BoardComp(props: {
    model: BoardModel
}) {
    const model = useModel(props.model);

    return <ModelComp 
        model={props.model} 
        form={<>
            <Link model={props.model} action='disposeMinion' />
        </>}
        menu={model.childList.map(child => (
            <CardComp key={child.uuid} model={child} />
        ))}
    />;
}

