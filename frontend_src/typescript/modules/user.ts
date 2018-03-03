import {AceEditor} from "./ace-editor";

class User{
    username:string;
    nickname:string;
    email:string;
    is_admin:boolean;
    is_anonymous:boolean;

    user_id:string;
    user_color:string;
    state:string;
    private btn:HTMLElement;
    match(queryOb:{username?:string,nickname?:string,email?:string,user_id?:string,user_color?:string}){
        if(Object.keys(queryOb).length == 0){
            throw "Error cannot pass empty queryOb";
        }
        if(queryOb.username && queryOb.username != this.username){return false;}
        if(queryOb.nickname && queryOb.nickname != this.nickname){return false;}
        if(queryOb.email && queryOb.email != this.email){return false;}
        if(queryOb.user_id && queryOb.user_id != this.user_id){return false;}
        if(queryOb.user_color && queryOb.user_color != this.user_color){return false;}
        return true;
    }
    constructor(ob:{username:string,nickname?:string,email:string,user_id:string,user_color:string,is_admin?:boolean,is_anonymous?:boolean,state?:string}){
        this.username = ob.username;
        this.nickname = ob.nickname?ob.nickname:ob.username;
        this.email = ob.email;
        this.user_id = ob.user_id;
        this.user_color = ob.user_color;
        this.is_admin = (ob.is_admin as boolean);
        this.is_anonymous = (ob.is_admin as boolean);
        this.state = ob.state.toString();
        this.createButton()
    }
    private updateButton(){
        this.btn.classList.remove("active","inactive","undefined")
        this.btn.classList.add("user-indicator-btn",this.state);
        if(this.is_admin){
            this.btn.classList.add("admin")
        }
        this.btn.id="user-button-"+this.user_id.toString();
        this.btn.dataset['usercolor'] = this.user_color;
        this.btn.innerText = this.nickname?this.nickname:this.username;
        this.btn.style.cssText="border: "+this.user_color+" thin solid; border-bottom:thick solid "+this.user_color+"; border-right:medium solid "+this.user_color+";"

    }
    private createButton(){
        let btnContainer = document.getElementById('user-button-container');
        this.btn = document.createElement('div');
        this.updateButton();
        btnContainer.appendChild(this.btn);
    }
    set_state(new_state:string){
        this.update_attrs({state:new_state})
    }
    set_color(new_color:string){
        this.update_attrs({user_color:new_color})
    }
    update_attrs(ob:{username?:string,nickname?:string,email?:string,state?:string,user_color?:string}){
        var u=0;
        if(ob.username){this.username = this.username;u=1}
        if(ob.nickname){this.username = this.nickname;u=1;}
        if(ob.email){this.username = this.email;}
        if(ob.state){this.username = this.state;u=1;}
        if(ob.user_color){this.username = this.user_color;u=1;}
        this.updateButton()
    }

}


export class UserList{
    private users:User[] = [];

    private ace_instance:AceEditor;
    find(queryOb:{username?:string,nickname?:string,email?:string,user_id?:string,user_color?:string}):User{
        let index = this.indexOf(queryOb);
        if (index < 0){
            return undefined;
        }
        return this.users[index];
    }
    insertOrUpdateUser(user:{username:string,nickname?:string,email:string,user_id:string,user_color:string,is_admin?:boolean,is_anonymous?:boolean,state?:string}){
        let index = this.indexOf({email:user.email});
        if(index >= 0){
            return this.updateUser(index,user)
        }
        this.users.push(new User(user))

    }
    updateUser(index:number,user:{username:string,nickname?:string,email:string,user_id:string,user_color:string,is_admin?:boolean,is_anonymous?:boolean,state?:string}){
        this.users[index].update_attrs(user);
    }
    removeUser(user:{username?:string,nickname?:string,email?:string,user_id?:string}){

    }
    indexOf(queryOb:{username?:string,nickname?:string,email?:string,user_id?:string,user_color?:string}):number{
        if (Object.keys(queryOb).length == 0) {
            throw "Error cannot pass empty queryOb";
        }
        for(let i=0;i<this.users.length;i++){
            if(this.users[i].match(queryOb))return i;
        }
        return -1;
    }
}