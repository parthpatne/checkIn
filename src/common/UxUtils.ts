import { Utils } from "./Utils";
import strings from '../../assets/strings/strings.json';

export class UxUtils {
    private static readonly DEFAULT_SPACE_LENGTH = "10pt";
    private static readonly DEFAULT_IMAGE_DIMEN = "50pt";

    public static showAlertDailog(title: string, message: string, okButtonTitle: string, okButtonAction: () => void, cancelButtonTitle: string, cancelButtonAction: () => void) {
        var fullScreenTransparentDiv = this.getFullScreenTransparentContainer();

        var alertView = this.getDiv();
        alertView.classList.add("alertView");
        this.addElement(alertView, fullScreenTransparentDiv);

        var alertTitleView = this.getLabel(title);
        alertTitleView.classList.add("alertTitleDiv");
        this.addElement(alertTitleView, alertView);

        var alertMessageView = this.getLabel(message);
        alertMessageView.classList.add("alertMessageView");
        this.addElement(alertMessageView, alertView);

        var alertBottomView = this.getDiv();
        alertBottomView.classList.add("alertBottomView");
        this.addElement(alertBottomView, alertView);


        if (cancelButtonTitle != null && cancelButtonTitle != "") {
            var cancelButton = this.getLabel(cancelButtonTitle);
            cancelButton.classList.add("buttonAttributes");
            cancelButton.onclick = () => {
                this.removeElement(fullScreenTransparentDiv, document.body);
                if (cancelButtonAction)
                    cancelButtonAction();
            };
            this.addElement(cancelButton, alertBottomView);
        }

        if (okButtonTitle != null && okButtonTitle != "") {
            var okButton = this.getLabel(okButtonTitle);
            okButton.classList.add("buttonAttributes");
            okButton.onclick = () => {
                this.removeElement(fullScreenTransparentDiv, document.body);
                if (okButtonAction)
                    okButtonAction();
            };
            this.addElement(okButton, alertBottomView);
        }

        this.addElement(fullScreenTransparentDiv, document.body);
    }

    public static getLoadingSpinner(attributes: {} = null): HTMLDivElement {
        var loadSpinner = this.getDiv();
        loadSpinner.classList.add("loadingSpinnerAttributes");
        Object.assign(loadSpinner, attributes);
        return loadSpinner;
    }

    public drawPieChart(data: number[], colors: string[], borderColor: string, canvas: HTMLCanvasElement, canvasWidth, canvasHeight) {
        var ctx = canvas.getContext("2d");

        var total = 0;
        for (var i = 0; i < data.length; i++) {
            total += data[i];
        }

        var lineWidth = 1;
        var radius = canvasHeight / 2 - lineWidth;
        var counterClockWise = false;
        var startAngle = -(Math.PI / 2);
        for (var i = 0; i < data.length; i++) {
            ctx.fillStyle = colors[i];
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = lineWidth;

            var endAngle = startAngle + (2 * Math.PI * (data[i] / total));

            ctx.beginPath();
            ctx.moveTo(canvasWidth / 2, canvasHeight / 2);
            ctx.arc(canvasWidth / 2, canvasHeight / 2, radius, startAngle, endAngle, counterClockWise);
            ctx.lineTo(canvasWidth / 2, canvasHeight / 2);
            ctx.fill();
            ctx.stroke();

            startAngle = endAngle;
        }
    }

    /////////////////// General Utility ///////////////////

    public static getFullScreenTransparentContainer() {
        var fullScreenTransparentContainer = this.getDiv();
        fullScreenTransparentContainer.classList.add("fullScreenTransparentContainer");
        return fullScreenTransparentContainer;
    }

    public static getHorizontalDiv(childrenElements: any[], attributes: {} = null): HTMLDivElement {
        var div: HTMLDivElement = this.getDiv();
        div.classList.add("horizontalDivAttributes");
        Object.assign(div, attributes);
        for (var i = 0; i < childrenElements.length; i++) {
            var childElement = childrenElements[i];
            if (childElement) {
                this.addElement(childElement, div);
            }
        }
        return div;
    }

    public static getVerticalDiv(childrenElements: any[], attributes: {} = null): HTMLDivElement {
        var div: HTMLDivElement = this.getDiv();
        div.classList.add("verticalDivAttributes");
        Object.assign(div, attributes);
        for (var i = 0; i < childrenElements.length; i++) {
            var childElement = childrenElements[i];
            if (childElement) {
                this.addElement(childElement, div);
            }
        }
        return div;
    }

    public static getFlexibleSpace(): HTMLDivElement {
        return this.getDiv({ flex: "1 1 auto" });
    }

    public static getSpace(length: string = this.DEFAULT_SPACE_LENGTH): HTMLDivElement {
        var spaceDiv = this.getDiv();
        this.addCSS(spaceDiv, { width: length, height: length, flex: "none" });
        return spaceDiv;
    }

    public static getLabel(text: string = null, attributes: {} = null, showLinks: boolean = true): HTMLDivElement {
        var labelDiv: HTMLDivElement = this.getDiv();
        labelDiv.classList.add("labelAttributes");
        Object.assign(labelDiv, attributes);
        this.setText(labelDiv, text, true, showLinks);
        return labelDiv;
    }

    public static getButton(title: string = null, clickEvent: () => void = null, attributes: {} = null): HTMLDivElement {
        var buttonDiv: HTMLDivElement = this.getDiv(attributes);
        this.setText(buttonDiv, title, true, false);
        this.addClickEvent(buttonDiv, clickEvent);
        return buttonDiv;
    }

    public static setText(element: HTMLElement, text: string = null, asHTML: boolean = true, showLinks: boolean = true) {
        if (asHTML) {
            element.innerHTML = text.trim();
        } else {
            element.innerText = text.trim();
        }

        if (showLinks) {
            this.highlightLinksInElement(element);
        }
    }

    public static getBase64CircularImage(data: string = null, dimen: string = this.DEFAULT_IMAGE_DIMEN, attributes: {} = null): HTMLImageElement {
        var circularImage = this.getBase64Image(data);
        circularImage.classList.add("circularImageAttributes");
        Object.assign(circularImage, attributes);
        return circularImage;
    }

    public static getCircularImage(path: string = null, dimen: string = this.DEFAULT_IMAGE_DIMEN, attributes: {} = null): HTMLImageElement {
        var circularImage = this.getImage(path);
        circularImage.classList.add("circularImageAttributes");
        Object.assign(circularImage, attributes);
        return circularImage;

    }

    public static getBase64Image(data: string = null, attributes: {} = null): HTMLImageElement {
        return this.getImage(this.getBase64Src(data), attributes);
    }

    public static getBase64Src(data: string): string {
        return "data:image/png;base64," + data;
    }

    public static getImage(path: string = null, attributes: {} = null): HTMLImageElement {
        var image: HTMLImageElement = <HTMLImageElement>this.getElement("img");
        image.src = path;
        image.classList.add("imageAttributes");
        Object.assign(image, attributes);
        return image;
    }

    public static getDiv(attributes: {} = null): HTMLDivElement {
        return <HTMLDivElement>this.getElement("div", attributes);
    }

    public static getPrettyPrintDiv(attributes: {} = null): HTMLDivElement {
        return <HTMLDivElement>this.getElement("pre", attributes);
    }

    public static getCanvas(width: number, height: number, attributes: {} = null): HTMLCanvasElement {
        var canvas: HTMLCanvasElement = this.createHiDPICanvas(width, height);
        this.addCSS(canvas, attributes);
        return canvas;
    }

    public static addElement(element: HTMLElement = null, parentElement: HTMLElement = null) {
        if (element && parentElement) {
            parentElement.appendChild(element);
        }
    }

    public static removeElement(element: HTMLElement = null, parentElement: HTMLElement = null) {
        if (element == null)
            return;

        var parent;
        if (null == parentElement) {
            parent = element.parentElement;
        }
        else {
            parent = parentElement;
        }

        if (element && parent && parent.contains(element)) {
            parent.removeChild(element);
        }
    }

    public static replaceElement(newElement: HTMLElement = null, oldElement: HTMLElement = null, parentElement: HTMLElement = null) {
        if (newElement && oldElement && parentElement) {
            parentElement.replaceChild(newElement, oldElement);
        }
    }

    public static clearElement(element: HTMLElement = null) {
        while (element && element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    public static getElement(elementTag: string, attributes: {} = null): HTMLElement {
        var element: HTMLElement = document.createElement(elementTag);
        this.addCSS(element, attributes);
        return element;
    }

    public static addClickEvent(element: HTMLElement, clickEvent: () => void) {
        if (clickEvent != null) {
            element.onclick = clickEvent;
        }
    }

    public static setId(element: HTMLElement, id: string) {
        if (!Utils.isEmptyString(id)) {
            element.id = id;
        }
    }

    public static setClass(element: HTMLElement, className: string) {
        if (!Utils.isEmptyString(className)) {
            element.className = className;
        }
    }

    public static addCSS(element: HTMLElement, attributes: {}) {
        if (attributes != null) {
            var cssText = "";
            if (!Utils.isEmptyString(element.style.cssText)) {
                cssText = element.style.cssText;
            }
            for (var key in attributes) {
                cssText += key + ":" + attributes[key] + ";";
            }
            element.style.cssText = cssText;
        }
    }

    public static highlightLinksInElement(element: HTMLElement) {
        if (element == null)
            return;

        var allowedTypes = ["label", "div", "p"];
        if (allowedTypes.indexOf(element.nodeName.toLowerCase()) == -1)
            return;

        var text = element.innerHTML;

        // Regex for Http or ftp url.
        // (\b(https?|ftp):? : word start with http/https/ftp followed by .
        // \/\/ : //
        // [-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|] : any number of character from [-A-Z0-9+&@#\/%?=~_|!:,.;], 
        //      ends with any of these character [-A-Z0-9+&@#\/%=~_|]
        var urlRegexHttp = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig; // for http urls

        // Regex for www url 
        // (^|[^\/]) : start of line (^) or not start with /.
        // www\. : www.
        // [-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]) : any number of character from [-A-Z0-9+&@#\/%?=~_|!:,.;], 
        //      ends with any of these character [-A-Z0-9+&@#\/%=~_|]
        var urlRegexWww = /(^|[^\/])(www\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim; // for www urls

        // Regex for tel: and sms: detection
        // (tel|sms):) : word start with tel: or sms:
        // ([+]?\d{1,3}[.-\s]?)? : Optional : + is optional, 1-3 digit number, ./-/space is optional.
        // ([(]?\d{1,3}[)]?[.-\s]?){1,2} : 1-3 digit number with/without (), ./-/space is optional. And this can but repaet max 2 times.
        // \d{4} : 4 digit number.
        var telSmsRegex = /(\b(tel|sms):)([+]?\d{1,3}[.-\s]?)?([(]?\d{1,3}[)]?[.-\s]?){1,2}\d{4}/gim;

        text = text.replace(urlRegexHttp, function (url) {
            return "<a href=\"" + url + "\">" + url + "</a>";
        });

        text = text.replace(urlRegexWww, function (url) {
            var newUrl = url;

            if (url.toLowerCase().indexOf("www") == 0) {
                newUrl = "http://" + url;
                return "<a href=\"" + newUrl + "\">" + url + "</a>";
            } else if (url.toLowerCase().indexOf("www") == 1) {
                newUrl = "http://" + url.substring(1);
                return url.charAt(0) + "<a href=\"" + newUrl + "\">" + url.substring(1) + "</a>";
            } else {
                return url;
            }
        });

        text = text.replace(telSmsRegex, function (url) {
            return "<a href=\"" + url + "\">" + url + "</a>";
        });

        element.innerHTML = text;
    }

    private static getPixelRatio() {
        var ctx: any = document.createElement("canvas").getContext("2d"),
            dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

        return dpr / bsr;
    };

    private static createHiDPICanvas(w, h, ratio = 0) {
        if (!ratio) {
            ratio = this.getPixelRatio();
        }
        var can = document.createElement("canvas");
        can.width = w * ratio;
        can.height = h * ratio;
        can.style.width = w + "pt";
        can.style.height = h + "pt";
        can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
        return can;
    }
    /////////////////// HTML Elements ///////////////////


    /////////////////// CSS Attributes ///////////////////

    public static getLoadingSpinnerAttributes() {
        this.addLoadingSpinnerAnimation();
    }

    public static lineBreak() {
        return document.createElement('br');
    }

    public static getContentEditableSpan(text: string = "", placeholder: string = "", attributes: {} = null, onInputEvent: () => void) {
        var element = this.getElement("span");
        element.classList.add("getContentEditableSpanAttributes");
        Object.assign(element, attributes);
        element.setAttribute("placeholder", placeholder);
        element.setAttribute('contenteditable', "true");
        element.innerText = text;

        var maxLength = attributes["max-length"];
        if (maxLength) {
            element.innerText = text.length > maxLength ? text.substr(0, maxLength) : text;
        }
        var prevString = element.innerText;

        element.addEventListener('input', function () {
            if (this.innerText.trim() == "") {
                // this.clearElement(this);
            }

            if (maxLength && this.innerText.length > maxLength) {
                this.innerText = prevString;
            } else if (maxLength) {
                prevString = this.innerText;
            }

            if (onInputEvent) {
                onInputEvent();
            }
        });

        element.addEventListener('click', function () {
            element.focus();
        });

        return element;
    }

    public static getString(key: string, ...args: any[]) {
        if (strings.hasOwnProperty(key)) {
            let formatted = strings[key];
            for (let i = 0; i < args.length; i++) {
                let regexp = new RegExp('\\{' + i + '\\}', 'gi');
                formatted = formatted.replace(regexp, args[i]);
            }
            return formatted;
        }
        else {
            return key;
        }
    }

    public static createInputElement(ph: string, id: string, type: string) {
        var inputelement = document.createElement('input');
        inputelement.setAttribute("type", type);
        inputelement.setAttribute("value", "");
        inputelement.setAttribute("id", id);
        inputelement.placeholder = ph;
        return inputelement;
    }
    private static spinnerCSSAdded = false;
    private static addLoadingSpinnerAnimation() {
        if (this.spinnerCSSAdded) {
            return;
        }
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }";
        document.getElementsByTagName('head')[0].appendChild(style);
        this.spinnerCSSAdded = true;
    }
}