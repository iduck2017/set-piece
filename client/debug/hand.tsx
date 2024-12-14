import React from "react";
import { HandModel } from "@/model/hand";
import { ModelComp } from ".";
import { CardComp } from "./card";
import { useModel } from "./use-model";

export function HandComp(props: {
    model: HandModel
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
