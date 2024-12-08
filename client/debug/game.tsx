import React from "react";
import { ModelComp } from ".";
import { useModel } from "./use-model";
import { GameModel } from "@/model/game";

export function GameComp(props: {
    model: GameModel
}) {
    const { model } = props;
    const [ state, child ] = useModel(model);

    return <ModelComp
        model={model}
        form={
            <>
            </>
        }
        menu={
            <>
                {/* {child.pings && <PingsComp pings={child.pings} />}
                {child.pongs && <PongsComp pongs={child.pongs} />}
                {child.bunny && <BunnyComp bunny={child.bunny} />} */}
            </>
        }
    />;
}

