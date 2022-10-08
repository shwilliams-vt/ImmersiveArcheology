function createDOMElemWithText(type, innerHTML) {
    let elem = document.createElement(type);
    elem.innerHTML = innerHTML;
    return elem;
}

function createDOMElem(type, child) {
    let elem = document.createElement(type);

    try {
        elem.appendChild(child);
    }
    catch (e) {}

    return elem;
}

export { createDOMElem, createDOMElemWithText };