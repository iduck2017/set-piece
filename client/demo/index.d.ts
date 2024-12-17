import { AppModel } from "./models/app";

declare global {
    interface Window { 
        app: AppModel;        
    }
}