$(document).ready(function () {
    if ($(document).data('importers')) {
        var importers = $(document).data('importers');
        importers.push(['Keepass 2.x', 'importKeepass2Dialog']);
        importers.push(['Keepass 1.x', 'importKeepass2Dialog']);
    } else {
        var importer = [
            ['Keepass 2.x', 'importKeepass2Dialog']
        ];
        var importer = [
            ['Keepass 1.x', 'importKeepass2Dialog']
        ];
        $(document).data('importers', importer);
    }
    keepassData = '';
});

/**
 * http://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
 * @param strData
 * @param strDelimiter
 * @returns {*[]}
 * @constructor
 */
function CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp(
        (
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
        "gi"
    );
    var arrData = [
        []
    ];
    var arrMatches = null;
    var strMatchedValue;
    while (arrMatches = objPattern.exec(strData)) {
        var strMatchedDelimiter = arrMatches[ 1 ];
        if (
            strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
            ) {
            arrData.push([]);

        }
        if (arrMatches[ 2 ]) {
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp("\"\"", "g"),
                "\""
            );
        } else {
            strMatchedValue = arrMatches[ 3 ];
        }
        arrData[ arrData.length - 1 ].push(strMatchedValue);
    }
    return( arrData );
}

function processData(allText) {
    var lines = [];

    var parseResult = CSVToArray(allText, ",");
    for (var i = 1; i < parseResult.length; i++) {
        var line = {};

        for (var j = 0; j < parseResult[0].length; j++) {
            line[parseResult[0][j].toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')] = parseResult[i][j];
        }

        lines.push(line);
    }

    return lines;
}

function handleFileChange(evt) {
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = function (e) {
            keepassData = e.target.result;
        };
        r.readAsText(f);
    } else {
        alert("Failed to load file");
    }
}

function importKeepass2Dialog() {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {

        $('<div id="keepassDialog"><p><a href="https://github.com/brantje/passman/wiki/Import-keepass-1-and-2" target="_blank" class="link">Read here how to export your keepass db</a><input type="file" id="importFile"/></div>').dialog({
            buttons: {
                "Import": function () {
                    $('#keepassDialog').html('Importing... this may take a while');
                    setTimeout(importKeePass2, 1000);
                },
                "Cancel": function () {
                    $(this).dialog("close");

                }
            },
            title: "Import password and folders from teamteampass."
        });
        document.getElementById('importFile').addEventListener('change', handleFileChange, false);
    } else {
        alert('The File APIs are not fully supported by your browser. Therefore an import is not supported');
    }
}

function importKeePass2Line(v, callBack) {
    folder = (v['group-tree']) ? v['group-tree'] : '';
    var tags = folder.replace(/\\\\/g, ',');
    var account = (v['account']) ? v['account'] : '';
    var comments = (v['comments']) ? "<p>" + (v['comments']).replace(/\n/gi, "</p><p>") + "</p>" : '';
    var loginName = (v['login-name']) ? v['login-name'] : '';
    var password = (v['password']) ? v['password'] : '';
    var webSite = (v['web-site']) ? (v['web-site'].indexOf("//") != -1 ? v['web-site'] : '//' + v['web-site'] ) : '';

    var postData = {

        'label': account,
        'tags': tags,
        'desc': encryptThis(comments),
        'account': encryptThis(loginName),
        'pw1': encryptThis(password),
        'email': encryptThis(''),
        'url': webSite // encryptThis(webSite) // ignoredEncryptionFields
    };
    console.log(postData, v);
    var createUrl = OC.generateUrl('apps/passman/api/v1/item');
    $.ajax({
        async: false,
        type: "POST",
        url: createUrl,
        dataType: 'JSON',
        data: postData,
        success: function () {
            callBack();
        }
    });
}

function importKeePass2() {
    $(document).data('importFolders', []);
    var rows = processData(keepassData);
    console.log(rows);
    var count = 0;
    var i = 0;
    var dialogElem = $('#keepassDialog');

    var nextIter = function () {
        var percent = Math.round(count / rows.length * 100);
        dialogElem.html(percent + '%...');
        if (count == rows.length - 1) {
            KPImportDone()
        }
        count++;
        if (i < rows.length) {
            i++;
            setTimeout(function () {
                importKeePass2Line(rows[i], nextIter);
            }, 330);
        }
    };

    importKeePass2Line(rows[i], nextIter);
}

function KPImportDone() {
    loadItems();
    $('#keepassDialog').dialog('destroy').remove();
    $('<div>The import was a success!</div>').dialog({
        title: "Keepass import",
        buttons: {
            "close": function () {
                $(this).dialog('destroy').remove();
            }
        }
    });
}
