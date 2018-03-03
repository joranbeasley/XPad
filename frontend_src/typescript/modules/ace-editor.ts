import {JSLoader} from "../util/dom_util";
import {formatUnicorn} from "../util/string_util";
class AceURLS{
    known_workers:{[lang:string]:Number} = {coffee:1,css:1,html:1,javascript:1,json:1,lua:1,php:1,xml:1,xquery:1}
    private ace_version:string = "1.3.1";
    private _base_cdn_url ="https://cdnjs.cloudflare.com/ajax/libs/ace/{version}";
    private urls = {
        languages:"{base_url}/mode-{languageMode}.js",
        themes:"{base_url}/theme-{themeName}.js",
        workers:"{base_url}/worker-{languageMode}.js",
        extensions:"{base_url}/ext-{extName}.js"
    };
    workers(){return this.urls.workers;}
    themes(){return this.urls.workers;}
    languages(){return this.urls.workers;}
    extensions(){return this.urls.workers;}
    base_url():string{
        console.log("I am:",this)
        return formatUnicorn(this._base_cdn_url,{version:this.ace_version})
    }
    workers_url(languageName:string){
        if(this.known_workers[languageName]){
            return formatUnicorn(this.urls.workers,{base_url:this.base_url(),languageMode:languageName})
        }
    }
    language_url(language:string):string{
        return formatUnicorn(this.urls.languages,{base_url:this.base_url(),languageMode:language})
    }
    theme_url(themeName:string):string{
        let fmt= {base_url:this.base_url(),themeName:themeName}
        let url = formatUnicorn(this.urls.themes,fmt)
        console.log("URL:",url)
        return url
    }

}
class SimpleACE{
    private _ace:any=null;
    private jsLoader:JSLoader;
    private current_theme:string;
    private current_mode:string;
    private loaded_themes:{[theme:string]:Number}={};
    private loaded_languages:{[language:string]:Number}={};
    private urls = new AceURLS();
    private _pending_callbacks:{[key:string]:Function}={}



    constructor(current_mode:string="python",current_theme:string="monokai"){
        this.jsLoader = new JSLoader();
        this.current_mode = current_mode;
        this.current_theme = current_theme;
    }

    private _loadJS(url:string,$callback?:Function){
        console.log("LOAD:",url)
        return this.jsLoader.loadJS(url,$callback);
    }
    applyChangeDiff(changeObject:{}){
        this._ace.session.applyChangeDiff
    }
    private _loadLanguage(language:string,callback?:Function){
        if (this.loaded_languages[language]) {
                if(callback){callback();}
                return
        }

        if(this.urls.known_workers[language]){
            this._loadJS(this.urls.workers_url(language), () => {
                this._loadJS(this.urls.language_url(language), () => {
                    this.loaded_languages[language] = 1;
                    if(callback){callback();}
                })
            })
        }else {
            this._loadJS(this.urls.language_url(language), () => {
                this.loaded_languages[language] = 1;
                if(callback){callback();}
            })
        }
    }
    private _loadTheme(theme:string,callback?:Function){
        if(this.loaded_themes[theme]){
            if(callback){callback();}
        }else{
            let url = this.urls.theme_url(theme);
            console.log("LOAD URL:",url)
            this._loadJS(url,()=>{
                this.loaded_themes[theme]=1;
                if(callback){callback();}
            })
        }
    }

    initializeEditor(divId:string,opts?:{}){
        this._ace = (window as any).ace.edit(divId,opts)
        for(let $eventType in this._pending_callbacks){
            console.log("REBIND:",$eventType)
            this.on($eventType,this._pending_callbacks[$eventType])
        }

    }
    setTheme(themeName:string){
        let themePath = formatUnicorn("ace/theme/{themeName}",{themeName:themeName})
        console.log("LOAD THEME:",themePath)
        this._loadTheme(themeName,()=>{this._ace['setTheme'](themePath)});
    }
    setMode(languageName:string){
        console.log("SET MODE!:",languageName)
        this._loadLanguage(languageName,
            ()=>{
                let langPath = formatUnicorn("ace/mode/{languageName}",{languageName:languageName});
                this._ace['session'].setMode(langPath);
            }
        );
    }

    on($eventType: string, $calllBack:Function){
        if(this._ace) {
            this._ace.on($eventType, $calllBack)
        }else{
            this._pending_callbacks[$eventType] = $calllBack;
        }

    }
    is_active_user_command(){
        return (this._ace.curOp && this._ace.curOp.command.name)
    }
    setValue(value:string){
        this._ace.setValue(value);
    }
    getValue(){
        return this._ace.getValue()
    }

}
class DocPoint{
    row:number;
    column:number;
    constructor(row?:any,column?:number){
        if(typeof row == "object") {
            if(row.row) {
                this.row = row.row;
                this.column = row.column
            }else{
                this.row = row[0];
                this.column = row[1]
            }
        }else{
            this.row = row;
            this.column = column;
        }
    }
    static create(ob:any){
        if(ob.row){
            return new DocPoint(ob.row,ob.column)
        }else{
            return new DocPoint(ob[0],ob[1])
        }
    }

}
class Marker{
    ident:string;
    user_color:string;
    private _my_divs:HTMLElement[]=[];
    private _start_pos:DocPoint;
    private _end_pos:DocPoint = null;
    is_range():boolean{
        return !(this._end_pos === undefined || this._end_pos == null);
    }
    private _calculateDivs(){

        // solve our highlight or cursor divs
    }
    constructor(ident:string,color:string,startPos?:DocPoint,endPos?:DocPoint){
        if(!startPos){
            startPos = new DocPoint(0,0)
        }else if(!(startPos instanceof DocPoint)){
            startPos = new DocPoint(startPos)
        }
        if(endPos && !(endPos instanceof DocPoint)){
            endPos = new DocPoint(endPos)
        }
        this.ident = ident;
        this.user_color = color;
        this._start_pos = startPos;
        this._end_pos = endPos;
    }

    update(startPos?:any,endPos?:any){
        this._start_pos = startPos;
        this._end_pos = endPos;
    }
    
}
class MarkersList{
    markers:{[ident:string]:Marker}={};
    editor:AceEditor;
    constructor(editor:AceEditor){
        this.editor = editor;
    }

    private createMarker(ident:string,color:string){
        if(this.markers[ident]){
            throw("Cannot create a marker that aready exists!")
        }
        this.markers[ident] = new Marker(ident,color)

    }
    setMarker(ident:string,color:string,x0:number,y0:number,x1?:number,y1?:number){
        if(!this.markers[ident]){
            this.createMarker(ident,color)
        }
        this.markers[ident].update([x0,y0],[x1,y1])
    }
}

export class AceEditor{
    private editor:SimpleACE;
    private markers:MarkersList;
    private _my_listeners: {[my_event_type:string]:Function} = {
        'user_change':(evt:any)=>console.log("user_change_event",evt),
        'other_change':(evt:any)=>console.log("non_user_event",evt),
        'changeTheme':(evt:any)=>console.log("changeTheme",evt),
    };

    constructor(){
        this._my_listeners;
        this.editor = new SimpleACE();
        this.markers = new MarkersList(this);
        this.editor.on("change",($evt:any)=>this.on_editor_change($evt))
    }
    on_editor_change($event:any){
        if (this.editor.is_active_user_command()){
            this.$broadcast('user_change', $event);
        }else{
            this.$broadcast('other_change', $event);
        }
    }
    on($eventType:string,$callBack:Function){
        if(this._my_listeners[$eventType]){
            this._my_listeners[$eventType] =  $callBack;
        }else {
            this.editor.on($eventType, $callBack);
        }
    }
    $broadcast($eventType:string,$payload:any){
        if(this._my_listeners[$eventType]){
            this._my_listeners[$eventType]($payload)
        }
    }
    initializeEditor(divId:string,opts?:any){
        this.editor.initializeEditor(divId,opts)
        // setTimeout(()=>this.editor.setValue("def test"))

    }
    setMode(modeName:string){this.editor.setMode(modeName);}
    setTheme(themeName:string){this.editor.setTheme(themeName);this.$broadcast("changeTheme",themeName);}
    createOn=function(parent:HTMLElement,domConfig?:{id?:string,style?:string,className?:string},editorOptions?:{}){
        domConfig = domConfig?domConfig:{};        editorOptions = editorOptions?editorOptions:{};
        let createdEditorId = domConfig.id?domConfig.id:'my-ace-editor';
        let editorClasses = domConfig.className?domConfig.className:"";
        let editorStyle = domConfig.style?domConfig.style:"";
        let editor=document.createElement('div');
        editor.id = createdEditorId;
        editor.className = editorClasses;
        editor.style.cssText = editorStyle;
        console.log("Set Style:",editorStyle)
        parent.appendChild(editor);
        setTimeout(()=>this.initializeEditor(editor.id,editorOptions),150)
    };
    applyDiff(changeOb:{}){
        console.log("apply change OB?",changeOb);
        this.editor.applyChangeDiff(changeOb);
    };
}

class MyAceEditor extends AceEditor{

}