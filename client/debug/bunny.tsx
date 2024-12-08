import React from "react";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { Link, State } from "./common";
import { BunnyModel } from "@/model/bunny";
import { Gender } from "@/model/reproductive";

export function BunnyComp(props: {
    model: BunnyModel
}) {
    const { model } = props;
    const [ state, child ] = useModel(model);
    const [ reproductiveState, reproductiveChild ] = useModel(child.reproductive);

    return <ModelComp
        model={model}
        form={
            <>
                {reproductiveState.gender === Gender.Female && 
                    <div className="link" onClick={() => {
                        child.reproductive.reproduce({ code: 'bunny' });
                    }}>
                        reproduce
                    </div>
                }
                <Link model={model} action="growup" />
                <Link model={child.metabolic} action="digest" />
                <State model={child.metabolic} />
                <State model={child.reproductive} />
            </>
        }
        menu={
            <>
                {reproductiveChild.map(child => (
                    <BunnyComp key={child.uuid} model={child} />
                ))}
            </>
        }
    />;
}
