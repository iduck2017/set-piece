import { App } from "./model.bk/app";

declare global {
    interface Window { 
        app: App;        
    }
}