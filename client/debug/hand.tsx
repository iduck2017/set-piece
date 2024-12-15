import React from "react";
import { HandModel } from "@/model/hearth/hand";
import { ModelComp } from ".";
import { CardComp } from "./card";
import { useModel } from "./use-model";
import { Link } from "./common";

export function HandComp(props: {
    model: HandModel
}) {
    const model = useModel(props.model);

    return <ModelComp 
        model={props.model} 
        form={
            <>
                <Link model={props.model} action="clearCardList" />
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
