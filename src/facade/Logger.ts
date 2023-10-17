import { app } from "../engine/context";
import { ApplicationMode } from "../types/applicationMode";

export class Log {
    
    public static info(...log:any){
        if(app().mode == ApplicationMode.dev)
            console.log(`[${app()._lastRefresh}]`,...log)
    }

    public static error(...log:any){
        console.error(`We will inform to support: `, ...log)
    }

}