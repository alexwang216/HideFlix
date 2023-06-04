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
            var url = 'data:application/json;charset=utf-8,' + encodeURIComponent(result);
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

    // append data into table
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

    const downIcon = document.createElement('svg');
    downIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    downIcon.setAttribute('width', '16');
    downIcon.setAttribute('height', '16');
    downIcon.setAttribute('fill', 'currentColor');
    downIcon.setAttribute('class', 'bi bi-sort-alpha-down');
    downIcon.setAttribute('viewBox', '0 0 16 16');
    downIcon.classList.add('d-none');
    let svgPath = document.createElement('path');
    svgPath.setAttribute('fill-rule', 'evenodd');
    svgPath.setAttribute('d', 'M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371h-1.781zm1.57-.785L11 2.687h-.047l-.652 2.157h1.351z');
    downIcon.appendChild(svgPath);
    svgPath = document.createElement('path');
    svgPath.setAttribute('d', 'M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V14zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293V2.5z');
    downIcon.appendChild(svgPath);

    const upIcon = document.createElement('svg');
    upIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    upIcon.setAttribute('width', '16');
    upIcon.setAttribute('height', '16');
    upIcon.setAttribute('fill', 'currentColor');
    upIcon.setAttribute('class', 'bi bi-sort-alpha-up-alt');
    upIcon.setAttribute('viewBox', '0 0 16 16');
    upIcon.classList.add('d-none');
    svgPath = document.createElement('path');
    svgPath.setAttribute('d', 'M12.96 7H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645V7z');
    upIcon.appendChild(svgPath);
    svgPath = document.createElement('path');
    svgPath.setAttribute('fill-rule', 'evenodd');
    svgPath.setAttribute('d', 'M10.082 12.629 9.664 14H8.598l1.789-5.332h1.234L13.402 14h-1.12l-.419-1.371h-1.781zm1.57-.785L11 9.688h-.047l-.652 2.156h1.351z');
    upIcon.appendChild(svgPath);
    svgPath = document.createElement('path');
    svgPath.setAttribute('d', 'M4.5 13.5a.5.5 0 0 1-1 0V3.707L2.354 4.854a.5.5 0 1 1-.708-.708l2-1.999.007-.007a.498.498 0 0 1 .7.006l2 2a.5.5 0 1 1-.707.708L4.5 3.707V13.5z');
    upIcon.appendChild(svgPath);

    // apply background color
    const applyEvenRowCss = (tab) => {
        const tbody = tab.querySelector('tbody');
        tbody.querySelectorAll('tr').forEach((el) => el.classList.remove('even-row'));
        tbody.querySelectorAll('tr:not(.d-none)').forEach((el, ind) => {
            if (ind % 2 !== 0) el.classList.add('even-row');
        });
    }

    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    // sorting
    document.querySelectorAll('#movieList th').forEach((th) => {
        ['click', 'ontouchstart'].forEach(evt => {
            th.addEventListener(evt, () => {
                const table = th.closest('table');
                const tbody = table.querySelector('tbody');
                Array.from(tbody.querySelectorAll('tr'))
                    .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
                    .forEach(tr => tbody.appendChild(tr));
                // remove all sorting icon
                table.querySelectorAll('th').forEach((el) => {
                    if (el.querySelector('span')) el.removeChild(el.querySelector('span'));
                });
                this.asc ? downIcon.classList.remove('d-none') : downIcon.classList.add('d-none');
                !this.asc ? upIcon.classList.remove('d-none') : upIcon.classList.add('d-none');
                th.appendChild(this.asc ? downIcon : upIcon);
                applyEvenRowCss(table);
            });
        });
    })

    // searching
    document.getElementById('searchText').addEventListener('keyup', (e) => {
        const searchText = document.getElementById('searchText').value;
        const reg = new RegExp(searchText);

        document.querySelectorAll('#movieList > tbody > tr').forEach((el) => {
            el.classList.add('d-none');
        });
        Array.from(document.querySelectorAll('#movieList > tbody > tr > td'))
            .filter((el) => reg.test(el.textContent))
            .map((el) => el.parentNode)
            .forEach((el) => el.classList.remove('d-none'));
        applyEvenRowCss(document.getElementById('movieList'));
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