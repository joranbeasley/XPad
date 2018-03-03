// String.prototype.formatUnicorn = String.prototype.formatUnicorn || function () {
//     "use strict";
//     var str = this.toString();
//     if (arguments.length) {
//         var t = typeof arguments[0];
//         var key;
//         var args = ("string" === t || "number" === t)?Array.prototype.slice.call(arguments): arguments[0];
//         for (key in args) {
//             str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
//         }
//     }
//     return str;
// };
export function formatUnicorn(fmtString:string, ...fmtArgs:any[]): string{
    var str = fmtString.toString();
    if (fmtArgs.length) {
        var t = typeof fmtArgs[0];
        var key;
        var args = ("string" === t || "number" === t)?Array.prototype.slice.call(fmtArgs): fmtArgs[0];
        for (key in args) {
            // console.log("R:",key,args[key])
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }
    return str;
}

// call marker.session.removeMarker(marker.id) to remove it
// call marker.redraw after changing one of cursors
