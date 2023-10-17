import { direction, size } from "@/types/translation";
import { ApplicationMode } from "../types/applicationMode";
import { Painter } from "./painter";
import { Snake } from "./snake";
import moment from "moment";
import { Coin } from "./coin";
import { Log } from "@/facade/Logger";

interface creationalApplication{
    aux: HTMLCanvasElement,
    main: HTMLCanvasElement
}

class Application extends Painter{
    private static app: Application|undefined;

    public _lastRefresh: number = 0;
    private readonly speedRatio = 200;
    
    private _status: ApplicationMode;
    private _snake: Snake = new Snake();
    private _coin: Coin = new Coin();
    private _speed: number = 1.5;
    private _square: number = 15;
    private _container: size = {
        width: 300,
        height: 300
    }

    private _gameIsRunning: boolean = false

    constructor(){
        super()
        this._status = ApplicationMode.dev
    }

    public static getInstance(){
        if(Application.app) return Application.app
        const app = new Application()
        this.app = app
        return app
    }

    public restart(){
        this.drawInitial()
        this.isRuning = true
    }

    public refresh(){
        const ctx = app()
        const current = moment().valueOf()
        if(current - ctx._lastRefresh <= app().speed){
            requestAnimationFrame(ctx.refresh)
            return
        }
        if(app().snake.validateCollition() && !app().snake.bonus){
            Log.info('Self Collition')
            console.log(app().snake.collides)
            return
        }
        app().snake.bonus = false
        ctx.clearCanvas()
        ctx.drawSnake()
        ctx.drawCoin()

        ctx._lastRefresh = current
        if(app().isRuning)
            requestAnimationFrame(ctx.refresh)
    }

    public registerCoinCollition(){
        const ctx = app()
        ctx.coin.createNew()
    }

    get mode(): ApplicationMode{
        return this._status
    }
    set mode(mode: ApplicationMode){
        this._status = mode
    }

    get wrapper(): HTMLCanvasElement{
        return this._wrapper
    }
    set wrapper(wrapper: HTMLCanvasElement){
        this._wrapper = wrapper
    }

    get wrapperAux(): HTMLCanvasElement{
        return this._auxWrapper
    }
    set wrapperAux(wrapper: HTMLCanvasElement){
        this._auxWrapper = wrapper
    }

    get coin(){
        return this._coin
    }
    get snake(){
        return this._snake
    }
    set snakeDirection(direction: direction){
        this._snake[direction]()
    }

    get square(){
        return this._square
    }
    get container(){
        return this._container
    }

    set isRuning(status: boolean){
        this._gameIsRunning = status
    }
    get isRuning(){
        return this._gameIsRunning
    }

    get speed(){
        return this.speedRatio / this._speed
    }
}

export const app = (wrappers?: creationalApplication) => {
    const application = Application.getInstance();
    if(wrappers){
        application.wrapper = wrappers.main;
        application.wrapperAux = wrappers.aux;
        application.recoverContext()
    }

    return application
}
