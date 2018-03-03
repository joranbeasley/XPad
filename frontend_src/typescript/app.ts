import {AceEditor} from "./modules/ace-editor";
import {CookieMonster, getSelectedOptionText, setSelectedOptionString} from "./util/dom_util";
import {AuthWebsocket} from "./modules/interviewpad_ws";
import {UserList} from "./modules/user";


export class App{
    private users:UserList=new UserList();
    private ws:AuthWebsocket;
    private ace:AceEditor;
    private cookies:CookieMonster = new CookieMonster();
    bind_option_change($optionElementId:string,$callBack:Function): void{
        let el=document.getElementById($optionElementId);
        el.onchange = ()=>$callBack(getSelectedOptionText($optionElementId));
    }
    onSetTheme(themeName:string){
        this.cookies.set('theme',themeName);
        document.getElementById("header-div").className="ace-"+themeName;
        document.getElementById("footer-div").className="ace-"+themeName;
        this.ace.setTheme(themeName)
    }
    initializeTheme(themeName:string){
        (document.getElementById("theme") as HTMLSelectElement).options.remove(0);
        (document.getElementById("language") as HTMLSelectElement).options.remove(0);
        this.onSetTheme(themeName);
    }
    initializeEditor(){

    }
    constructor() {
        console.log("initializing app ...")
        this.initializeWS();
        this.initializeAce();
        this.users.insertOrUpdateUser({username:'joran',email:'joran@asd.ddd',user_id:'1',is_admin:true,user_color:'#fda697',state:'inactive'})
        this.users.insertOrUpdateUser({username:'joran2',email:'joran2@asd.ddd',user_id:'2',is_admin:false,user_color:'#affd7b',state:'active'})
        this.users.insertOrUpdateUser({username:'joran3',email:'joran3@asd.ddd',user_id:'3',is_admin:false,user_color:'#4ed2fd',state:'undefined'})

    }
    private onUserChange(event:any){
        this.ws.emit('notify_edit',event);
        console.log("I got user change:",event)
    }
    private onRemoteChange(editDetails:any){
        console.log("Got Remote Change:",editDetails)
    }
    private initializeWS(){
        this.ws = new AuthWebsocket((document.body.dataset.xauth as string));
        this.ws.on("push_edit",(editDetails:any)=>this.onRemoteChange(editDetails))
        this.ws.connect("ws://127.0.0.1:5000")

    }
    private initializeAce(){
        this.ace = new AceEditor();
        this.ace.on("changeTheme",(themeName:string)=>{
            console.log("SET THEME!",themeName)
        });
        this.ace.createOn(document.getElementById('editor-div'),{style:'width:100%;height:100%;display:block;'})
        let selected_theme:string = this.cookies.get('theme','monokai');
        
        setSelectedOptionString("theme",selected_theme);
        setTimeout(()=>this.initializeTheme(selected_theme),150);
        this.bind_option_change('theme',(themeName:string)=>this.onSetTheme(themeName));
        this.bind_option_change('language',(modeName:string)=>this.ace.setMode(modeName));
        this.ace.on("user_change",($evt:any)=>this.onUserChange($evt))
    }
}
let app:App=new App();
