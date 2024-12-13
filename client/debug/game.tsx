import React from "react";
import { ModelComp } from ".";
import { GameModel } from "@/model/game";

export function GameComp(props: {
    model: GameModel
}) {
    const { model } = props;

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

