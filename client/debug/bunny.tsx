// import React from "react";
// import { Bunny } from "@/model.bk/bunny";
// import { ModelComp } from ".";
// import { Link } from "./common";
// import { useModel } from "./use-model";

// export function BunnyComp(props: {
//     bunny: Bunny
// }) {
//     const { bunny } = props;
//     const [ state, child ] = useModel(bunny);

//     return <ModelComp
//         model={bunny}
//         form={
//             <>
//                 <Link model={bunny} action="reproduce" />
//                 <Link model={bunny} action="growup" />
//             </>
//         }
//         menu={
//             <>
//                 {child.map(item => (<BunnyComp key={item.uuid} bunny={item} />))}
//             </>
//         }
//     />;
// }