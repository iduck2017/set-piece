import React from "react";
import { DemoModel } from "@/model/demo";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { Link } from "./common";
import { BunnyComp } from "./bunny";

export function DemoComp(props: {
    model: DemoModel
}) {
    const { model } = props;
    const [ state, child ] = useModel(model);

    return <ModelComp
        model={model}
        form={
            <>
                <Link model={model} action="count" />
            </>
        }
        menu={
            <>
                {child.bunny && <BunnyComp model={child.bunny} />}
            </>
        }
    />;
}
