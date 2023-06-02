var editEnabled = false;
window.addEventListener('load', () => {
    chrome.storage.local.get('ManageInterface', (data) => {
        if (data['ManageInterface'] == 'remove') {
            document.getElementById('remove').checked = true;
        } else {
            document.getElementById('tint').checked = true;
        }
    });
    chrome.storage.local.get('editEnabled', (data) => {
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
        chrome.storage.local.set({ 'editEnabled': editEnabled }, (data) => {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, 'edit');
            });
        });
    });
    document.getElementById('remove').addEventListener('click', () => {
        chrome.storage.local.set({ 'ManageInterface': 'remove' }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, 'Refresh');
            });
        });
    });
    document.getElementById('tint').addEventListener('click', () => {
        chrome.storage.local.set({ 'ManageInterface': 'tint' }, () => {
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
        chrome.storage.local.get(null, (items) => { // null implies all items
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

    const vTable = document.querySelector('#movieList > tbody');
    if (vTable) {
        chrome.storage.local.get(['movies'], (e) => {
            if (e['movies']) {
                e['movies'].forEach((movie, ind) => {
                    const trEle = document.createElement('tr');
                    const idEle = document.createElement('td');
                    const nameEle = document.createElement('td');

                    idEle.appendChild(document.createTextNode(movie.id));
                    nameEle.appendChild(document.createTextNode(movie.name));
                    trEle.appendChild(idEle);
                    trEle.appendChild(nameEle);

                    if (ind % 2 !== 0) {
                        trEle.classList.add('even-row');
                    }

                    vTable.appendChild(trEle);
                });
            }
        });
    }
    document.getElementById('searchText').addEventListener('keyup', (e) => {
        const searchText = document.getElementById('searchText').value;
        const reg = new RegExp(searchText);

        document.querySelectorAll('#movieList > tbody > tr').forEach((el) => {
            el.classList.add('d-none');
            el.classList.remove('even-row');
        });
        Array.from(document.querySelectorAll('#movieList > tbody > tr > td'))
            .filter((el) => reg.test(el.textContent))
            .map((el) => el.parentNode)
            .forEach((el, ind) => {
                el.classList.remove('d-none');
                if (ind % 2 !== 0) {
                    el.classList.add('even-row');
                }
            });
    });
}, false);
function readAndSaveJson() {
    var importedData = JSON.parse(this.result);

    chrome.storage.local.clear(() => {
        for (const parm in importedData) {
            if (Object.hasOwnProperty.call(importedData, parm)) {
                const element = importedData[parm];

                let tmp = {};
                tmp[parm] = element;
                chrome.storage.local.set(tmp);
            }
        }
    });
}