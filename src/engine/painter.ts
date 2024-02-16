import { app } from "./context";

export class Painter {
    protected _auxWrapper: HTMLCanvasElement = document.createElement('canvas');
    protected _wrapper: HTMLCanvasElement = document.createElement('canvas');

    private _ctx: CanvasRenderingContext2D;
    private _ctxAux: CanvasRenderingContext2D;

    constructor() {
        this._ctx = this._wrapper.getContext('2d')!
        this._ctxAux = this._auxWrapper.getContext('2d')!
    }

    public recoverContext() {
        const context = app().container
        this._wrapper.width = context.width
        this._wrapper.height = context.height

        this._ctx = this._wrapper.getContext('2d')!
        this._ctxAux = this._auxWrapper.getContext('2d')!
    }

    protected clearCanvas() {

        this._ctx.clearRect(0, 0, app().container.width, app().container.height);
    }

    protected drawInitial() {
        this.clearCanvas()
        this.drawSnake()
    }

    protected drawSnake() {
        
        
        const ctx = app()
        const snake = ctx.snake
        snake.nextStep()
        const square = ctx.square
        for(const point of snake.howToDraw){
            this._ctx.fillStyle = "blue";
            this._ctx.fillRect(point.x, point.y, square, square);

    
            this._ctx.strokeStyle = "white";
            this._ctx.lineWidth = 2
            this._ctx.strokeRect(point.x, point.y, square, square);
        }

        
        
    }

    protected drawCoin(){
        const ctx = app()
        const coin = ctx.coin
        const square = ctx.square
        this._ctx.fillStyle = "green";
        this._ctx.fillRect(coin.position.x, coin.position.y, square, square);

        this._ctx.strokeStyle = "white";
        this._ctx.lineWidth = 2
        this._ctx.strokeRect(coin.position.x, coin.position.y, square, square);
    }
}