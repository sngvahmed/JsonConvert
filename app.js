const { clipboard, remote } = require('electron')
const fs = require('fs');
const { Parser } = require('json2csv');
const jsonOriginal = require("./template");
const dialog = remote.dialog;
WIN = remote.getCurrentWindow();

const keyFilters = [];
let deletedItem = [];

var json;

$('#paste').click(() => {
    try {
        const t = clipboard.readText('clipboard');
        value = JSON.parse(t);
        buildKeysArray(value);
        $('#json-renderer').jsonViewer(value);
    } catch (err) {
        console.log("Not Valid Json");
    }
});

var init = () => {
    console.log("############ init ###########");
    console.log("############ reset ###########");
    json = JSON.parse(JSON.stringify(jsonOriginal));
    applyJson();
}


var filterJson = () => {
    keyFilters.filter(k => k.selected).forEach(k => {
        k.filtersAction.forEach(action => {
            actions[action](k.id);
        });
    });
    deletedItem
    keyFilters.length = 0;
    keysName = "";


    buildKeysArray(json, keysName, '');
    getKeysOptionsHtml();
}

var actions = {
    hide: function(key){
        var keys = key.split("|").splice(1);

        var hideAction = (obj, d) => {
            if (obj[keys[d]] == undefined) return;

            if (d == keys.length - 1) {
                delete obj[keys[d]];
                return;
            }
            if (obj[keys[d]].length == undefined) {
                hideAction(obj[keys[d]], d + 1);
            } else {
                obj[keys[d]].forEach((ob) => {
                    hideAction(ob, d + 1);
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
}

var getKeysOptionsHtml = () => {
    $('#keys-options').html(keyFilters.filter(k => k.selected == false).map(k => k.toString()).join(""));
    keyFilters.forEach(function(k) {
        $(`#${k.htmlId}`).click(function(){
            selectKey(this)
        }.bind(k))
    })
}

var selectKey = (v) => {
    const i = keyFilters.indexOf(v);
    keyFilters[i].selected = true;
    keyFilters[i].filtersAction = ["hide"];
    applyJson();
}

init();