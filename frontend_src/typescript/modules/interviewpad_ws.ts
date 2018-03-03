import {SimpleWebsocket} from "./websocketio";

class User{
    id:number;
    nickname:string;
    email:string;
    is_admin:boolean;
    user_color:string;
}
class Room{
    id:number;
    room_name:string;
    program_text:string;
    users:User[];
}
export class AuthWebsocket extends SimpleWebsocket{
    private auth_token:string;
    private user:User=null;
    private room:Room=null;
    private auth_handshake(){
        super.emit("handshake",this.auth_token);
    }
    emit($eventType:string,$payload:any,sendAuth:boolean=true){
        if(!this.user || !this.room){
            console.log("No authorization ... dont send")
        }
        $payload['auth'] = {auth_token:this.auth_token,user_id:this.user.id,room_id:this.room.id}
        super.emit($eventType,$payload);
    }
    constructor(auth_token:string){
        super();
        this.auth_token=auth_token;
        this.on("connect",()=>this.auth_handshake())
        this.on("handshake_accepted",(payload:{room:Room,user:User})=>{
            this.user = payload.user;
            this.room = payload.room;
            console.log("User Authenticated!")
        })
    }


}