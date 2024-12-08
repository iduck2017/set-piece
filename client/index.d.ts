import { AppModel } from "@/model/app";

declare global {
    interface Window { 
        app: AppModel;        
    }
}