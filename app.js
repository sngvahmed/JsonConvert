const { clipboard, remote } = require('electron')
const fs = require('fs');
const { Parser } = require('json2csv');
const dialog = remote.dialog;
WIN = remote.getCurrentWindow();

var value;
$('#paste').click(() => {
    try {
        const t = clipboard.readText('clipboard');
        value = JSON.parse(t);
        $('#json-renderer').jsonViewer(value);
    } catch (err) {
        console.log("Not Valid Json");
    }
});


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
