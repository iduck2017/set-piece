import React from "react";
import { DemoModel } from "@/model/demo";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { BunnyComp } from "./bunny";
import { PingPongComp } from "./ping-pong";

export function DemoComp(props: {
    model: DemoModel
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
                {model.childDict.bunny && <BunnyComp model={model.childDict.bunny} />}
                {model.childDict.pingPong && <PingPongComp model={model.childDict.pingPong} />}
            </>
        }
    />;
}
