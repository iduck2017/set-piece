import React from "react";
import { ModelComp } from ".";
import { GraveyardModel } from "@/model/graveyard";
import { CardComp } from "./card";
import { useModel } from "./use-model";

export function GraveyardComp(props: {
    model: GraveyardModel
}) {
    const model = useModel(props.model);

    return <ModelComp 
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
