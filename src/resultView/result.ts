
import * as actionSDK from 'action-sdk-sunny';
import { Utils } from "../common/Utils";
import { UxUtils } from "../common/UxUtils";

var root = document.getElementById("root");
let actionInstance = null;
let actionSummary = null;
let actionContext = null;
let actionDataRows = null;
let actionUserProfiles = null;
let actionDataRowsLength = 0;
let ResponderDate = [];
let actionNonResponders = [];

function setPages(id1, id2) {
    var elementIdCurrent = document.getElementById(id1);
    var elementIdNext = document.getElementById(id2);
    if (elementIdCurrent && elementIdCurrent.style.display == 'block') {
        UxUtils.addCSS(elementIdCurrent, { display: "none" });
        UxUtils.addCSS(elementIdNext, { display: "block" });
    }
}
OnPageLoad();

async function createBody() {
    var title = UxUtils.getElement('h3');
    title.innerHTML = actionInstance.displayName;
    UxUtils.addElement(title, root);
    await getUserprofile();
    UxUtils.addElement(await mainPage(), root);
    getResNonResTabs();
    getResponderListPagePerQuestion();
    getPageResponsePerUser();

}

async function mainPage() {
    var firstPage = UxUtils.getElement("div", { display: "block" });
    UxUtils.setClass(firstPage, "MainPage");
    UxUtils.setId(firstPage, "1");
    var sumamaryContainer = await getTopSummaryView();
    UxUtils.addElement(sumamaryContainer, firstPage);
    var questionContainer = createQuestionView();
    UxUtils.addElement(questionContainer, firstPage);
    return firstPage;
}

async function getUserprofile() {
    let memberIds: string[] = [];
    if (actionDataRowsLength > 0) {
        for (var i = 0; i < actionDataRowsLength; i++) {
            memberIds.push(actionDataRows[i].creatorId);
            let requestResponders = new actionSDK.GetSubscriptionMembers.Request(actionContext.subscription, [actionDataRows[i].creatorId]);
            let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
            var perUserProfile = responseResponders.members;
            ResponderDate.push({ label: perUserProfile[0].displayName, value: new Date(actionDataRows[i].updateTime).toDateString(), value2: perUserProfile[0].id });
        }
        let requestResponders = new actionSDK.GetSubscriptionMembers.Request(actionContext.subscription, memberIds);
        let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
        actionUserProfiles = responseResponders.members;
    }
    let requestNonResponders = new actionSDK.GetActionSubscriptionNonParticipants.Request(actionContext.actionId, actionContext.subscription.id);
    let responseNonResponders = await actionSDK.executeApi(requestNonResponders) as actionSDK.GetActionSubscriptionNonParticipants.Response;
    var tempresponse = responseNonResponders.nonParticipants;
    if (tempresponse != null) {
        for (var i = 0; i < tempresponse.length; i++) {
            actionNonResponders.push({ label: tempresponse[i].displayName, value: tempresponse[i].id });
        }
    }
}

async function getTopSummaryView() {
    let participationPercentage = 0;
    let barDiv = UxUtils.getElement("div");
    let getSubscriptionCount = new actionSDK.GetSubscriptionMemberCount.Request(actionContext.subscription);
    let response = await actionSDK.executeApi(getSubscriptionCount) as actionSDK.GetSubscriptionMemberCount.Response;
    let memberCount = response.memberCount;
    participationPercentage = Math.round((actionSummary.rowCreatorCount / memberCount) * 100);
    let percentageBar = UxUtils.getElement("div");
    let headingpercentage = UxUtils.getElement("text", { fontWeight: "bold" });
    headingpercentage.innerText = "Participation " + participationPercentage + " %";
    UxUtils.addElement(headingpercentage, percentageBar);
    let progressBar = UxUtils.getElement("div");
    let myProgress = UxUtils.getElement("progress", { width: "100%" });
    myProgress.setAttribute("value", participationPercentage.toString());
    myProgress.setAttribute("max", "100");
    UxUtils.addElement(myProgress, progressBar);

    let buttonLink = UxUtils.getElement("span");
    let leftspan = UxUtils.getElement("span", { float: "left" });
    let summaryText = UxUtils.getElement("button");
    UxUtils.setClass(summaryText, "button_as_string");
    summaryText.textContent = actionSummary.rowCreatorCount + " of " + memberCount + " have responded";
    summaryText.addEventListener('click', function () {
        setTabs();
        setPages("1", "2");
    });

    UxUtils.addElement(summaryText, leftspan);
    UxUtils.addElement(leftspan, buttonLink);

    UxUtils.addElement(percentageBar, barDiv);
    UxUtils.addElement(progressBar, barDiv);
    UxUtils.addElement(buttonLink, barDiv);
    return barDiv;
}

function createQuestionView() {
    var totalQuestion = UxUtils.getElement("div");
    actionInstance.dataTables[0].dataColumns.forEach((column) => {

        var questionDiv = UxUtils.getElement("div");
        var questionHeading = UxUtils.getElement('h4');

        UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
        questionHeading.innerHTML = column.displayName;
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

function getAggregateOptionView(title, optionId, column) {

    var optionDiv = UxUtils.getElement("div");
    var optionTitle = UxUtils.getElement('text');
    UxUtils.setClass(optionTitle, "textDisplay");

    optionTitle.innerHTML = title;
    UxUtils.addElement(optionTitle, optionDiv);

    var meterDiv = UxUtils.getElement("div");
    UxUtils.setClass(meterDiv, "meter clickable");
    var spanTag1 = UxUtils.getElement('span');

    let percentage = (actionSummary.defaultAggregates).hasOwnProperty(column.name) ? JSON.parse(actionSummary.defaultAggregates[column.name])[optionId] : 0;
    let wid = percentage / actionSummary.rowCount * 100;
    spanTag1.style.width = isNaN(wid) ? "0%" : wid + "%";

    UxUtils.addElement(spanTag1, meterDiv);
    UxUtils.addElement(meterDiv, optionDiv);
    optionDiv.addEventListener('click', function () {
        getResponsesperQuestion(column, true, optionId);
        setPages("1", "3");
    });
    return optionDiv;
}

function getAggregateNumericView(column) {
    let optionDiv = UxUtils.getElement("div");
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

    let responseRowSpan = UxUtils.getElement("span");
    let sumText = UxUtils.getElement("text", { position: "absolute", textAlign: "center", width: "50%" });
    UxUtils.setClass(sumText, "textDisplay");
    sumText.innerText = sum + "  Sum";
    let averageText = UxUtils.getElement("text", { float: "right" });
    UxUtils.setClass(averageText, "textDisplay");
    averageText.innerText = average + " average";
    let responseText = UxUtils.getElement("button", { float: "left" });
    responseText.innerText = responsesCount + " Response";
    UxUtils.setClass(responseText, "button_as_string");
    responseText.addEventListener('click', function () {
        getResponsesperQuestion(column, false);
        setPages("1", "3");
    });
    UxUtils.addElement(responseText, responseRowSpan);
    UxUtils.addElement(sumText, responseRowSpan);
    UxUtils.addElement(averageText, responseRowSpan);
    UxUtils.addElement(responseRowSpan, optionDiv);
    UxUtils.addElement(UxUtils.lineBreak(), optionDiv);
    return optionDiv;
}

function getAggregateTextView(column) {
    let optionDiv = UxUtils.getElement("div");
    let questionSummary = (actionSummary.defaultAggregates).hasOwnProperty(column.name) ? JSON.parse(actionSummary.defaultAggregates[column.name]) : [];
    let responseCount = 0;
    for (let i = 0; i < questionSummary.length; i++) {
        if (!Utils.isEmptyString(questionSummary[i])) {
            responseCount++;
        }
    }
    let responseText = UxUtils.getElement("button");
    responseText.innerText = responseCount + " Response";
    UxUtils.setClass(responseText, "button_as_string");
    responseText.addEventListener('click', function () {
        getResponsesperQuestion(column, false);
        setPages("1", "3");
    });
    UxUtils.addElement(responseText, optionDiv);
    return optionDiv;
}

async function getResNonResTabs() {
    var tabPage = UxUtils.getElement("div");
    UxUtils.setClass(tabPage, "Page");
    UxUtils.setId(tabPage, "2");
    var tabDiv = UxUtils.getElement("div");
    UxUtils.setClass(tabDiv, "tabs");

    var tabBarDiv = UxUtils.getElement("div");
    UxUtils.setClass(tabBarDiv, "tabs__horizontal");

    var responderButton = UxUtils.getElement("button");
    UxUtils.setClass(responderButton, "tabs__button tabs__button--active");
    responderButton.innerText = "Responders";
    responderButton.setAttribute("data-for-tab", "1");

    var nonResponderButton = UxUtils.getElement("button");
    UxUtils.setClass(nonResponderButton, "tabs__button");
    nonResponderButton.innerText = "NonResponders";
    nonResponderButton.setAttribute("data-for-tab", "2");

    UxUtils.addElement(responderButton, tabDiv);
    UxUtils.addElement(nonResponderButton, tabDiv);

    UxUtils.addElement(tabDiv, tabPage);

    UxUtils.addElement(getResponderTabs(), tabBarDiv);
    UxUtils.addElement(getNonRespondersTabs(), tabBarDiv);
    UxUtils.addElement(tabBarDiv, tabPage);

    var backButton = UxUtils.getElement("button");
    backButton.innerText = "Back";
    UxUtils.setClass(backButton, "button_as_string");
    UxUtils.addElement(backButton, tabPage);

    backButton.addEventListener('click', function () {
        setPages("2", "1");
    });
    UxUtils.addCSS(tabPage, { display: "none" });

    UxUtils.addElement(tabPage, root);
}

function setTabs() {
    document.querySelectorAll(".tabs__button").forEach(button => {
        button.addEventListener("click", () => {
            const barParent = button.parentElement;
            const contentContainer = barParent.parentElement;
            const tabNum = button.getAttribute("data-for-tab");
            const tabActive = contentContainer.querySelector(`.tabs__content[data-tab="${tabNum}"]`);
            barParent.querySelectorAll(".tabs__button").forEach(button => {
                button.classList.remove("tabs__button--active");
            });
            contentContainer.querySelectorAll(".tabs__content").forEach(tab => {
                tab.classList.remove("tabs__content--active");
            });

            button.classList.add("tabs__button--active");
            tabActive.classList.add("tabs__content--active");
        });
    });
}

function getResponderTabs() {
    var responderContent = UxUtils.getElement("div");
    UxUtils.setClass(responderContent, "tabs__content tabs__content--active");
    responderContent.setAttribute("data-tab", "1");
    var ResponderDiv = UxUtils.getElement("div");
    let table = UxUtils.getElement('TABLE');
    let tableBody = UxUtils.getElement('TBODY');
    UxUtils.addElement(tableBody, table);
    for (var itr = 0; itr < ResponderDate.length; itr++) {
        let tableRow = UxUtils.getElement('TR');
        UxUtils.setId(tableRow, ResponderDate[itr].value2);
        UxUtils.setClass(tableRow, "textDisplay clickable");
        UxUtils.addElement(tableRow, tableBody);
        let nameColumn = UxUtils.getElement('TD');
        nameColumn.innerText = ResponderDate[itr].label;
        UxUtils.addElement(nameColumn, tableRow);
        let columnMid = UxUtils.getElement('TD', { width: "20%" });
        columnMid.appendChild(document.createTextNode(""));
        UxUtils.addElement(columnMid, tableRow);
        let dateColumn = UxUtils.getElement('TD');
        dateColumn.innerText = ResponderDate[itr].value;
        UxUtils.addElement(dateColumn, tableRow);
    }
    tableBody.onclick = function (event) {
        let target = (<HTMLElement>event.target);
        if (target.tagName == 'TD') {
            let index = (<HTMLTableRowElement>target.parentElement).rowIndex;
            let id = (<HTMLTableRowElement>target.parentElement).id;
            getResponsePerUser(id, index);
            setPages("2", "4");
        }
    };
    UxUtils.addElement(table, ResponderDiv);
    UxUtils.addElement(ResponderDiv, responderContent);
    return responderContent;
}

function getNonRespondersTabs() {
    var nonResponderContent = UxUtils.getElement("div");
    UxUtils.setClass(nonResponderContent, "tabs__content");
    nonResponderContent.setAttribute("data-tab", "2");
    var NonResponderDiv = UxUtils.getElement("div");
    for (var itr = 0; itr < actionNonResponders.length; itr++) {
        var perResponder = UxUtils.getElement("div");
        UxUtils.setClass(perResponder, "textDisplay");
        perResponder.innerText = actionNonResponders[itr].label;
        UxUtils.addElement(perResponder, NonResponderDiv);
    }
    UxUtils.addElement(NonResponderDiv, nonResponderContent);
    return nonResponderContent;
}

function getResponderListPagePerQuestion() {
    var responseView = UxUtils.getElement("div");
    UxUtils.setClass(responseView, "ResponseViewPage");
    UxUtils.setId(responseView, "3");
    UxUtils.addCSS(responseView, { display: "none" });
    UxUtils.addElement(responseView, root);
}

function getResponsesperQuestion(column, options, optionId = "") {
    var rowDiv = UxUtils.getElement("div");
    UxUtils.setClass(rowDiv, "responseRow");
    var pageId = document.getElementById("3");
    UxUtils.clearElement(pageId);
    let questionTitle = UxUtils.getElement("div");
    UxUtils.setClass(questionTitle, "TitleDiv");
    questionTitle.innerText = column.displayName;
    UxUtils.addElement(questionTitle, rowDiv);
    if (pageId) {
        for (var itr = 0; itr < ResponderDate.length; itr++) {
            var rowData = UxUtils.getElement("div");
            var perRowuser = UxUtils.getElement("div");
            UxUtils.setClass(perRowuser, "textDisplay");
            if (options) {
                if (optionId.localeCompare(actionDataRows[itr].columnValues[column.name]) == 0) {
                    perRowuser.innerText = " - " + ResponderDate[itr].label;
                    UxUtils.addElement(perRowuser, rowData);
                }
            }
            else {
                perRowuser.innerText = " - " + ResponderDate[itr].label;
                var perRowResponse = UxUtils.getElement("div");
                UxUtils.setClass(perRowResponse, "responseperquestion");
                perRowResponse.innerText = "Response: " + actionDataRows[itr].columnValues[column.name];
                UxUtils.addElement(perRowuser, rowData);
                UxUtils.addElement(perRowResponse, rowData);
            }
            UxUtils.addElement(rowData, rowDiv);
            UxUtils.addElement(UxUtils.lineBreak(), rowDiv);
        }
    }
    var backButton = UxUtils.getElement("button");
    backButton.innerText = "Back";
    UxUtils.setClass(backButton, "button_as_string");
    backButton.addEventListener('click', function () {
        setPages("3", "1");
    });
    UxUtils.addElement(rowDiv, pageId);
    UxUtils.addElement(backButton, pageId);
}

function getPageResponsePerUser() {
    var ResponsePerUserView = UxUtils.getElement("div");
    UxUtils.setClass(ResponsePerUserView, "ResponsePerUserViewPage");
    UxUtils.setId(ResponsePerUserView, "4");
    UxUtils.addCSS(ResponsePerUserView, { display: "none" });
    UxUtils.addElement(ResponsePerUserView, root);
}

function getResponsePerUser(id, index) {
    var rowDiv = UxUtils.getElement("div");
    UxUtils.setClass(rowDiv, "responseRow");
    var pageId = document.getElementById("4");
    UxUtils.clearElement(pageId);
    if (pageId) {
        var dataPerUser = actionDataRows[index].columnValues;
        let questionItr = 0;
        for (var idx in dataPerUser) {
            var rowData = UxUtils.getElement("div");
            var ques = UxUtils.getElement("div");
            UxUtils.setClass(ques, "textDisplay");
            ques.innerText = "Question: " + actionInstance.dataTables[0].dataColumns[questionItr].displayName
            var ans = UxUtils.getElement("div");
            UxUtils.setClass(ans, "responseperquestion");
            if (actionInstance.dataTables[0].dataColumns[questionItr].valueType.localeCompare("SingleOption") == 0 || actionInstance.dataTables[0].dataColumns[questionItr].valueType.localeCompare("MultiOption") == 0) {
                var optionques = actionInstance.dataTables[0].dataColumns[questionItr].options
                for (var opt = 0; opt < optionques.length; opt++) {
                    if ((optionques[opt].name).localeCompare(actionDataRows[index].columnValues[idx]) == 0) {
                        ans.innerText = "Response: " + optionques[opt].displayName;
                        break;
                    }
                }
            }
            else {
                ans.innerText = "Response: " + actionDataRows[index].columnValues[idx];
            }
            UxUtils.addElement(ques, rowData);
            UxUtils.addElement(ans, rowData);
            questionItr++;
            UxUtils.addElement(rowData, rowDiv);
            UxUtils.addElement(UxUtils.lineBreak(), rowDiv);
        }
    }
    var backButton = UxUtils.getElement("button");
    backButton.innerText = "Back";
    UxUtils.setClass(backButton, "button_as_string");
    backButton.addEventListener('click', function () {
        setPages("4", "2");
    });
    UxUtils.addElement(rowDiv, pageId);
    UxUtils.addElement(backButton, pageId);
}

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

function getDataRows(actionId) {
    var getActionRequest = new actionSDK.GetAction.Request(actionId);
    var getSummaryRequest = new actionSDK.GetActionDataRowsSummary.Request(actionId, true);
    var getDataRowsRequest = new actionSDK.GetActionDataRows.Request(actionId);
    // var closeViewRequest = new actionSDK.CloseView.Request();
    var batchRequest = new actionSDK.BaseApi.BatchRequest([getActionRequest, getSummaryRequest, getDataRowsRequest]);
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