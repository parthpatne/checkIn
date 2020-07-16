import { UxUtils } from "../common/UxUtils";
import { Utils } from "../common/Utils";
import { ActionSdkHelper } from '../common/ActionSdkHelper';

export class UxCommonComponent {
    /*
    *	 @desc Container to display the progress bar with people who and responded to total memeber of the group
    */
    public static async getTopSummaryView(actionSummary: actionSDK.ActionDataRowsSummary, actionMemberCount: number, currentView, nextView, onClickFunction: Function) {
        let participationPercentage = 0;
        const barDiv = UxUtils.getDiv();
        UxUtils.setClass(barDiv, "topSummaryContainer");
        participationPercentage = Math.round((actionSummary.rowCreatorCount / actionMemberCount) * 100);
        let percentageBar = UxUtils.getDiv();
        let headingpercentage = UxUtils.getElement("text");
        UxUtils.setClass(headingpercentage, "heading")
        UxUtils.setText(headingpercentage, UxUtils.getString("participationPercentage", participationPercentage));
        UxUtils.addElement(headingpercentage, percentageBar);
        let progressBar = UxUtils.getDiv();
        UxUtils.setClass(progressBar, "progressBar");
        let myProgress = UxUtils.getElement('span');

        UxUtils.addCSS(myProgress, { width: participationPercentage + "%" });

        UxUtils.addElement(myProgress, progressBar);

        let buttonLink = UxUtils.getDiv({ "margin-top": "-8px" });
        let summaryTextButton = UxUtils.getElement("button");
        UxUtils.setClass(summaryTextButton, "linkColored sizeSmall");
        if (actionSummary.rowCreatorCount == actionSummary.rowCount) {
            UxUtils.setText(summaryTextButton, UxUtils.getString("XofYresponded", actionSummary.rowCreatorCount, actionMemberCount));
        }
        else {
            UxUtils.setText(summaryTextButton, UxUtils.getString("NResponseYPeople", actionSummary.rowCount, actionSummary.rowCreatorCount));
        }
        summaryTextButton.addEventListener('click', () => {
            onClickFunction(currentView, nextView);
        });
        UxUtils.addElement(summaryTextButton, buttonLink);

        UxUtils.addElement(percentageBar, barDiv);
        UxUtils.addElement(progressBar, barDiv);
        UxUtils.addElement(buttonLink, barDiv);
        return barDiv;
    }
    /*
    *	@desc It switched between display:none and display:block based on the page navigation.
    *       e.g.- setPages("pageId1","pageId2")
    *   @param divId1 - current displayed id and: elementId
    *   @param divId2 - next div to be displayed: elementId
    */
    public static setPages(id1, id2) {
        let elementIdCurrent = document.getElementById(id1);
        let elementIdNext = document.getElementById(id2);
        if (elementIdCurrent && elementIdCurrent.style.display == 'block') {
            UxUtils.addCSS(elementIdCurrent, { display: "none" });
            UxUtils.addCSS(elementIdNext, { display: "block" });
        }
    }
    /*
    *	 @desc Gets aggregated response for MCQ and their options
    *    @param title: title of the option from column for MCQ: actionSDK.ActionDataColumnOption.displayName
    *    @param id - id of option from column for MCQ : actionSDK.ActionDataColumnOption.name
    *    @param column - per question from dataTables[i].dataColumns: actionSDK.ActionDataColumnValueType
    *    @return progressbar for each option
    */
    public static getAggregateOptionView(actionSummary: actionSDK.ActionDataRowsSummary, title: string, optionId: string, column: actionSDK.ActionDataColumn) {

        let optionDiv = UxUtils.getDiv();
        let responseRowSpan = UxUtils.getDiv();

        let percentage = (actionSummary.defaultAggregates).hasOwnProperty(column.name) ? JSON.parse(actionSummary.defaultAggregates[column.name])[optionId] : 0;
        let wid = percentage / actionSummary.rowCount * 100;
        let optionpercentage = isNaN(wid) ? 0 : wid.toFixed(2);
        let optionCount = isNaN(percentage) ? 0 : percentage;
        UxUtils.setClass(responseRowSpan, "rowWise");

        let optionDetails = UxUtils.getDiv();
        UxUtils.setClass(optionDetails, "rowWise");
        let optionTitle = UxUtils.getElement("text", { "float": "left" });
        UxUtils.setClass(optionTitle, "textDisplayCommon");
        UxUtils.setText(optionTitle, title);
        UxUtils.addElement(optionTitle, optionDetails);

        let optionParticipation = UxUtils.getElement("text", { "float": "right" });
        UxUtils.setClass(optionParticipation, "textDisplayCommon");
        UxUtils.setText(optionParticipation, UxUtils.getString("optionParticipation", optionCount, optionpercentage));
        UxUtils.addElement(optionParticipation, optionDetails);

        UxUtils.addElement(optionDetails, responseRowSpan);

        let meterDiv = UxUtils.getDiv();
        UxUtils.setClass(meterDiv, "meter");
        let spanTag1 = UxUtils.getElement('span');

        UxUtils.addCSS(spanTag1, { width: optionpercentage + "%" });
        UxUtils.addElement(spanTag1, meterDiv);
        UxUtils.addElement(meterDiv, responseRowSpan);
        UxUtils.addElement(responseRowSpan, optionDiv);

        return optionDiv;
    }
    /*
    * Get avatar of initials
    * @param initials initials with which we want to create avatar
    */

    public static getAvatar(userName: string, attributesCircle: {} = null, attributesInitial: {} = null) {
        let names = userName.split(' ');
        let initials = names[0].substring(0, 1).toUpperCase();
        if (names.length == 1) {
            initials += names[0].substring(names[0].length - 1, names[0].length).toUpperCase();
        }
        else if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }

        let profilePic = UxUtils.getElement("span");
        UxUtils.setClass(profilePic, "circle");
        UxUtils.addCSS(profilePic, attributesCircle);
        let initialsSpan = UxUtils.getElement("span");
        UxUtils.setClass(initialsSpan, "initials");
        UxUtils.addCSS(initialsSpan, attributesInitial);
        UxUtils.setText(initialsSpan, initials);
        UxUtils.addElement(initialsSpan, profilePic);
        return profilePic;
    }
    public static getChangeSettingOption(actionInstance, data, expiryElementID) {
        let userMainDiv = UxUtils.getDiv();
        UxUtils.setClass(userMainDiv, "right size");

        // Adding dropdown on button for settings on result view
        let button = UxUtils.getElement("button");
        UxUtils.addAttribute(button, { "class": "nonebg-button settingButton", "id": "dropDownButton" });
        UxUtils.setText(button, UxUtils.getString("optionIndicator"));

        // dropdown for due date settings
        let options = [{
            text: data.dueDate.text,
            callback: dueDateChangeEvent
        }, {
            text: data.close.text,
            callback: closeEvent
        }, {
            text: data.delete.text,
            callback: deleteEvent
        }]

        let dropdown = UxUtils.getDropDown(options);

        let dueDateModalDiv = this.getDueDateModal(actionInstance, data.dueDate.text, expiryElementID);
        let closeDiv = this.getCloseModal(actionInstance, UxUtils.getString("areyousure") + data.close.text, expiryElementID);
        let deleteDiv = this.getDeleteModal(actionInstance, UxUtils.getString("areyousure") + data.delete.text);

        // listener to open change due date modal and close dropdown 
        function dueDateChangeEvent() {
            UxUtils.addCSS(dueDateModalDiv, { display: "block" });
        }

        function closeEvent() {
            UxUtils.addCSS(closeDiv, { display: "block" });
        }

        function deleteEvent() {
            UxUtils.addCSS(deleteDiv, { display: "block" });
        }
        // listener to close and open dropdown when someone click on button 
        UxUtils.addClickEvent(button, () => {
            UxUtils.setDisplay("myDropdown", "block");
        });
        UxUtils.addElement(button, userMainDiv);
        UxUtils.addElement(dueDateModalDiv, userMainDiv);
        UxUtils.addElement(closeDiv, userMainDiv);
        UxUtils.addElement(deleteDiv, userMainDiv);
        UxUtils.addElement(dropdown, userMainDiv);
        window.onclick = (event) => {
            if (event.target.id != "dropDownButton") {
                UxUtils.setDisplay("myDropdown", "none");
            }
        }
        return userMainDiv;

    }
    public static getModal(id, topView, submitListener) {
        // modal for due date change option
        let modalDiv = UxUtils.getDiv({ display: "none" });
        UxUtils.addAttribute(modalDiv, { class: "modal", id: id });

        let modalContentDiv = UxUtils.getDiv();
        UxUtils.addAttribute(modalContentDiv, { class: "modal-content" });

        // submit button to update due date of action
        let submitButton = UxUtils.getElement("button");
        UxUtils.setClass(submitButton, "right");
        UxUtils.setText(submitButton, UxUtils.getString("Submit"));
        UxUtils.addClickEvent(submitButton, () => {
            submitListener();
            UxUtils.addCSS(document.getElementById(id), { display: "none" });
        });

        // cancel button to cancel any change
        let cancelButton = UxUtils.getElement("button");
        UxUtils.setClass(cancelButton, "right rightMargin");
        UxUtils.setText(cancelButton, UxUtils.getString("cancel"));
        UxUtils.addClickEvent(cancelButton, () => {
            UxUtils.addCSS(document.getElementById(id), { display: "none" });
        });


        UxUtils.addElement(topView, modalContentDiv);
        UxUtils.addElement(UxUtils.lineBreak(), modalContentDiv);
        UxUtils.addElement(UxUtils.lineBreak(), modalContentDiv);
        UxUtils.addElement(submitButton, modalContentDiv);
        UxUtils.addElement(cancelButton, modalContentDiv);
        UxUtils.addElement(UxUtils.lineBreak(), modalContentDiv);

        UxUtils.addElement(modalContentDiv, modalDiv);
        return modalDiv;
    }

    public static getDueDateModal(actionInstance, text, expiryElementID) {

        let div = UxUtils.getDiv();

        // modal for due date change option
        let id = "dueDateModal";
        let b = UxUtils.getElement("b");
        UxUtils.setText(b, text);

        let modalContentDiv = UxUtils.getDiv();

        let expiryTime = Utils.getHTMLFormatDateTime(actionInstance.expiryTime);

        let input = UxUtils.getDateTimeElement("modalDueDate", null, expiryTime);
        UxUtils.setClass(input, "leftMargin");

        UxUtils.addElement(b, modalContentDiv);
        UxUtils.addElement(UxUtils.lineBreak(), modalContentDiv);
        UxUtils.addElement(UxUtils.lineBreak(), modalContentDiv);
        UxUtils.addElement(input, modalContentDiv);

        async function submitListener() {
            let newExpiry = new Date((<HTMLInputElement>document.getElementById("modalDueDate")).value).getTime();
            actionInstance = await ActionSdkHelper.updateActionInstance(actionInstance, { expiryTime: newExpiry });
            let dueDate = document.getElementById(expiryElementID);
            let dateTime = Utils.getDateTimeFormat(actionInstance.expiryTime);
            UxUtils.setText(dueDate, UxUtils.getString("expiredOn", dateTime));
            UxUtils.addCSS(document.getElementById(id), { display: "none" });
        }

        return this.getModal(id, modalContentDiv, submitListener);
    }

    public static getCloseModal(actionInstance, text, expiryElementID) {
        let id = "closeModal";

        let modalContentDiv = UxUtils.getDiv();

        let textToShow = UxUtils.getElement("text");
        UxUtils.setClass(textToShow, "bold textDisplay");
        UxUtils.setText(textToShow, text);

        async function submitListener() {
            actionInstance = await ActionSdkHelper.updateActionInstance(actionInstance, { status: "Closed", expiryTime: new Date().getTime() });
            let dueDate = document.getElementById(expiryElementID);
            let dateTime = Utils.getDateTimeFormat(actionInstance.expiryTime);
            UxUtils.setText(dueDate, UxUtils.getString("expiredOn", dateTime));
            UxUtils.addCSS(document.getElementById(id), { display: "none" });
        }

        UxUtils.addElement(textToShow, modalContentDiv);

        return this.getModal(id, modalContentDiv, submitListener);
    }

    public static getDeleteModal(actionInstance, text) {
        let id = "deleteModal";

        let modalContentDiv = UxUtils.getDiv();

        let textToShow = UxUtils.getElement("text");
        UxUtils.setClass(textToShow, "bold textDisplay");
        UxUtils.setText(textToShow, text);

        async function submitListener() {
            await ActionSdkHelper.deleteActionInstance(actionInstance.id);
            UxUtils.addCSS(document.getElementById(id), { display: "none" });
        }

        UxUtils.addElement(textToShow, modalContentDiv);

        return this.getModal(id, modalContentDiv, submitListener);
    }
}