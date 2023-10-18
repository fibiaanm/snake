import { position, size } from "@/types/translation";
import { app } from "./context";
import { Log } from "@/facade/Logger";

export class Coin{

    private _position: position = {
        x: 0,
        y: 0,
        z: 0
    }

    constructor(container: size, square: number){
        let x = container.width / square
        let y = container.height / square
        this._position.x = Math.floor(Math.random() * x) * square
        this._position.y = Math.floor(Math.random() * y) * square
    }

    public createNew(){
        let x = app().container.width / app().square
        let y = app().container.height / app().square
        this._position.x = Math.floor(Math.random() * x) * app().square
        this._position.y = Math.floor(Math.random() * y) * app().square
        const collide = app().snake.path.filter((step) => step.x == this._position.x && step.y == this._position.y)

        if(collide.length == 0) return
        Log.info('Re-draw coin')
        this.createNew()
    }


    get position(){
        return this._position
    }
}