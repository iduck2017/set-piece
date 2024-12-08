// import React, { useEffect } from "react";
// import { useModel } from "./use-model";
// import { ModelComp } from ".";
// import { Demo } from "@/model.bk/demo";
// import { Ping } from "@/model.bk/ping";
// import './index.css';
// import { BunnyComp } from "./bunny";
// import { PingsComp } from "./ping";
// import { PongsComp } from "./pong";
// import { Game } from "@/model.bk/game";
// import { PlayerComp } from "./player";

// export function GameComp(props: {
//     game: Game
// }) {
//     const { game } = props;
//     const [ state, child ] = useModel(game);

//     return <ModelComp 
//         model={game}
//         form={
//             <>
//             </>
//         }
//         menu={
//             <>
//                 <PlayerComp player={child.redPlayer} />
//                 <PlayerComp player={child.bluePlayer} />
//             </>
//         }
//     />;
// }

