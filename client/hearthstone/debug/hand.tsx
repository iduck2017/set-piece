import React from "react";
import { ModelComp } from ".";
import { CardComp } from "./card";
import { useModel } from "./use-model";
import { Link } from "./common";
import { HandModel } from "../models/hand";

export function HandComp(props: {
    model: HandModel
}) {
    const model = useModel(props.model);

    return <ModelComp 
        model={props.model} 
        form={
            <>
                <Link model={props.model} action='discardCard' />
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
