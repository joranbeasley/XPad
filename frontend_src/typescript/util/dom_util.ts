
export class JSLoader{
    private loaded_js:{[url:string]:Number}={};
    loadJS(url:string,callback?:Function){
        function make_callback(){
            if(callback){callback()}
        }
        if(this.loaded_js[url]!==undefined){
            make_callback();
        }else{
            var script = document.createElement('script');
            script.onload = ()=>{this.loaded_js[url]=1;make_callback()};
            script.src = url;
            console.log("DO LOAD:",url)
            script.id = "jdynamic-script-"+Object.keys(this.loaded_js).length.toString()
            document.head.appendChild(script);
        }

    }
}
export class CookieMonster{
    get($cookieName:string,$default?:any){
        let match = (new RegExp($cookieName+"=(.*?)(?=;|$)")).exec(document.cookie);
        return match?match[1]:$default;
    }
    set($cookieName:string,$cookieValue:string){
        document.cookie = $cookieName +"="+ $cookieValue;
    }
}
export function getSelectedOptionText(elementId:string) {
    var e = (document.getElementById(elementId)) as HTMLSelectElement;
    var sel = e.selectedIndex;
    return e.options[sel].text;
}
export  function setSelectedOptionIndex(elementId:string, selectedIndex:number){
    var e = (document.getElementById(elementId)) as HTMLSelectElement;
    e.selectedIndex = selectedIndex;
}
export function setSelectedOptionString(elementId:string,selectedOption:string){
    var e = (document.getElementById(elementId)) as HTMLSelectElement;
    for(let i:number=0;i<e.options.length;i++){
        if(e.options[i].text == selectedOption){
            return setSelectedOptionIndex(elementId,i);
        }
    }


}