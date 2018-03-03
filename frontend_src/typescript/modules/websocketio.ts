
class WebSocketIO{
    private io:any=null;
    private _pending_callbacks:{[$eventType:string]:Function} = {}
    connected:boolean=false;

    connect(uri:string,opts?:any){
        this.io = (window as any).io(uri,opts);
        for(let $evtType in this._pending_callbacks){
                console.log("Rebinding NOW:",$evtType);
                this.on($evtType,this._pending_callbacks[$evtType]);
        }
        this.connected = true;

    }
    on($eventType:string,$callBack:Function){
        if(this.io) {
            this.io.on($eventType, $callBack);
        }
        else{
            console.log("Bind Later:",$eventType);
            this._pending_callbacks[$eventType] = $callBack;
        }
    };
    emit($eventType:string,$payload:any){
        this.io.emit($eventType,$payload)
    }
}
export class SimpleWebsocket{
    private socket:WebSocketIO;
    constructor(uri?:string,opts?:{}){
        this.socket = new WebSocketIO();
        if(uri){this.connect(uri,opts);}
    }
    connect(uri:string,opts?:{}){
        this.socket.connect(uri,opts)
    }
    emit($eventType:string,$payload:{}){
        this.socket.emit($eventType,$payload)
    }
    on($eventType:string,$callBack:Function){
        this.socket.on($eventType,$callBack)
    }
}
