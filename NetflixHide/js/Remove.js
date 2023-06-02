var addMainListener = function () {
    let main = document.querySelector('div[class=\'mainView\']');
    if (main != null) {
        let subList = main.querySelectorAll('div[class=\'slider\']');
        for (let i = 0; i < subList.length; i++) {
            if (movies != null) {
                let divList = subList[i].querySelectorAll('div[class^=\'slider-item slider-item\']');
                for (let sliderDiv of divList) {
                    hideOrTint(sliderDiv);
                }
            }
            observer.observe(subList[i], config);
        }
        mainObserver.observe(main, mainConfig);
    }
};
var movies = null;
document.addEventListener('load', (e) => {
    if (e.target.tagName == 'IFRAME') {
        if (edit) {
            addMainListener();
        }
    }
}, true);
var clickedElement = null;
document.addEventListener('mousedown', (e) => {
    if (e.button == 2) {
        clickedElement = e.target;
    }
}, false);
var config = {
    attributes: true,
    childList: true,
    subtree: true
};
var hideOrTint = function (sliderDiv) {
    let { movieId, movieName } = getMovieName(sliderDiv);
    if (movieId == null) {
        sliderDiv.style.display = 'none';
    } else if (movies && movies.some(ele => ele.id === movieId)) {
        if (removeOrTint == 'tint') {
            sliderDiv.style.opacity = '0.2';
        } else {
            sliderDiv.style.display = 'none';
        }

        const movie = movies.find((movie) => movie.id === movieId)
        if (movie && movie.name === '') movie.name = movieName;
        chrome.storage.local.set({ 'movies': movies });
    }

    if (movieId && edit && !sliderDiv.querySelector('div[class=\'select-style\']')) {
        var divNode = document.createElement('div');
        divNode.className = 'select-style';
        var imgNode = document.createElement('button');
        imgNode.innerHTML = 'X';
        imgNode.addEventListener('click', imgClose);
        divNode.appendChild(imgNode);
        imgNode = document.createElement('button');
        imgNode.innerHTML = 'Y';
        imgNode.addEventListener('click', imgRestore);
        divNode.appendChild(imgNode);
        sliderDiv.insertBefore(divNode, sliderDiv.firstChild);
    }
}
var callback = function (mutationsList) {
    for (let mutation of mutationsList) {
        let div = mutation.target;
        let sliderDiv = getSliderDiv(div);
        if (sliderDiv) {
            hideOrTint(sliderDiv);
        }
    }
};
var editMode = function () {
    if (edit) {
        edit = false;
        observer.disconnect();
        let selectList = document.querySelectorAll('div[class=\'select-style\']');
        for (let i = 0; i < selectList.length; i++) {
            let selectNode = selectList[i];
            let div = selectNode.parentElement;
            div.removeChild(selectNode);
            let { movieId, } = getMovieName(div);
            if (movies.some(ele => ele.id === movieId)) {
                if (removeOrTint == 'tint') {
                    div.style.opacity = '0.2';
                } else {
                    div.style.display = 'none';
                }
            }
        }
        alert('Disabled Quick Editing Mode');
    } else {
        edit = true;
        addMainListener();
        alert('Enabled Quick Editing Mode');
    }
};
var observer = new MutationObserver(callback);
var edit = false;
chrome.runtime.onMessage.addListener((requestMsg, sender, sendResponse) => {
    switch (requestMsg) {
        case 'Remove':
            saveAndRemoveSlider(clickedElement);
            break;
        case 'Restore':
            saveAndRestoreSlider(clickedElement);
            break;
        case 'Reset':
            alert('Reset');
            resetChromeData();
            break;
        case 'edit':
            editMode();
            break;
        case 'Refresh':
            window.location.reload(true);
            break;
        default:
            break;
    }
});
var imgClose = function () {
    saveAndRemoveSlider(this);
}
var imgRestore = function () {
    saveAndRestoreSlider(this);
}
var resetChromeData = function () {
    chrome.storage.local.clear(function () {
        window.location.reload(true);
    });
}
var saveAndRemoveSlider = function (clickedElement) {
    let sliderDiv = getSliderDiv(clickedElement);
    if (sliderDiv == null) {
        alert('Please try again.');
        return;
    }
    let { movieId, movieName } = getMovieName(sliderDiv);
    if (movieId == null) {
        return;
    }
    try {
        if (!movies) movies = [];
        if (movies.some(ele => ele.id === movieId)) return;

        movies.push({ id: movieId, name: movieName });
        chrome.storage.local.set({ 'movies': movies }, () => {
            if (removeOrTint == 'tint') {
                sliderDiv.style.opacity = '0.2';
            } else {
                sliderDiv.style.display = 'none';
            }
        });
    } catch (e) { }
}
var saveAndRestoreSlider = function (clickedElement) {
    let sliderDiv = getSliderDiv(clickedElement);
    if (sliderDiv == null) {
        alert('Please try again.');
        return;
    }
    let { movieId, } = getMovieName(sliderDiv);
    if (movieId == null) {
        return;
    }
    try {
        if (!movies) return;
        if (!movies.some(ele => ele.id === movieId)) return;

        movies = movies.filter(movie => movie.id !== movieId);
        chrome.storage.local.set({ 'movies': movies }, () => {
            if (removeOrTint == 'tint') {
                sliderDiv.style.opacity = null;
            } else {
                sliderDiv.style.display = null;
            }
        });
    } catch (e) { }
}
var getSliderDiv = function (target) {
    return getNearestParent(target, 'div[class^=\'slider-item slider-item\']');
}
var getMovieName = function (target) {
    let movieElement = target.querySelector('a[aria-label]');
    if (movieElement) {
        const movieName = movieElement.getAttribute('aria-label');
        const href = movieElement.getAttribute('href');
        const movieId = href.match(/\b\d+\b/ig)[0];
        return { movieId, movieName };
    }
    return { movieId: null, movieName: null };
}
var getNearestParent = function (elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
        if (selector) {
            if (elem.matches(selector)) {
                return elem;
            }
        }
    }
    return null;
};
var mainCallback = function (mutationsList) {
    for (var mutation of mutationsList) {
        let div = mutation.target;
        let subList = div.querySelectorAll('div[class^=\'slider\']');
        for (let i = 0; i < subList.length; i++) {
            if (movies != null) {
                let divList = subList[i].querySelectorAll('div[class^=\'slider-item slider-item\']');
                for (let sliderDiv of divList) {
                    hideOrTint(sliderDiv);
                }
            }
            observer.observe(subList[i], config);
        }
    }
};
var mainObserver = new MutationObserver(mainCallback);
var mainConfig = {
    childList: true,
    subtree: true
};
var profileCallback = function (mutationsList) {
    profileObserver.disconnect();
    addMainListener();
};
var profileObserver = new MutationObserver(profileCallback);
var removeOrTint = 'tint';
var loadSetting = function () {
    chrome.storage.local.get(['ManageInterface', 'editEnabled'], (data) => {
        if (data) {
            if (data['ManageInterface'] == 'remove') {
                removeOrTint = 'remove';
            } else if (data['tint'] == 'remove') {
                removeOrTint = 'tint';
            }

            edit = data['editEnabled'] ?? false;
        } else {
            removeOrTint = 'tint';
            edit = false;
        }
        chrome.storage.local.get(['movies'], (e) => {
            movies = e['movies'] ?? [];

            // upgrade the variable
            if (movies.length > 0 && !movies[0].id) {
                const tmpMovies = [];
                movies.forEach((movieId) => tmpMovies.push({ id: movieId, name: '' }));
                movies = tmpMovies;
            }

            chrome.storage.local.set({ 'movies': movies });
            console.log(movies);

            let profile = document.querySelector('div[class^=\'profile\']');
            if (profile != null) {
                profileObserver.observe(profile, {
                    childList: true,
                });
            }
            addMainListener();
        });
    });
}
if (document.readyState === 'complete') {
    if (movies == null) {
        loadSetting();
    }
}
window.onload = loadSetting;