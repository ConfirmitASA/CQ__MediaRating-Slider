/* tooltip with error */
function errorTooltipShow(element, error) {
    let text = error;
    let position = {
        left: element.offsetLeft,
        top: element.offsetTop
    };
    if(document.querySelectorAll("#error--" + element.id).length === 0){
        let ttErrorBox = document.createElement("div");
        ttErrorBox.classList.add("comd-tooltip");
        ttErrorBox.classList.add("comd-tooltip--bottom");
        ttErrorBox.classList.add("comd-tooltip--error");
        ttErrorBox.id = "error--" + element.id;
        ttErrorBox.innerHTML = '<div class="comd-tooltip__arrow"></div><div class="comd-tooltip__inner"></div>';
        element.insertAdjacentElement('afterend', ttErrorBox);
        ttErrorBox.style.display = "block";
        ttErrorBox.getElementsByClassName("comd-tooltip__inner")[0].innerHTML = text;
        ttErrorBox.querySelectorAll(".comd-tooltip__arrow")[0].style.left = ttErrorBox.offsetWidth / 2 - 5 + "px";
        ttErrorBox.style.left = position.left - (ttErrorBox.offsetWidth/2 - element.offsetWidth/2) + "px";
    }
}

/* tooltip with warning */
function warningTooltipShow(element, message) {
    let position = {
        left: element.offsetLeft,
        top: element.offsetTop
    };

    if(document.querySelectorAll('#warning--' + element.id).length === 0) {
        let ttWarningBox = document.createElement('div');
        ttWarningBox.id = 'warning--' + element.id;
        ttWarningBox.classList.add('comd-tooltip');
        ttWarningBox.classList.add('comd-tooltip--bottom');
        ttWarningBox.classList.add('comd-tooltip--warning');

        ttWarningBox.innerHTML = '<div class="comd-tooltip__arrow"></div><div class="comd-tooltip__inner"></div>';
        document.body.appendChild(ttWarningBox);
        ttWarningBox.style.display = 'block';
        ttWarningBox.getElementsByClassName('comd-tooltip__inner')[0].innerHTML = message;
        ttWarningBox.querySelectorAll('.comd-tooltip__arrow')[0].style.left = ttWarningBox.offsetWidth / 2 - 5 + 'px';
        ttWarningBox.style.top = position.top + ttWarningBox.offsetHeight/2 + 7 + 'px';
        ttWarningBox.style.left = position.left - (ttWarningBox.offsetWidth/2 - element.offsetWidth/2) + 'px';
    }
}

//TODO: refactoring: use this function instead of specifying the panel manually during error element creation (?)
function getPanelWithElement(elementId) {
    let panels = document.querySelectorAll('.comd-panel');
    let panelWithElement = null;
    panels.forEach(panel => {
        if(!!panel.querySelector('#' + elementId)) {
            panelWithElement = panel;
        }
    });
    return panelWithElement;
}

document.addEventListener('DOMContentLoaded', function(){
    /* tooltip */
    function tooltipToggle(el) {
        el.addEventListener("mouseenter", function() {
            tooltipShow(el);
        });
        el.addEventListener("mouseleave", function() {
            tooltipHide();
        });
    }

    function tooltipShow(element, error) {
        let text = element.dataset.tooltipText;
        let position = {
            left: element.offsetLeft,
            top: element.offsetTop
        };
        let ttBox = document.getElementById("tooltipBox");
        ttBox.style.display = "block";
        ttBox.getElementsByClassName("comd-tooltip__inner")[0].textContent = text;
        ttBox.style.top = position.top - ttBox.offsetHeight/2 + 7 + "px";
        ttBox.style.left = position.left + 22 + "px";
    }

    function tooltipHide() {
        let ttBox = document.getElementById("tooltipBox");
        ttBox.style.display = "none";
        ttBox.getElementsByClassName("comd-tooltip__inner")[0].textContent = "";
    }

    let tooltips = document.getElementsByClassName("sd-tooltip-help");
    Array.prototype.forEach.call(tooltips, tooltipToggle);

    /* collapse panel */
    let collapsePanels = document.getElementsByClassName("comd-panel");
    Array.prototype.forEach.call(collapsePanels, collapseDefault);
    let collapseBtns = document.getElementsByClassName("node-properties__header");
    Array.prototype.forEach.call(collapseBtns, collapseToggle);

    function collapseDefault(el) {
        collapseStyles(el);
    }

    function collapseToggle(el) {
        el.addEventListener("click", function() { collapseHandler(el) });
    }

    function collapseHandler(el) {
        el.parentElement.classList.toggle("comd-panel--collapsed");
        collapseStyles(el.parentElement);
    }

    function collapseStyles(el) {
        if(el.classList.contains("comd-panel--collapsed")) {
            el.getElementsByClassName("collapse-button")[0].style.transform = "rotateZ(180deg)";
        } else {
            el.getElementsByClassName("collapse-button")[0].style.transform = "rotateZ(0deg)";
        }
    }
});