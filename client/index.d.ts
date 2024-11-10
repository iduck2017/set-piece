import { App } from "./model/app";

declare global {
    interface Window { 
        app: App;        
    }
}