import React from "react";
import { Bunny } from "@/model/bunny";
import { ModelComp } from ".";
import { Link } from "./common";
import { useModel } from "./use-model";

export function BunnyComp(props: {
    bunny: Bunny
}) {
    const { bunny } = props;
    const [ state, child ] = useModel(bunny);

    return <ModelComp
        model={bunny}
        form={
            <>
                <Link model={bunny} name="reproduce" />
                <Link model={bunny} name="growup" />
            </>
        }
        menu={
            <>
                {child.map(item => (<BunnyComp key={item.uuid} bunny={item} />))}
            </>
        }
    />;
}