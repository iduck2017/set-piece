import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./model/app";
import { AppComp } from "./debug/app";

async function main() {
    const element = document.getElementById("root");
    if (!element) {
        throw new Error("Could not find app element");
    }
    createRoot(element).render(<AppComp model={App.main} />);
}

main();