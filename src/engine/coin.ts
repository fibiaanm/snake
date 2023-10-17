import { position } from "@/types/translation";
import { app } from "./context";

export class Coin{

    private _position: position = {
        x: 30,
        y: 90,
        z: 0
    }

    constructor(){
    }

    public createNew(){
        let x = app().container.width / app().square
        let y = app().container.height / app().square
        this._position.x = Math.floor(Math.random() * x) * app().square
        this._position.y = Math.floor(Math.random() * y) * app().square
    }


    get position(){
        return this._position
    }
}