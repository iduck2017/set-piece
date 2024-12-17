import React from "react";
import { createRoot } from "react-dom/client";
import { AppComp } from "./debug/app";
import { AppModel } from "./models/app";

async function main() {
    const element = document.getElementById("root");
    if (!element) {
        throw new Error("Could not find app element");
    }
    createRoot(element).render(<AppComp model={AppModel.core} />);
}

main();