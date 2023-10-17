import { Vector, position } from "@/types/translation";
import { app } from "./context";
import { Log } from "@/facade/Logger";

export class Snake {
    // x,y
    private _direction: Vector = [0, 1]
    private _position: position = { x: 90, y: 90, z: 0 }
    private _length: number = 3
    private _path: position[] = []
    private _justBonus: boolean = false

    public collides: position[] = []

    public up() {
        if(this._direction[1] == 1) {
            Log.error('failed')
        }
        this._direction = [0, -1]
    }
    public down() {
        if(this._direction[1] == -1) {
            Log.error('failed')
        }
        this._direction = [0, 1]
    }
    public left() {
        if(this._direction[0] == 1) {
            Log.error('failed')
        }
        this._direction = [-1, 0]
    }
    public right() {
        if(this._direction[0] == -1) {
            Log.error('failed')
        }
        this._direction = [1, 0]
    }

    public nextStep() {
        const bounds = app().container
        this.eatCollition()
        

        const x = this._direction[0]
        const y = this._direction[1]
        if(x != 0){
            this._position.x += x * app().square
        }
        if(y != 0){
            this._position.y += y * app().square
        }

        if ((this.position.x + app().square) > bounds.width) {
            this._position.x = 0
        }
        if ((this.position.y + app().square) > bounds.height) {
            this._position.y = 0
        }


        if ((this.position.x) <= -app().square) {
            this._position.x = bounds.width -app().square
        }
        if ((this.position.y) <= -app().square) {
            this._position.y = bounds.height -app().square
        }
        this.buildPath()
    }

    private eatCollition(){
        const ctx = app()
        if(this.position.x == ctx.coin.position.x && 
            this.position.y == ctx.coin.position.y){
                ctx.registerCoinCollition()
                Log.info('collition')
                this.bonus = true
                this._length++
            }
    }

    private buildPath() {
        this._path.push({ ...this._position })

        if(this._path.length > this._length)
            this._path.shift()!
    
    }

    public validateCollition(){
        const head = this._path[this._path.length -1]

        this.collides = this._path.filter((pos) => pos.x == head.x && pos.y == head.y)
        return this.collides.length > 1
    }

    get howToDraw() {
        return this._path
    }

    get position() {
        return this._position
    }

    set bonus(status: boolean){
        this._justBonus = status
    }
    get bonus(){
        return this._justBonus
    }
}