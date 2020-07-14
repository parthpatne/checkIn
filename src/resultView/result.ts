
import * as actionSDK from 'action-sdk-sunny';
import { Utils } from "../common/Utils";
import { UxUtils } from "../common/UxUtils";
import { ActionSdkHelper } from '../common/ActionSdkHelper';
import { UxCommonComponent } from './UxCommonComponent';

const root = document.getElementById("root");
let actionInstance = null;
let actionSummary = null;
let actionContext = null;
let actionDataRows = null;
let actionDataRowsLength = 0;
let ResponderDetails = [];
let actionNonResponders = [];
let myUserId = "";
let actionMemberCount = 0;
OnPageLoad();
/*
*   @desc Creates the body of SummaryView when you click on ViewResults on actionInstance
*/
async function createBody() {
    UxUtils.addElement(await mainPage(), root);
    getResNonResTabs();
    getResponderListPagePerQuestion();
    getPageResponsePerUser();

}
/*
*   @desc Creates the header of summary View, actionInstance have a filed for expiry date, which has beedn used here to get due date
*/
function getHeaderContainer() {
    const headerContainer = UxUtils.getDiv();
    UxUtils.setClass(headerContainer, "headerContainer");

    const title = UxUtils.getDiv();
    UxUtils.setClass(title, "summaryTitle");
    UxUtils.setText(title, actionInstance.displayName);

    let optionDetails = UxUtils.getDiv();
    UxUtils.setClass(optionDetails, "rowAlign");
    let dueDate = UxUtils.getElement("text");
    UxUtils.setClass(dueDate, "subHeading columnleft");
    UxUtils.setText(dueDate, UxUtils.getString("dueBy", new Date(actionInstance.expiryTime).toDateString()));
    UxUtils.addElement(dueDate, optionDetails);

    UxUtils.addElement(title, headerContainer);
    UxUtils.addElement(optionDetails, headerContainer);
    return headerContainer;
}
function createQuestionView() {
    const totalQuestion = UxUtils.getDiv();
    actionInstance.dataTables[0].dataColumns.forEach((column) => {

        const questionDiv = UxUtils.getDiv();
        UxUtils.setClass(questionDiv, "questionContainer");
        const questionHeading = UxUtils.getElement('h4');

        UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
        UxUtils.setText(questionHeading, column.displayName);
        UxUtils.addElement(questionHeading, questionDiv);
        let optionView = null;
        switch (column.valueType) {
            case actionSDK.ActionDataColumnValueType.SingleOption:
            case actionSDK.ActionDataColumnValueType.MultiOption:
                column.options.forEach((option: actionSDK.ActionDataColumnOption) => {
                    optionView = UxCommonComponent.getAggregateOptionView(actionSummary, option.displayName, option.name, column);
                    UxUtils.addElement(optionView, questionDiv);
                });
                break;
            case actionSDK.ActionDataColumnValueType.Numeric:
                optionView = getAggregateNumericView(column);
                UxUtils.addElement(optionView, questionDiv);
                break;
            default:
                optionView = getAggregateTextView(column);
                UxUtils.addElement(optionView, questionDiv);
        }
        UxUtils.addElement(questionDiv, totalQuestion);
    });
    return totalQuestion;
}
/*
*	 @desc Gets aggregated response for numeric questions, numeric questions summary has json field for sum and average
*	 @param column: one question from dataTables[i].dataColumns: actionSDK.ActionDataColumnValueType
*	 @return HTML div row with number of responses, sum and average
*/
function getAggregateNumericView(column) {
    let numericQuestion = UxUtils.getDiv();
    let questionSummary = (actionSummary.defaultAggregates).hasOwnProperty(column.name) ? JSON.parse(actionSummary.defaultAggregates[column.name]) : {};
    let responseCount = 0;
    for (let i = 0; i < questionSummary.length; i++) {
        if (!Utils.isEmptyString(questionSummary[i])) {
            responseCount++;
        }
    }
    let sum = questionSummary.hasOwnProperty("s") ? questionSummary["s"] : 0;
    let average = questionSummary.hasOwnProperty("a") ? questionSummary["a"] : 0;
    let responsesCount = (sum === 0) ? responseCount : (Math.round(sum / average));

    let responseRowSpan = UxUtils.getDiv();
    UxUtils.setClass(responseRowSpan, "row");
    let sumText = UxUtils.getElement("text");
    UxUtils.setClass(sumText, "textDisplay columncenter");
    UxUtils.setText(sumText, UxUtils.getString("sum", sum));
    let averageText = UxUtils.getElement("text");
    UxUtils.setClass(averageText, "textDisplay columncenter");
    UxUtils.setText(averageText, UxUtils.getString("average", average.toFixed(2)));
    let responseText = UxUtils.getElement("button");
    UxUtils.setText(responseText, UxUtils.getString("responseCount", responsesCount));
    UxUtils.setClass(responseText, "buttonAsString columncenter");
    responseText.addEventListener('click', () => {
        getResponsesperQuestion(column);
        UxCommonComponent.setPages("aggregateSummaryPage", "responseViewPage");
    });
    UxUtils.addElement(responseText, responseRowSpan);
    UxUtils.addElement(sumText, responseRowSpan);
    UxUtils.addElement(averageText, responseRowSpan);
    UxUtils.addElement(responseRowSpan, numericQuestion);
    return numericQuestion;
}
/*
*	 @desc Gets aggregated response for text questions
*	 @params column: one question from dataTables[i].dataColumns: actionSDK.ActionDataColumnValueType
*	 @return a HTML div row with number of responses
*/
function getAggregateTextView(column) {
    let textQuestion = UxUtils.getDiv();
    let questionSummary = (actionSummary.defaultAggregates).hasOwnProperty(column.name) ? JSON.parse(actionSummary.defaultAggregates[column.name]) : [];
    let responseCount = 0;
    for (let i = 0; i < questionSummary.length; i++) {
        if (!Utils.isEmptyString(questionSummary[i])) {
            responseCount++;
        }
    }
    let responseRowSpan = UxUtils.getDiv();
    UxUtils.setClass(responseRowSpan, "row");
    let responseText = UxUtils.getElement("button");
    UxUtils.setText(responseText, UxUtils.getString("responseCount", responseCount));
    UxUtils.setClass(responseText, "buttonAsString columncenter");
    responseText.addEventListener('click', () => {
        getResponsesperQuestion(column);
        UxCommonComponent.setPages("aggregateSummaryPage", "responseViewPage");
    });
    UxUtils.addElement(responseText, responseRowSpan);
    UxUtils.addElement(responseRowSpan, textQuestion);
    return textQuestion;
}
/*
*   @desc Creates the aggreagteSummary of summary View. It has three module: getHeader, summarized progress bar and question summary
*/
async function mainPage() {
    const aggregateSummaryPage = UxUtils.getDiv({ display: "block" });
    UxUtils.setClass(aggregateSummaryPage, "aggregateSummaryPage");
    UxUtils.setId(aggregateSummaryPage, "aggregateSummaryPage");
    const headerContainer = getHeaderContainer();
    UxUtils.addElement(headerContainer, aggregateSummaryPage);
    const sumamaryContainer = await UxCommonComponent.getTopSummaryView(actionSummary, actionMemberCount, "aggregateSummaryPage", "tabPage", UxCommonComponent.setPages);
    UxUtils.addElement(sumamaryContainer, aggregateSummaryPage);
    const questionContainer = createQuestionView();
    UxUtils.addElement(questionContainer, aggregateSummaryPage);
    return aggregateSummaryPage;
}
/*
*	@desc Create a tab interface with two tabs, per responders and non-responders and append it to HTML body.
*   getResponderTabs() populates the tab1 with responder's details and getNonResponnderTabs() populates the tab2 with non-responder's details
*/
async function getResNonResTabs() {
    let tabPage = UxUtils.getDiv();
    UxUtils.setClass(tabPage, "tabPage");
    UxUtils.setId(tabPage, "tabPage");

    let summaryText = UxUtils.getElement("div");
    UxUtils.addAttribute(summaryText, { class: "textSmallBold headerView" });
    if (actionSummary.rowCreatorCount == actionSummary.rowCount) {
        UxUtils.setText(summaryText, UxUtils.getString("XofYresponded", actionSummary.rowCreatorCount, actionMemberCount));
    }
    else {
        UxUtils.setText(summaryText, UxUtils.getString("NResponseYPeople", actionSummary.rowCount, actionSummary.rowCreatorCount));
    }

    UxUtils.addElement(summaryText, tabPage);
    let tabDiv = UxUtils.getDiv();
    UxUtils.setClass(tabDiv, "tabs");

    let tabBarDiv = UxUtils.getDiv();
    UxUtils.setClass(tabBarDiv, "tabs__horizontal");

    let responderButton = UxUtils.getElement("button");
    UxUtils.setText(responderButton, UxUtils.getString("responders"));
    UxUtils.addAttribute(responderButton, { "class": "tabs__button tabs__button--active", "data-for-tab": "1" });

    let nonResponderButton = UxUtils.getElement("button");
    UxUtils.setText(nonResponderButton, UxUtils.getString("nonResponders"));
    UxUtils.addAttribute(nonResponderButton, { "class": "tabs__button", "data-for-tab": "2" });

    UxUtils.addElement(responderButton, tabDiv);
    UxUtils.addElement(nonResponderButton, tabDiv);

    UxUtils.addElement(tabDiv, tabPage);

    UxUtils.addElement(getResponderTabs(), tabBarDiv);
    UxUtils.addElement(getNonRespondersTabs(), tabBarDiv);
    UxUtils.addElement(tabBarDiv, tabPage);

    let backButton = UxUtils.getElement("button");
    UxUtils.setText(backButton, UxUtils.getString("back"));
    UxUtils.setClass(backButton, "buttonAsString footer");
    UxUtils.addElement(backButton, tabPage);

    backButton.addEventListener('click', () => {
        UxCommonComponent.setPages("tabPage", "aggregateSummaryPage");
    });
    UxUtils.addCSS(tabPage, { display: "none" });
    UxUtils.addElement(tabPage, root);
    setTabs("tabs__button", "tabs__button--active", "tabs__content", "tabs__content--active", "data-for-tab", "data-tab");
}
/*
*	@desc Create the content box for responders of the actionInstance in tabular format
*   columnone: profilePic, column two: name of responder and column three: latest time of response
*/
function getResponderTabs() {
    let responderContent = UxUtils.getDiv();
    UxUtils.addAttribute(responderContent, { "class": "tabs__content tabs__content--active", "data-tab": "1" });
    let ResponderDiv = UxUtils.getDiv();
    let table = UxUtils.getElement('TABLE');
    let tableBody = UxUtils.getElement('TBODY');
    UxUtils.addElement(tableBody, table);
    for (let itr = 0; itr < ResponderDetails.length; itr++) {
        let tableRow = UxUtils.getElement('TR');
        UxUtils.setId(tableRow, ResponderDetails[itr].userId);
        UxUtils.setClass(tableRow, "textDisplay clickable");
        UxUtils.addElement(tableRow, tableBody);
        let profilePicColumn = UxUtils.getElement('TD');
        let profilePic = UxUtils.getElement("img");
        UxUtils.addAttribute(profilePic, { "class": "profilePic", "src": "images/dummyUser.png", "alt": "Avatar" });
        UxUtils.addElement(profilePic, profilePicColumn);
        UxUtils.addElement(profilePicColumn, tableRow);

        let nameColumn = UxUtils.getElement('TD');
        if (ResponderDetails[itr].userId == myUserId) {
            UxUtils.setText(nameColumn, UxUtils.getString("You"));
        }
        else {
            UxUtils.setText(nameColumn, ResponderDetails[itr].label);
        }
        UxUtils.addElement(nameColumn, tableRow);
        let dateColumn = UxUtils.getElement('TD');
        UxUtils.setText(dateColumn, ResponderDetails[itr].time);
        UxUtils.addElement(dateColumn, tableRow);
    }
    tableBody.onclick = function (event) {
        let target = (<HTMLElement>event.target);
        if (target.tagName == 'TD') {
            let index = (<HTMLTableRowElement>target.parentElement).rowIndex;
            let id = (<HTMLTableRowElement>target.parentElement).id;
            getResponsePerUser(id, index);
            UxCommonComponent.setPages("tabPage", "responsePerUserViewPage");
        }
    };
    UxUtils.addElement(table, ResponderDiv);
    UxUtils.addElement(ResponderDiv, responderContent);
    return responderContent;
}
/*
*	 @desc Create the content box for non-responders of the actionInstance and  pupulate it with non-responder's name
*/
function getNonRespondersTabs() {
    let nonResponderContent = UxUtils.getDiv();
    UxUtils.addAttribute(nonResponderContent, { "class": "tabs__content", "data-tab": "2" });
    let NonResponderDiv = UxUtils.getDiv();
    let table = UxUtils.getElement('TABLE');
    let tableBody = UxUtils.getElement('TBODY');
    UxUtils.addElement(tableBody, table);
    for (let itr = 0; itr < actionNonResponders.length; itr++) {
        let tableRow = UxUtils.getElement('TR');
        UxUtils.setId(tableRow, actionNonResponders[itr].userId);
        UxUtils.setClass(tableRow, "textDisplay");
        UxUtils.addElement(tableRow, tableBody);
        let profilePicColumn = UxUtils.getElement('TD');
        let profilePic = UxUtils.getElement("img");
        UxUtils.addAttribute(profilePic, { "class": "profilePic", "src": "images/dummyUser.png", "alt": "Avatar" });
        UxUtils.addElement(profilePic, profilePicColumn);
        UxUtils.addElement(profilePicColumn, tableRow);

        let nameColumn = UxUtils.getElement('TD');
        if (actionNonResponders[itr].userId == myUserId) {
            UxUtils.setText(nameColumn, UxUtils.getString("You"));
        }
        else {
            UxUtils.setText(nameColumn, actionNonResponders[itr].label);
        }
        UxUtils.addElement(nameColumn, tableRow);
    }
    UxUtils.addElement(table, NonResponderDiv);
    UxUtils.addElement(NonResponderDiv, nonResponderContent);
    return nonResponderContent;
}
/*
*	@desc Creates a page to display responses per question
*   All the components of this page gets flushed and re-populated on each click of question's response count in aggregateSummaryPage
*/
function getResponderListPagePerQuestion() {
    let responseView = UxUtils.getDiv();
    UxUtils.setClass(responseView, "responseViewPage");
    UxUtils.setId(responseView, "responseViewPage");
    UxUtils.addCSS(responseView, { display: "none" });
    UxUtils.addElement(responseView, root);
}
/*
*	@desc Populate the per question response page
*	@param column - question from dataTables[i].dataColumns: actionSDK.ActionDataColumnValueType
*/
function getResponsesperQuestion(column) {
    let rowDiv = UxUtils.getDiv();
    UxUtils.setClass(rowDiv, "responseRow");
    let pageId = document.getElementById("responseViewPage");
    UxUtils.clearElement(pageId);
    if (pageId) {
        let Identity = UxUtils.getDiv();
        UxUtils.setClass(Identity, "ResponseHeader");
        let questionTitle = UxUtils.getDiv();
        UxUtils.setClass(questionTitle, "TitleDiv");
        UxUtils.setText(questionTitle, column.displayName);
        UxUtils.addElement(questionTitle, Identity);
        UxUtils.addElement(Identity, pageId);
        for (let itr = 0; itr < ResponderDetails.length; itr++) {
            let rowData = UxUtils.getDiv();
            UxUtils.setClass(rowData, "responseContainer");
            let userProfile = UxUtils.getElement("span");
            UxUtils.setClass(userProfile, "userProfile");
            let perRowuser = UxUtils.getElement("Text");
            UxUtils.setClass(perRowuser, "textDisplay");
            let profilePic = UxUtils.getElement('img');
            UxUtils.addAttribute(profilePic, { "class": "profilePic", "src": "images/dummyUser.png", "alt": "Avatar" });
            if (myUserId == actionDataRows[itr].creatorId) {
                UxUtils.setText(perRowuser, UxUtils.getString("You"));
            }
            else {
                UxUtils.setText(perRowuser, ResponderDetails[itr].label);
            }
            UxUtils.addElement(profilePic, userProfile);
            UxUtils.addElement(perRowuser, userProfile);
            UxUtils.addElement(userProfile, rowData);
            let perRowResponse = UxUtils.getDiv();
            UxUtils.setClass(perRowResponse, "responsePerQuestion");
            UxUtils.setText(perRowResponse, actionDataRows[itr].columnValues[column.name]);
            UxUtils.addElement(perRowResponse, rowData);
            UxUtils.addElement(rowData, rowDiv);
            UxUtils.addElement(UxUtils.lineBreak(), rowDiv);
        }
    }
    let backButton = UxUtils.getElement("button");
    UxUtils.setText(backButton, UxUtils.getString("back"));;
    UxUtils.setClass(backButton, "buttonAsString footer");
    backButton.addEventListener('click', () => {
        UxCommonComponent.setPages("responseViewPage", "aggregateSummaryPage");
    });
    UxUtils.addElement(rowDiv, pageId);
    UxUtils.addElement(backButton, pageId);
}
/*
*	@desc Creates a page to display responses per user. 
*   All the components of this page gets flushed and re-populated on each click of responder's name of getRespondersTab()
*/
function getPageResponsePerUser() {
    let ResponsePerUserView = UxUtils.getDiv();
    UxUtils.setClass(ResponsePerUserView, "ResponsePerUserViewPage");
    UxUtils.setId(ResponsePerUserView, "responsePerUserViewPage");
    UxUtils.addCSS(ResponsePerUserView, { display: "none" });
    UxUtils.addElement(ResponsePerUserView, root);
}
/*
*	@desc Populate the response page per user. 
*	@param id - creatorId of user received from subscriptionMmber: string
*   @param index - index of user response stored in dataRows which is same as the index of rows in table: number (row index)
*/
async function getResponsePerUser(id, index) {
    let rowDiv = UxUtils.getDiv();
    UxUtils.setClass(rowDiv, "responseRow");
    let pageId = document.getElementById("responsePerUserViewPage");
    UxUtils.clearElement(pageId);
    if (pageId) {
        let Identity = UxUtils.getDiv();
        UxUtils.setClass(Identity, "ResponseHeader");
        let responderPic = UxUtils.getElement("span");
        let profilePic = UxUtils.getElement("img");
        UxUtils.addAttribute(profilePic, { "class": "profilePic", "src": "images/dummyUser.png", "alt": "Avatar" });
        UxUtils.addElement(profilePic, responderPic);
        UxUtils.addElement(responderPic, Identity);
        let responderName = UxUtils.getElement("span");
        UxUtils.setClass(responderName, "TitleDiv");
        let userDetail = await ActionSdkHelper.getResponder(actionContext.subscription, id);
        if (id == myUserId) {
            UxUtils.setText(responderName, UxUtils.getString("YourResponse"));
        }
        else {
            UxUtils.setText(responderName, userDetail[0].displayName);
        }
        UxUtils.addElement(responderName, Identity);
        let dataPerUser = actionDataRows[index].columnValues;
        UxUtils.addElement(Identity, pageId);
        let questionItr = 0;
        for (let idx in dataPerUser) {
            let rowData = UxUtils.getDiv();
            UxUtils.setClass(rowData, "responseContainer");
            let ques = UxUtils.getDiv();
            UxUtils.setClass(ques, "textDisplay");
            UxUtils.setText(ques, UxUtils.getString("question", questionItr + 1, actionInstance.dataTables[0].dataColumns[questionItr].displayName));
            let ans = UxUtils.getDiv();
            UxUtils.setClass(ans, "responsePerQuestion");
            if (actionInstance.dataTables[0].dataColumns[questionItr].valueType.localeCompare("SingleOption") == 0 || actionInstance.dataTables[0].dataColumns[questionItr].valueType.localeCompare("MultiOption") == 0) {
                let optionques = actionInstance.dataTables[0].dataColumns[questionItr].options
                for (let opt = 0; opt < optionques.length; opt++) {
                    if ((optionques[opt].name).localeCompare(actionDataRows[index].columnValues[idx]) == 0) {
                        UxUtils.setText(ans, optionques[opt].displayName);
                        break;
                    }
                }
            }
            else {
                UxUtils.setText(ans, actionDataRows[index].columnValues[idx]);
            }
            UxUtils.addElement(ques, rowData);
            UxUtils.addElement(ans, rowData);
            questionItr++;
            UxUtils.addElement(rowData, rowDiv);
            UxUtils.addElement(UxUtils.lineBreak(), rowDiv);
        }
    }
    let backButton = UxUtils.getElement("button");
    UxUtils.setText(backButton, UxUtils.getString("back"));
    UxUtils.setClass(backButton, "buttonAsString footer");
    backButton.addEventListener('click', () => {
        UxCommonComponent.setPages("responsePerUserViewPage", "tabPage");
    });
    UxUtils.addElement(rowDiv, pageId);
    UxUtils.addElement(backButton, pageId);
}
/* 
    *   @desc It sets tabs functionality using buttons, div, classes and data-* attributes
    *       e.g. - setTabs("buttonClass", "buttonClass--active", "contentClass", "contentClass--active", "data-for-tab", "data-tab");
    *   @param buttonClass: common classname of button: string
    *   @param buttonClassActive: classname for button for which content will be shown(active): string
    *   @param contentClass: common classname for the contents: string
    *   @param contentClassActive: classname for the content to be displayed(active): string
    *   @param OnButtonAttribute: Attribute for the button to fetch data active content class: string
    *   @param onContentAttribute: Attribute for the content to display the data: string
    */
function setTabs(buttonClass: string, buttonClassActive: string, contentClass: string, contentClassActive: string, OnButtonAttribute: string, onContentAttribute: string) {
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
/*
*   @desc This function makes api call to fetch the actionInstance details like context, responses, summary, responder and non-responder details
*/
async function OnPageLoad() {
    actionContext = await ActionSdkHelper.getContext();
    if (actionContext) {
        myUserId = actionContext.userId;
        actionInstance = await ActionSdkHelper.getActionInstance(actionContext);
        actionSummary = await ActionSdkHelper.getActionSummary(actionContext);
        actionDataRows = await ActionSdkHelper.getActionDataRows(actionContext);
        actionMemberCount = await ActionSdkHelper.getMemberCount(actionContext);
        actionNonResponders = await ActionSdkHelper.getNonResponders(actionContext);
        if (actionDataRows) {
            actionDataRowsLength = actionDataRows == null ? 0 : actionDataRows.length;
            ResponderDetails = await ActionSdkHelper.getResponderDetails(actionContext, actionDataRowsLength, actionDataRows);
        }
        else {
            console.log("dataRows fetch failed");
        }
    }
    else {
        console.log("context fecth API failed");
    }
    createBody();
}