
import * as actionSDK from 'action-sdk-sunny';
import { Utils } from "../common/Utils";
import { UxUtils } from "../common/UxUtils";

const root = document.getElementById("root");
let actionInstance = null;
let actionSummary = null;
let actionContext = null;
let actionDataRows = null;
let actionDataRowsLength = 0;
let ResponderDate = [];
let actionNonResponders = [];
let myUserId = "";
OnPageLoad();
/*
*   @desc Creates the body of SummaryView when you click on ViewResults on actionInstance
*/
async function createBody() {
    await getUserprofile();
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

    const dueDate = UxUtils.getDiv();
    UxUtils.setClass(dueDate, "subHeading");
    UxUtils.setText(dueDate, UxUtils.getString("dueBy", new Date(actionInstance.expiryTime).toDateString()));

    UxUtils.addElement(title, headerContainer);
    UxUtils.addElement(dueDate, headerContainer);
    return headerContainer;
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
    const sumamaryContainer = await getTopSummaryView();
    UxUtils.addElement(sumamaryContainer, aggregateSummaryPage);
    const questionContainer = createQuestionView();
    UxUtils.addElement(questionContainer, aggregateSummaryPage);
    return aggregateSummaryPage;
}
/*
*   @desc Fetch all the responders, non-responders for the actionInstance using Action SDK apis and store results in global variables. 
*   actionDataRows contains array of objects with all the responses
*/
async function getUserprofile() {
    let memberIds: string[] = [];
    if (actionDataRowsLength > 0) {
        for (let i = 0; i < actionDataRowsLength; i++) {
            memberIds.push(actionDataRows[i].creatorId);
            let requestResponders = new actionSDK.GetSubscriptionMembers.Request(actionContext.subscription, [actionDataRows[i].creatorId]);
            let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
            let perUserProfile = responseResponders.members;
            ResponderDate.push({ label: perUserProfile[0].displayName, value: new Date(actionDataRows[i].updateTime).toDateString(), value2: perUserProfile[0].id });
        }
    }

    myUserId = actionContext.userId;
    let requestNonResponders = new actionSDK.GetActionSubscriptionNonParticipants.Request(actionContext.actionId, actionContext.subscription.id);
    let responseNonResponders = await actionSDK.executeApi(requestNonResponders) as actionSDK.GetActionSubscriptionNonParticipants.Response;
    let tempresponse = responseNonResponders.nonParticipants;
    if (tempresponse != null) {
        for (let i = 0; i < tempresponse.length; i++) {
            actionNonResponders.push({ label: tempresponse[i].displayName, value2: tempresponse[i].id });
        }
    }
}
/*
*	 @desc Container to display the progress bar with people who and responded to total memeber of the group
*/
async function getTopSummaryView() {
    let participationPercentage = 0;
    const barDiv = UxUtils.getDiv();
    UxUtils.setClass(barDiv, "TopSummaryContainer")
    let getSubscriptionCount = new actionSDK.GetSubscriptionMemberCount.Request(actionContext.subscription);
    let response = await actionSDK.executeApi(getSubscriptionCount) as actionSDK.GetSubscriptionMemberCount.Response;
    let memberCount = response.memberCount;
    participationPercentage = Math.round((actionSummary.rowCreatorCount / memberCount) * 100);
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
    let summaryText = UxUtils.getElement("button");
    UxUtils.setClass(summaryText, "buttonAsString");
    if (actionSummary.rowCreatorCount == actionSummary.rowCount) {
        UxUtils.setText(summaryText, UxUtils.getString("XofYresponded", actionSummary.rowCreatorCount, memberCount));
    }
    else {
        UxUtils.setText(summaryText, UxUtils.getString("NResponseYPeople", actionSummary.rowCount, actionSummary.rowCreatorCount));
    }
    summaryText.addEventListener('click', () => {
        UxUtils.setTabs("tabs__button", "tabs__button--active", "tabs__content", "tabs__content--active", "data-for-tab", "data-tab");
        setPages("aggregateSummaryPage", "tabPage");
    });

    UxUtils.addElement(summaryText, buttonLink);

    UxUtils.addElement(percentageBar, barDiv);
    UxUtils.addElement(progressBar, barDiv);
    UxUtils.addElement(buttonLink, barDiv);
    return barDiv;
}
/*
*	@desc Gets aggregated and summarized view for all the question in the actionInstance. 
*   Here column is synonym of question. dataTables  - list of data-tables of the action., datacolumns  - list of question's data
*/
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
                    optionView = getAggregateOptionView(option.displayName, option.name, column);
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
*	 @desc Gets aggregated response for MCQ and their options
*    @param title: title of the option from column for MCQ: actionSDK.ActionDataColumnOption.displayName
*    @param id - id of option from column for MCQ : actionSDK.ActionDataColumnOption.name
*    @param column - per question from dataTables[i].dataColumns: actionSDK.ActionDataColumnValueType
*    @return progressbar for each option
*/
function getAggregateOptionView(title, optionId, column) {

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
        setPages("aggregateSummaryPage", "responseViewPage");
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
        setPages("aggregateSummaryPage", "responseViewPage");
    });
    UxUtils.addElement(responseText, responseRowSpan);
    UxUtils.addElement(responseRowSpan, textQuestion);
    return textQuestion;
}
/*
*	@desc Create a tab interface with two tabs, per responders and non-responders and append it to HTML body.
*   getResponderTabs() populates the tab1 with responder's details and getNonResponnderTabs() populates the tab2 with non-responder's details
*/
async function getResNonResTabs() {
    let tabPage = UxUtils.getDiv();
    UxUtils.setClass(tabPage, "tabPage");
    UxUtils.setId(tabPage, "tabPage");
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
    UxUtils.setClass(backButton, "buttonAsString textBold");
    UxUtils.addElement(backButton, tabPage);

    backButton.addEventListener('click', () => {
        setPages("tabPage", "aggregateSummaryPage");
    });
    UxUtils.addCSS(tabPage, { display: "none" });
    UxUtils.addElement(tabPage, root);
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
    for (let itr = 0; itr < ResponderDate.length; itr++) {
        let tableRow = UxUtils.getElement('TR');
        UxUtils.setId(tableRow, ResponderDate[itr].value2);
        UxUtils.setClass(tableRow, "textDisplay clickable");
        UxUtils.addElement(tableRow, tableBody);
        let profilePicColumn = UxUtils.getElement('TD');
        let profilePic = UxUtils.getElement("img");
        UxUtils.addAttribute(profilePic, { "class": "profilePic", "src": "images/dummyUser.png", "alt": "Avatar" });
        UxUtils.addElement(profilePic, profilePicColumn);
        UxUtils.addElement(profilePicColumn, tableRow);

        let nameColumn = UxUtils.getElement('TD');
        if (ResponderDate[itr].value2 == myUserId) {
            UxUtils.setText(nameColumn, UxUtils.getString("You"));
        }
        else {
            UxUtils.setText(nameColumn, ResponderDate[itr].label);
        }
        UxUtils.addElement(nameColumn, tableRow);
        let dateColumn = UxUtils.getElement('TD');
        UxUtils.setText(dateColumn, ResponderDate[itr].value);
        UxUtils.addElement(dateColumn, tableRow);
    }
    tableBody.onclick = function (event) {
        let target = (<HTMLElement>event.target);
        if (target.tagName == 'TD') {
            let index = (<HTMLTableRowElement>target.parentElement).rowIndex;
            let id = (<HTMLTableRowElement>target.parentElement).id;
            getResponsePerUser(id, index);
            setPages("tabPage", "responsePerUserViewPage");
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
    UxUtils.setClass(NonResponderDiv, "responseContainer");
    for (let itr = 0; itr < actionNonResponders.length; itr++) {
        let perNonResponder = UxUtils.getDiv();
        let userProfile = UxUtils.getElement("span");
        UxUtils.setClass(userProfile, "userProfile");
        let perRowuser = UxUtils.getElement("Text");
        UxUtils.setClass(perRowuser, "textDisplay");
        let profilePic = UxUtils.getElement('img');
        UxUtils.addAttribute(profilePic, { "class": "profilePic", "src": "images/dummyUser.png", "alt": "Avatar" });
        UxUtils.setClass(perNonResponder, "textDisplay");
        if (actionNonResponders[itr].value2 == myUserId) {
            UxUtils.setText(perRowuser, UxUtils.getString("You"));
        }
        else {
            UxUtils.setText(perRowuser, actionNonResponders[itr].label);
        }

        UxUtils.addElement(profilePic, userProfile);
        UxUtils.addElement(perRowuser, userProfile);
        UxUtils.addElement(userProfile, perNonResponder);
        UxUtils.addElement(perNonResponder, NonResponderDiv);
    }
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
    let questionTitle = UxUtils.getDiv();
    UxUtils.setClass(questionTitle, "TitleDiv");
    UxUtils.setText(questionTitle, column.displayName);
    UxUtils.addElement(questionTitle, rowDiv);
    if (pageId) {
        for (let itr = 0; itr < ResponderDate.length; itr++) {
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
                UxUtils.setText(perRowuser, ResponderDate[itr].label);
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
    UxUtils.setClass(backButton, "buttonAsString  textBold");
    backButton.addEventListener('click', () => {
        setPages("responseViewPage", "aggregateSummaryPage");
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
*	@param id - id of user received from subscriptionMmber: string (id of the user)
*   @param index - index of user response stored in dataRows which is same as the index of rows in table: number (row index)
*/
async function getResponsePerUser(id, index) {
    let rowDiv = UxUtils.getDiv();
    UxUtils.setClass(rowDiv, "responseRow");
    let pageId = document.getElementById("responsePerUserViewPage");
    UxUtils.clearElement(pageId);
    let responderName = UxUtils.getDiv();
    UxUtils.setClass(responderName, "TitleDiv");
    let requestResponders = new actionSDK.GetSubscriptionMembers.Request(actionContext.subscription, [id]);
    let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
    let userDetail = responseResponders.members;
    if (id == myUserId) {
        UxUtils.setText(responderName, UxUtils.getString("YourResponse"));
    }
    else {
        UxUtils.setText(responderName, userDetail[0].displayName);
    }
    UxUtils.addElement(responderName, rowDiv);
    if (pageId) {
        let dataPerUser = actionDataRows[index].columnValues;
        let questionItr = 0;
        for (let idx in dataPerUser) {
            let rowData = UxUtils.getDiv();
            UxUtils.setClass(rowData, "responseContainer");
            let ques = UxUtils.getDiv();
            UxUtils.setClass(ques, "textDisplay");
            UxUtils.setText(ques, UxUtils.getString("question", actionInstance.dataTables[0].dataColumns[questionItr].displayName));
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
    UxUtils.setClass(backButton, "buttonAsString textBold");
    backButton.addEventListener('click', () => {
        setPages("responsePerUserViewPage", "tabPage");
    });
    UxUtils.addElement(rowDiv, pageId);
    UxUtils.addElement(backButton, pageId);
}
/*
*   @desc Gets the context of actionInstance, which will be used to fetch the responders, their responses and non-responders. 
*   It makes an API call to service and gets the context as response which is saved in a global variable 
*/
function OnPageLoad() {
    actionSDK.executeApi(new actionSDK.GetContext.Request())
        .then(function (response: actionSDK.GetContext.Response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            actionContext = response.context;
            getDataRows(response.context.actionId);
        })
        .catch(function (error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}
/*
*	@desc It switched between display:none and display:block based on the page navigation.
*       e.g.- setPages("pageId1","pageId2")
*   @param divId1 - current displayed id and: elementId
*   @param divId2 - next div to be displayed: elementId
*/
function setPages(id1, id2) {
    let elementIdCurrent = document.getElementById(id1);
    let elementIdNext = document.getElementById(id2);
    if (elementIdCurrent && elementIdCurrent.style.display == 'block') {
        UxUtils.addCSS(elementIdCurrent, { display: "none" });
        UxUtils.addCSS(elementIdNext, { display: "block" });
    }
}
/*
*   @desc It uses actionId of actionInstance to fetch summary and dataRows.
*   Datarows are the array of objects of all the responses
*   It makes an API call to service and gets the context as response which is saved in a global variable 
*   actionDataRows: stores all the responses, the format of response will be array of actionDataRow objects which are the rows generated in each response 
*   actionSummary: It is summary of the data-rows like number of responders
*   actionInstance: It is the detail of actionInstance like creatorid, expirt time etc
*   @param actionId - (actionSDK.GetContext.Response).context.actionId
*/
function getDataRows(actionId) {
    let getActionRequest = new actionSDK.GetAction.Request(actionId);
    let getSummaryRequest = new actionSDK.GetActionDataRowsSummary.Request(actionId, true);
    let getDataRowsRequest = new actionSDK.GetActionDataRows.Request(actionId);
    let batchRequest = new actionSDK.BaseApi.BatchRequest([getActionRequest, getSummaryRequest, getDataRowsRequest]);
    actionSDK.executeBatchApi(batchRequest)
        .then(function (batchResponse: actionSDK.BaseApi.BatchResponse) {
            console.info("BatchResponse: " + JSON.stringify(batchResponse));
            actionInstance = (<actionSDK.GetAction.Response>batchResponse.responses[0]).action;
            actionSummary = (<actionSDK.GetActionDataRowsSummary.Response>batchResponse.responses[1]).summary;
            actionDataRows = (<actionSDK.GetActionDataRows.Response>batchResponse.responses[2]).dataRows;
            actionDataRowsLength = actionDataRows == null ? 0 : actionDataRows.length;
            createBody();
        })
        .catch(function (error) {
            console.log("Console log: Error: " + JSON.stringify(error));
        });
}