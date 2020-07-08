
export class WebSocketError extends Error {
    constructor(e?: string){
        super(e);
        Object.setPrototypeOf(this, WebSocketError.prototype);
    }
}