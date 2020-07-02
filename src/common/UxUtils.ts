import { Utils } from "./Utils";
import strings from '../../assets/strings/en-us/strings.json';

export class UxUtils {
    private static readonly DEFAULT_SPACE_LENGTH = "10pt";
    private static readonly DEFAULT_IMAGE_DIMEN = "50pt";
    /*
    *   @desc creates a alert box, with title, message to display and ok/cancel action and provide the styling
    *       e.g. - showAlertDailog("alertTitle","Messgae","ok",OnOk,"cancel",onCancel;
    *       here, onOk and onCancel are two functions
    *   @params
    *       title - Title of alert
    *       okButtonTitle - string to display for ok
    *       okButtonAction - function() with action on okbutton click. Optional
    *       cancelButtonTitle - string to display for cancel button
    *       cacelButtonAction - function() with action on cancelbutton. Optional
    *   @return Null
   */
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
    /*
    *   @desc Create a spinner to show till the page is being loading and adds the css styling. You can add your own style attributes as well
    *   @params
    *       attributes - css attributes. Optional
    *   @return div HTML element with spin animation
    */
    public static getLoadingSpinner(attributes: {} = null): HTMLDivElement {
        var loadSpinner = this.getDiv();
        loadSpinner.classList.add("loadingSpinnerAttributes");
        Object.assign(loadSpinner, attributes);
        return loadSpinner;
    }
    /*
    *   @desc Create a pie chart for the provided data and provided respective colors.
    *   here, arc(x,y,r,sAngle,eAngle,counterclockwise) = arc(canvasWidth / 2, canvasHeight / 2, radius, startAngle, endAngle, counterClockWise);
    *   @params
    *       data - array of numbers
    *       colors - array of colors per numbers in data
    *       borderColor - color for pieChart circumference
    *       canvas - The HTML <canvas> element is to draw graphics on a web page
    *       canvasWidth - width of canvas, which will be 2*radius of piechart
    *       canvasHeight - height of canvas, which will be 2*radius of piechart
    *   @return Null
    */
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
    /*
    *   @desc Creates a transparent full screen div using the stack order of an element.
    *   @params Empty
    *   @return div HTML element
    */
    public static getFullScreenTransparentContainer() {
        var fullScreenTransparentContainer = this.getDiv();
        fullScreenTransparentContainer.classList.add("fullScreenTransparentContainer");
        return fullScreenTransparentContainer;
    }
    /*
    *   @desc Creates div element positions in row-direction. It creates a div and appends the provided childrenElements horizontally.
    *       e.g. - getHorizontalDiv([element1,element2],{"style1":"value1","style2":"value2"});
    *   @params 
    *       childrenElements - array of elements which will be positioned row-directional
    *       attribute - css sttribute for elements. Optional
    *   @return div with element's flex direction row
    */
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
    /*
    *   @desc Creates div element psotions in column-direction. It creates a div and appends the provided childrenElements vertically.
    *       e.g. - getHorizontalDiv([element1,element2],{"style1":"value1","style2":"value2"});
    *   @params 
    *       childrenElements - array of elements which will be positioned column-directional
    *       attribute - css sttribute for elements. Optional
    *   @return div with element's flex direction column
    */
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
    /*
    *   @desc Creates a div which is sized according to its width and height properties,
    *   but grows to absorb any extra free space in the flex container, and shrinks to its minimum size to fit the container.
    *   @params Empty
    *   @result div HTML element
    */
    public static getFlexibleSpace(): HTMLDivElement {
        return this.getDiv({ flex: "1 1 auto" });
    }
    /*
    *   @desc Creates a div which is sized according to length provided
    *   @params 
    *       length - for height and width styling
    *   @result div HTML element
    */
    public static getSpace(length: string = this.DEFAULT_SPACE_LENGTH): HTMLDivElement {
        var spaceDiv = this.getDiv();
        this.addCSS(spaceDiv, { width: length, height: length, flex: "none" });
        return spaceDiv;
    }
    /*
    *   @desc Creates a div element and populates the element's text with the provided string.
    *   @params 
    *       text - text to display
    *       attributes - css attributed for label. Optional
    *       showLink - Heightlight the text if the text is href. Optional
    *   @result div HTML element
    */
    public static getLabel(text: string = null, attributes: {} = null, showLinks: boolean = true): HTMLDivElement {
        var labelDiv: HTMLDivElement = this.getDiv();
        labelDiv.classList.add("labelAttributes");
        Object.assign(labelDiv, attributes);
        this.setText(labelDiv, text, true, showLinks);
        return labelDiv;
    }
    /*
    *   @desc Creates a button HTML element 
    *       e.g. - getButton("Click me", testClick, {"style1":"value1","style2":"value2"});
    *       testClick is clickEvent function
    *   @params 
    *       title - string on button
    *       clickEvent - function for onclick event for button. optional
    *       attribute - css sttribute for button. Optional
    *   @return button element
    */
    public static getButton(title: string = null, clickEvent: () => void = null, attributes: {} = null): HTMLDivElement {
        var buttonDiv: HTMLDivElement = this.getDiv(attributes);
        this.setText(buttonDiv, title, true, false);
        this.addClickEvent(buttonDiv, clickEvent);
        return buttonDiv;
    }
    /*
    *   @desc set the text content for HTML element, either innerHTML or innerText
    *       e.g. - setText(element, "stringtodisplay");
    *   @params 
    *       element - HTMLElement for which the you want to set the text
    *       text - string to set. Optional
    *       asHTML - if true then it will set .innerHTML else innerText. Optional
    *       showLink - Heightlight the text if the text is href. Optional
    *  @return Null; 
    */
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
    /*
    *   @desc It takes a image path as parameter, convert it to circular base 64 image and add provided css attributes
    *   @params 
    *       data - image path
    *       dimen - image dimension. Optional
    *       attributes - css attributes. Optional
    *  @return circular base 64 image; 
    */
    public static getBase64CircularImage(data: string = null, dimen: string = this.DEFAULT_IMAGE_DIMEN, attributes: {} = null): HTMLImageElement {
        var circularImage = this.getBase64Image(data);
        circularImage.classList.add("circularImageAttributes");
        Object.assign(circularImage, attributes);
        return circularImage;
    }
    /*
    *   @desc It takes a image path as parameter, convert it to circular image and add provided css attributes
    *   @params 
    *       data - image path
    *       dimen - image dimension. Optional
    *       attributes - css attributes. Optional
    *  @return circular image; 
    */
    public static getCircularImage(path: string = null, dimen: string = this.DEFAULT_IMAGE_DIMEN, attributes: {} = null): HTMLImageElement {
        var circularImage = this.getImage(path);
        circularImage.classList.add("circularImageAttributes");
        Object.assign(circularImage, attributes);
        return circularImage;

    }
    /*
    *   @desc It takes a image path as parameter, convert it to base 64 image and add provided css attributes
    *   @params 
    *       data - image path
    *       dimen - image dimension. Optional
    *       attributes - css attributes. Optional
    *  @return base64 converted image; 
    */
    public static getBase64Image(data: string = null, attributes: {} = null): HTMLImageElement {
        return this.getImage(this.getBase64Src(data), attributes);
    }
    /*
    *   @desc It takes a image path as parameter and use the base64 encoded string as a value of the src parameter, using a data:image/... construct.
    *   @params 
    *       data - image path
    *  @return base64 converted source; 
    */
    public static getBase64Src(data: string): string {
        return "data:image/png;base64," + data;
    }
    /*
    *   @desc It takes a image path as parameter and add provided css attributes
    *   @params 
    *       data - image path
    *       attributes - css attributes. Optional
    *  @return image HTML element; 
    */
    public static getImage(path: string = null, attributes: {} = null): HTMLImageElement {
        var image: HTMLImageElement = <HTMLImageElement>this.getElement("img");
        image.src = path;
        image.classList.add("imageAttributes");
        Object.assign(image, attributes);
        return image;
    }
    /*
    *   @desc creates a HTML div element
    *       e.g. - getDiv({"style1":"value1","style2":"value2"});
    *   @params 
    *       attributes - css attribute for the given div element. Optional
    *   @return div element
    */
    public static getDiv(attributes: {} = null): HTMLDivElement {
        return <HTMLDivElement>this.getElement("div", attributes);
    }
    /*
    *   @desc Creates a pre(preformatted text) element which preserves both spaces and line breaks.
    *   @params 
    *       attributes - css attribute for the given pre element. Optional
    *   @return div pre tagged element
    */
    public static getPrettyPrintDiv(attributes: {} = null): HTMLDivElement {
        return <HTMLDivElement>this.getElement("pre", attributes);
    }
    /*
    *   @desc Creates a canvas element with provided width and height to draw graphics on a web page.
    *       e.g. - getCanvas(10,10,{"border":"1px solid #000000"})
    *   @params 
    *       width - width of canvas
    *       height - height of canvas
    *       attributes - css attribute for the given pre element. Optional
    *   @return div pre tagged element
    */
    public static getCanvas(width: number, height: number, attributes: {} = null): HTMLCanvasElement {
        var canvas: HTMLCanvasElement = this.createHiDPICanvas(width, height);
        this.addCSS(canvas, attributes);
        return canvas;
    }
    /*
    *   @desc appends the element to it's parent element
    *   @params 
    *       element - child element;
    *       parentElement - parent element. Optional
    *   @return Null
    */
    public static addElement(element: HTMLElement = null, parentElement: HTMLElement = null) {
        if (element && parentElement) {
            parentElement.appendChild(element);
        }
    }
    /*
    *   @desc It removes the provided child element from it's parentElement
    *   @params 
    *       element - child HTML element;
    *       parentElement - parent HTML element. Optional
    *   @return Null
    */
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
    /*
    *   @desc It replaces one child element with another element under a parentElement
    *   @params 
    *       newElement - new child element to be appended
    *       oldElement - old child element appended to the parent element
    *       parentElement - parentElement, whose child element will be replaced
    *   @return Null
    */
    public static replaceElement(newElement: HTMLElement = null, oldElement: HTMLElement = null, parentElement: HTMLElement = null) {
        if (newElement && oldElement && parentElement) {
            parentElement.replaceChild(newElement, oldElement);
        }
    }
    /*
    *   @desc It removes all the child element from the provided element
    *   @params 
    *       element - HTML element;
    *   @return Null
    */
    public static clearElement(element: HTMLElement = null) {
        while (element && element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
    /*
    *   @desc creates a HTML element of the type you will pass in argument
    *       e.g. - getElement("span",{"style1":"value1"})
    *   @params 
    *      elementTag - element type to create
    *      attributes - css attributes to add in the element. Optional
    *   @return button element
   */
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
    /*
    *   @desc set the id for the HTML element
    *       e.g. setId(element, "elementId")
    *   @params 
    *       element - HTMLElement for which you will set id
    *       id - element identifier
    *   @return Null; It will set all the attribite for the element
    */
    public static setId(element: HTMLElement, id: string) {
        if (!Utils.isEmptyString(id)) {
            element.id = id;
        }
    }
    /*
    *   @desc set the css for the HTML element
    *       e.g. - setClass(element, "classnameone classnametwo")
    *   @params 
    *       element - HTMLElement in which you have to apply attributes
    *       classname - elemets's class name(s)
    *   @return Null; It will set all the attribite for the element
    */
    public static setClass(element: HTMLElement, className: string) {
        if (!Utils.isEmptyString(className)) {
            element.className = className;
        }
    }
    /*
    *   @desc set the css for the HTML element
    *       e.g. - addCSS(element, { style1: value })
    *   @params 
    *       element - HTMLElement in which you have to apply attributes
    *       attributes - css attributes. Optional
    *   @return Null; It will set all the attribite for the element
    */
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

    /* 
    *   @desc It sets tabs functionality using buttons, div, classes and data-* attributes
    *       e.g. - setTabs("buttonClass", "buttonClass--active", "contentClass", "contentClass--active", "data-for-tab", "data-tab");
    *   @params  
    *       arg1: common classname of button
    *       arg2: classname for button for which content will be shown(active)
    *       arg3: common classname for the contents 
    *       arg4: classname for the content to be displayed(active)
    *       arg5: Attribute for the button to fetch data active content class
    *       arg6: Attribute for the content to display the data
    *   return Null; sets the clicked button and respective content as active class for active tab
    */
    public static setTabs(buttonClass: string, buttonClassActive: string, contentClass: string, contentClassActive: string, OnButtonAttribute: string, onContentAttribute: string) {
        document.querySelectorAll("." + buttonClass).forEach(button => {
            button.addEventListener("click", () => {
                const barParent = button.parentElement;
                const contentContainer = barParent.parentElement;
                const tabNum = button.getAttribute(OnButtonAttribute);
                const tabActive = contentContainer.querySelector(`.${contentClass}[${onContentAttribute}="${tabNum}"]`);
                barParent.querySelectorAll("." + buttonClass).forEach(button => {
                    button.classList.remove(buttonClassActive);
                });
                contentContainer.querySelectorAll("." + contentClass).forEach(tab => {
                    tab.classList.remove(contentClassActive);
                });

                button.classList.add(buttonClassActive);
                tabActive.classList.add(contentClassActive);
            });
        });
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
        this.addAttribute(can, { "width": w * ratio, "height": h * ratio });
        this.addCSS(can, { "width": w + "pt", "height": h + "pt" });
        can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
        return can;
    }
    /////////////////// HTML Elements ///////////////////


    /////////////////// CSS Attributes ///////////////////
    /*
    *   @desc set the non-css attribute for the HTML element
    *       e.g. - addAttribute(element, { "class": "classname", "atr1": "value1", "atr2": "value2" });
    *   @params 
    *       element - HTMLElement in which you have to apply attributes
    *       attributes - element attributes to set. Optional
    *   @return Null; It will set all the attribite for the element
    */
    public static addAttribute(element: HTMLElement, attributes: {} = null) {
        for (var atr in attributes) {
            element.setAttribute(atr, attributes[atr]);
        }
    }

    public static getLoadingSpinnerAttributes() {
        this.addLoadingSpinnerAnimation();
    }

    public static lineBreak() {
        return document.createElement('br');
    }

    public static getContentEditableSpan(text: string = "", placeholder: string = "", attributes: {} = null, onInputEvent: () => void) {
        var element = this.getElement("span");
        this.addAttribute(element, { "placeholder": placeholder, 'contenteditable': true });
        element.classList.add("getContentEditableSpanAttributes");
        Object.assign(element, attributes);
        UxUtils.setText(element, text);

        var maxLength = attributes["max-length"];
        if (maxLength) {
            UxUtils.setText(element, text.length > maxLength ? text.substr(0, maxLength) : text);
        }
        var prevString = element.innerText;

        element.addEventListener('input', function () {
            if (this.innerText.trim() == "") {
                // this.clearElement(this);
            }

            if (maxLength && this.innerText.length > maxLength) {
                UxUtils.setText(this, prevString);
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
        this.addAttribute(inputelement, { "type": type, "value": "", "id": id, placeholder: ph });
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