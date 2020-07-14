import { UxUtils } from "../common/UxUtils";

export class UxCommonComponent {
    /*
    *	 @desc Container to display the progress bar with people who and responded to total memeber of the group
    */
    public static async getTopSummaryView(actionSummary: actionSDK.ActionDataRowsSummary, actionMemberCount: number, currentView, nextView, onClickFunction: Function) {
        let participationPercentage = 0;
        const barDiv = UxUtils.getDiv();
        UxUtils.setClass(barDiv, "TopSummaryContainer");
        participationPercentage = Math.round((actionSummary.rowCreatorCount / actionMemberCount) * 100);
        let percentageBar = UxUtils.getDiv();
        let headingpercentage = UxUtils.getElement("text");
        UxUtils.setClass(headingpercentage, "headings")
        UxUtils.setText(headingpercentage, UxUtils.getString("participationPercentage", participationPercentage));
        UxUtils.addElement(headingpercentage, percentageBar);
        let progressBar = UxUtils.getDiv();
        UxUtils.setClass(progressBar, "progressBar");
        let myProgress = UxUtils.getElement('span');

        UxUtils.addCSS(myProgress, { width: participationPercentage + "%" });

        UxUtils.addElement(myProgress, progressBar);

        let buttonLink = UxUtils.getDiv();
        UxUtils.setClass(buttonLink, "topSummaryText");
        let summaryTextButton = UxUtils.getElement("button");
        UxUtils.setClass(summaryTextButton, "buttonAsString textSmallBold coloredLinkBold");
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
        UxUtils.setClass(responseRowSpan, "row");

        let optionDetails = UxUtils.getDiv();
        UxUtils.setClass(optionDetails, "row");
        let optionTitle = UxUtils.getElement("text");
        UxUtils.setClass(optionTitle, "textDisplay columnleft");
        UxUtils.setText(optionTitle, title);
        UxUtils.addElement(optionTitle, optionDetails);

        let optionParticipation = UxUtils.getElement("text");
        UxUtils.setClass(optionParticipation, "textDisplay columnright");
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

    public static getAvatar(userName: string) {
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
        let initialsSpan = UxUtils.getElement("span");
        UxUtils.setClass(initialsSpan, "initials");
        UxUtils.setText(initialsSpan, initials);
        UxUtils.addElement(initialsSpan, profilePic);
        return profilePic;
    }
}