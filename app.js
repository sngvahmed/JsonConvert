const { clipboard, remote } = require('electron');
const fs = require('fs');
const dialog = remote.dialog;
WIN = remote.getCurrentWindow();

const keyFilters = [];

var json;
var jsonOriginal;

$('#paste').click(() => {
    try {
        const t = clipboard.readText('clipboard');
        jsonOriginal = JSON.parse(t);
        reset();
    } catch (err) {
        console.log("Not Valid Json");
    }
});

$('#reset').click(() => {
    reset();
})

var reset = () => {
    json = JSON.parse(JSON.stringify(jsonOriginal));
    applyJson();
}

var filterJson = () => {
    keyFilters.filter(k => k.selected).forEach(k => {
        k.filtersAction.forEach(action => {
            actions[action](k.id);
        });
    });

    keyFilters.length = 0;
    keysName = "";


    buildKeysArray(json, keysName, '');
    getKeysOptionsHtml();
}

var actions = {
    hide: function(key){
        var keys = key.split("|").splice(1);

        var hideAction = (obj, d) => {
            if (obj == undefined) return;

            if (obj.length == undefined) {
                if (d == keys.length - 1) {
                    delete obj[keys[d]];
                    return;
                }

                hideAction(obj[keys[d]], d + 1);
            } else {
                obj.forEach((ob) => {
                    hideAction(ob, d);
                });
            }
        }

        hideAction(json, 0);
    }
}


var applyJson = () => {
    console.log("############ applyJson ###########", json);
    filterJson();
    $('#json-renderer').jsonViewer(json);
}

$('#saveCsv').click(() => {
    var jsonexport = require('jsonexport');

    try { 

        let csvOption = {
            //Placeholder 1
            title: "Save file - csv file",
            buttonLabel : "Save Csv File",
            
            //Placeholder 3
            filters :[
                {name: 'Docs', extensions: ['csv']}
            ]
        };

        dialog.showSaveDialog(WIN, csvOption, async (fileName) => {
            if (fileName === undefined){
                console.log("You didn't save the file");
                return;
            }

            jsonexport(json, {rowDelimiter: ','}, function(err, csv){
                if(err) return console.log(err);
                console.log(csv);
                fs.writeFile(fileName, csv, (err) => {
                    if(err){ alert("An error ocurred creating the file "+ err.message) }
                    alert("The file has been succesfully saved");
                });
            });

            
        }); 
    }
    catch(e) { 
        alert('Failed to save the file !');
    }
});

var buildKeysArray = (json, keysName, htmlId) => {
    if (typeof json != "object") return;
    
    if (json.length == undefined) {
        var ks = Object.keys(json);
        ks.filter(key => {
            return keyFilters.filter((x) => `${keysName}|${key}` == x.id).length == 0;
        }).forEach(key => {
            const item = {
                name : key,
                id : `${keysName}|${key}`,
                htmlId: `${htmlId}-${key}`,
                toString: function(){
                    return `<a id="${this.htmlId}" class="dropdown-item" href="#">${this.id.replace('|', "#").replace(/\|/g, "->")}</a>`
                },
                selected: false
            };
    
            keyFilters.push(item);
            buildKeysArray(json[key], item.id, item.htmlId); 
        });
    } else {
        json.forEach(key => {
            buildKeysArray(key, keysName, htmlId); 
        });
    }
};

var getKeysOptionsHtml = () => {
    $('#keys-options').html(keyFilters.filter(k => k.selected == false).map(k => k.toString()).join(""));
    keyFilters.forEach(function(k) {
        $(`#${k.htmlId}`).click(function(){
            selectKey(this)
        }.bind(k));
    });
};

var selectKey = (v) => {
    console.log("select =>", v);
    const i = keyFilters.indexOf(v);
    keyFilters[i].selected = true;
    keyFilters[i].filtersAction = ["hide"];
    applyJson();
};

