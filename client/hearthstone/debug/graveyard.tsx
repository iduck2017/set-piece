import React from "react";
import { ModelComp } from ".";
import { CardComp } from "./card";
import { useModel } from "./use-model";
import { GraveyardModel } from "../models/graveyard";

export function GraveyardComp(props: {
    model: GraveyardModel
}) {
    const model = useModel(props.model);

    return <ModelComp 
        isFold
        model={props.model} 
        form={
            <>
            </>
        }
        menu={
            <>
                {model.childList.map((child) => (
                    <CardComp model={child} key={child.uuid} />
                ))}
            </>
        }
    />;
}
