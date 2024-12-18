import React from "react";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { Link, State } from "./common";
import { BunnyModel } from "../models/bunny";
export function BunnyComp(props: {
    model: BunnyModel
}) {
    const model = useModel(props.model);
    const reproductive = useModel(model.childDict.reproductive);

    return <ModelComp
        model={props.model}
        form={
            <>
                <Link model={props.model} action="growup" />
                <State model={model.childDict.reproductive} />
            </>
        }
        menu={
            <>
                {reproductive.childList.map(child => (
                    <BunnyComp key={child.uuid} model={child} />
                ))}
            </>
        }
    />;
}
