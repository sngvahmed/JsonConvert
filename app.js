const { clipboard, remote } = require('electron')
const fs = require('fs');
const { Parser } = require('json2csv');
const jsonTemplate = require("./template");
const dialog = remote.dialog;
WIN = remote.getCurrentWindow();

const keyFilters = [];
let counter = 0;

$('#paste').click(() => {
    try {
        const t = clipboard.readText('clipboard');
        value = JSON.parse(t);
        renderKeys(value);
        $('#json-renderer').jsonViewer(value);
    } catch (err) {
        console.log("Not Valid Json");
    }
});

setTimeout(() => {
    $('#json-renderer').jsonViewer(jsonTemplate);
    renderKeys(jsonTemplate);
    renderKeysOption();
}, 300)

$('#saveCsv').click(() => {
    
    const fields = Object.keys(value);
    const opts = { fields };
    
    try {
        const parser = new Parser(opts);
        const csv = parser.parse(value);
        
        let csvOption = {
            //Placeholder 1
            title: "Save file - csv file",
            buttonLabel : "Save Csv File",
            
            //Placeholder 3
            filters :[
                {name: 'Docs', extensions: ['csv']}
            ]
        };

        try { 
            dialog.showSaveDialog(WIN, csvOption, (fileName) => {
                if (fileName === undefined){
                    console.log("You didn't save the file");
                    return;
                }

                fs.writeFile(fileName, csv, (err) => {
                    if(err){ alert("An error ocurred creating the file "+ err.message) }
                    alert("The file has been succesfully saved");
                });
            }); 
        }
        catch(e) { 
            alert('Failed to save the file !');
        }

    } catch (err) {
        console.error(err);
    }
});

var renderKeys = (json, keysName) => {
    if (typeof json != "object") return;
    if (keysName == undefined || keysName == "") {
        keyFilters.length = 0;
        counter = 0;
        keysName = "";
    }
    if (json.length == undefined) {
        var ks = Object.keys(json);
        ks.filter(key => {
            return keyFilters.filter((x) => `${keysName}-${key}` == x.id).length == 0;
        }).forEach(key => {
            const item = {
                name : key,
                id : `${keysName}-${key}`,
                toString: function(){
                    return `<a id="${this.id}" class="dropdown-item" href="#">${this.id}</a>`
                }
            };
    
            keyFilters.push(item);
            renderKeys(json[key], item.id); 
        });
    } else {
        json.forEach(key => {
            renderKeys(key, keysName); 
        });
    }
    
    
}

var renderKeysOption = () => {
    $('#keys-options').html(keyFilters.map(k => k.toString()).join(""));
    keyFilters.forEach(function(k) {
        console.log(`#${k.id}`)
        $(`#${k.id}`).click(() => {
            console.log(this);
        })
    })
}