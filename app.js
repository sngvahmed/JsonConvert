const {
    clipboard,
    remote
} = require('electron');

const fs = require('fs');
const dialog = remote.dialog;
WIN = remote.getCurrentWindow();
const keyFilters = [];
let keyAction = {};

var json;
var jsonOriginal;





$('#paste').click(() => {
    try {
        const t = clipboard.readText('clipboard');
        // jsonOriginal = require("./template.js");
        // console.log(t)
        jsonOriginal = JSON.parse(t);
        reset();
    } catch (err) {
        toastr.info('Please select json and copy it then click in paste icon', 'Please Follow');
        toastr.error('There is no json in clipboard.', 'Not valid Json');
    }
});

$('#reset').click(() => {
    try {
        reset();
    } catch (err) {
        toastr.error(`Can't reset json clipboard check you copied clipboard`, 'Error');
        console.error("can't format json", err);
    }
});

$('#runFilter').click(() => {
    if (keyFilters.filter(k => k.selected).length == Object.keys(keyAction).length)
        applyJson();
    else
        toastr.warning(`Please select all operation`, 'Warning');
})

var reset = () => {
    console.log("### reset ###");
    json = JSON.parse(JSON.stringify(jsonOriginal));
    $('#filter-json').html("");
    keyAction = {};
    applyJson();
};


var filterJson = () => {
    keyFilters.filter(k => k.selected).forEach(k => {
        console.log(keyAction[k.htmlId], actions[keyAction[k.htmlId]])
        actions[keyAction[k.htmlId]] && actions[keyAction[k.htmlId]](k.id);
    });

    keyFilters.length = 0;
    keysName = "";

    buildKeysArray(json, keysName, '');
    getKeysOptionsHtml();
};

var applyJson = () => {
    filterJson();
    $('#json-renderer').jsonViewer(json);

    toastr.success("Progress Done");
};

var actions = {
    hide: function (key) {
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
        };

        hideAction(json, 0);
    }
};

var buildKeysArray = (json, keysName, htmlId) => {
    if (typeof json != "object") return;

    if (json.length == undefined) {
        var ks = Object.keys(json);
        ks.filter(key => {
            return keyFilters.filter((x) => `${keysName}|${key}` == x.id).length == 0;
        }).forEach(key => {
            const item = {
                name: key,
                id: `${keysName}|${key}`,
                htmlId: `${htmlId}-${key}`,
                toString: function () {
                    return `<a id="${this.htmlId}" class="dropdown-item" href="#">
                                ${this.id.replace('|', "#").replace(/\|/g, "->")}
                            </a>`;
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
    keyFilters.forEach(function (k) {
        $(`#${k.htmlId}`).click(function () {
            addNewRule(this);
        }.bind(k));
    });
};

function addNewRule(v) {
    console.log("select =>", v);
    const i = keyFilters.indexOf(v);

    keyFilters[i].selected = true;


    const rules = ruleEngine();
    rules.key = keyFilters[i];

    const html = rules.html(keyFilters[i].htmlId, keyFilters[i].id.replace('|', "#").replace(/\|/g, "->"));

    $('#filter-json').append(html);

    rules.lessThanRule(keyFilters[i].htmlId, keyFilters[i]);
    rules.greaterThanRule(keyFilters[i].htmlId, keyFilters[i]);
    rules.equalRule(keyFilters[i].htmlId, keyFilters[i]);
    rules.hideRule(keyFilters[i].htmlId, keyFilters[i]);


    getKeysOptionsHtml();
}

function ruleEngine() {
    return {
        lessThanRule: function (htmlId, keyFilter) {
            $(`#rule-${htmlId}-lessThanRule`).click(() => {
                console.log("less", keyFilter);
                keyAction[htmlId] = "lessThan";
                $(`#input-${htmlId}-number`).attr("disabled", false);
                $(`#rule-button-${htmlId}-rule-name`).html("<");
            });
        },
        greaterThanRule: function (htmlId, keyFilter) {
            $(`#rule-${htmlId}-greaterThanRule`).click(() => {
                console.log("less", keyFilter);
                keyAction[htmlId] = "greaterThan";
                $(`#input-${htmlId}-number`).attr("disabled", false);
                $(`#rule-button-${htmlId}-rule-name`).html(">");
            });
        },
        equalRule: function (htmlId, keyFilter) {
            $(`#rule-${htmlId}-equalRule`).click(() => {
                console.log("equal", keyFilter);
                keyAction[htmlId] = "equal";
                $(`#input-${htmlId}-number`).attr("disabled", false);
                $(`#rule-button-${htmlId}-rule-name`).html("=");
            });
        },
        hideRule: function (htmlId, keyFilter) {
            $(`#rule-${htmlId}-hideRule`).click(() => {
                console.log("hide", keyFilter);
                keyAction[htmlId] = "hide";
                $(`#input-${htmlId}-number`).attr("disabled", true);
                $(`#rule-button-${htmlId}-rule-name`).html("hide");
            });
        },
        html: function (htmlId, id) {
            return `
            <div class="col-md-3 chain">
                ${id}
            </div>
            <div class="col-md-4">
                <div class="btn-group dropleft float-right">
                    <button class="btn imgBtn btn-outline-info" id="rule-button-${htmlId}-rule-name">Operator</button>
                    <button type="button" class="btn btn-outline-info dropdown-toggle dropdown-toggle-split" 
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="sr-only" >Choose Keys</span>
                    </button>
                    <div id="keys-options" class="dropdown-menu">
                        <a class="dropdown-item" disabled id="rule-${htmlId}-lessThanRule"><</a>
                        <a class="dropdown-item" disabled id="rule-${htmlId}-greaterThanRule">></a>
                        <a class="dropdown-item" disabled id="rule-${htmlId}-equalRule">=</a>
                        <a class="dropdown-item" id="rule-${htmlId}-hideRule">hide</a>
                        <a class="dropdown-item" disabled value="custom">custom</a>
                    </div>
                </div>
            </div>
            <div class="col-md-5">
                <input type="text" class="form-control" id="input-${htmlId}-number" placeholder="please enter comparison number"/>
            </div>
        `;
        }
    };
};


$('#saveCsv').click(() => {
    var jsonexport = require('jsonexport');

    try {

        let csvOption = {
            //Placeholder 1
            title: "Save file - csv file",
            buttonLabel: "Save Csv File",

            //Placeholder 3
            filters: [{
                name: 'Docs',
                extensions: ['csv']
            }]
        };

        dialog.showSaveDialog(WIN, csvOption, async (fileName) => {
            if (fileName === undefined) {
                console.log("You didn't save the file");
                return;
            }

            jsonexport(json, {
                rowDelimiter: ','
            }, function (err, csv) {
                if (err) return console.log(err);
                fs.writeFile(fileName, csv, (err) => {
                    if (err) {
                        toastr.err(err.message, "An error ocurred creating the file ");
                    }
                    toastr.success("The file has been succesfully saved");
                });
            });


        });
    } catch (e) {
        alert('Failed to save the file !');
    }
});