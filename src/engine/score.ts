import { Log } from "@/facade/Logger"
import { application } from "./context"

class Score{
    private static _instance: Score

    constructor(){

    }

    public static getInstance(){
        if(Score._instance) return Score._instance
        const score = new Score()
        this._instance = score
        return score
    }

    public addPoint(){
        application.points++
        Log.info('adding point', application.points)
    }

    public restore(){
        application.points = 0
    }

    get points(){
        return application.points
    }
}

export const score = () => {
    return Score.getInstance()
}