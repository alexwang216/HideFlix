var editEnabled = false;
window.addEventListener('load', () => {
    chrome.storage.sync.get('ManageInterface', (data) => {
        if (data['ManageInterface'] == 'remove') {
            document.getElementById('remove').checked = true;
        } else {
            document.getElementById('tint').checked = true;
        }
    });
    chrome.storage.sync.get('editEnabled', (data) => {
        if (data['editEnabled']) {
            document.getElementById('edit').className = 'editEnabled';
            editEnabled = true;
            document.getElementById('editTooltip').innerHTML = 'Click to disable quick edit mode';
        } else {
            document.getElementById('edit').className = 'editDisabled';
            document.getElementById('editTooltip').innerHTML = 'Click to enable quick edit mode';
        }
    });
    document.getElementById('edit').addEventListener('click', () => {
        if (editEnabled) {
            this.className = 'editDisabled'; editEnabled = false;
            document.getElementById('editTooltip').innerHTML = 'Click to enable quick edit mode';
        } else {
            this.className = 'editEnabled';
            editEnabled = true;
            document.getElementById('editTooltip').innerHTML = 'Click to disable quick edit mode';
        }
        chrome.storage.sync.set({ 'editEnabled': editEnabled }, (data) => {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, 'edit');
            });
        });
    });
    document.getElementById('remove').addEventListener('click', () => {
        chrome.storage.sync.set({ 'ManageInterface': 'remove' }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, 'Refresh');
            });
        });
    });
    document.getElementById('tint').addEventListener('click', () => {
        chrome.storage.sync.set({ 'ManageInterface': 'tint' }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, 'Refresh');
            });
        });
    });
    document.getElementById('reset').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, 'Reset');
        });
    });
    document.getElementById('export').addEventListener('click', () => {
        chrome.storage.sync.get(null, (items) => { // null implies all items
            // Convert object to a string.
            var result = JSON.stringify(items);

            // Save as file
            var url = 'data:application/json;base64,' + btoa(result);
            chrome.downloads.download({
                url: url,
                filename: 'ShowHideNetflix.json'
            });
        });
    });
    document.getElementById('import').addEventListener('click', () => {
        document.getElementById('jsonFile').click();
    });
    document.getElementById('jsonFile').addEventListener('change', (e) => {
        var files = e.target.files;
        var reader = new FileReader();
        reader.onload = readAndSaveJson;
        reader.readAsText(files[0]);
    }, false);
}, false);
function readAndSaveJson() {
    var importedData = JSON.parse(this.result);

    chrome.storage.sync.clear(() => {
        for (const parm in importedData) {
            if (Object.hasOwnProperty.call(importedData, parm)) {
                const element = importedData[parm];

                let tmp = {};
                tmp[parm] = element;
                chrome.storage.sync.set(tmp);
            }
        }
    });
}