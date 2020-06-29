
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

function setPages(id1, id2) {
    let elementIdCurrent = document.getElementById(id1);
    let elementIdNext = document.getElementById(id2);
    if (elementIdCurrent && elementIdCurrent.style.display == 'block') {
        UxUtils.addCSS(elementIdCurrent, { display: "none" });
        UxUtils.addCSS(elementIdNext, { display: "block" });
    }
}
OnPageLoad();

async function createBody() {
    const headerContainer = UxUtils.getElement("div");
    UxUtils.setClass(headerContainer, "headerContainer");

    const title = UxUtils.getElement('div');
    UxUtils.setClass(title, "summaryTitle");
    title.innerHTML = actionInstance.displayName;

    const dueDate = UxUtils.getElement('div');
    UxUtils.setClass(dueDate, "subHeading");
    dueDate.innerHTML = "Due by " + new Date(actionInstance.expiryTime).toDateString();

    UxUtils.addElement(title, headerContainer);
    UxUtils.addElement(dueDate, headerContainer);
    UxUtils.addElement(headerContainer, root);
    await getUserprofile();
    UxUtils.addElement(await mainPage(), root);
    getResNonResTabs();
    getResponderListPagePerQuestion();
    getPageResponsePerUser();

}

async function mainPage() {
    const aggregateSummaryPage = UxUtils.getElement("div", { display: "block" });
    UxUtils.setClass(aggregateSummaryPage, "aggregateSummaryPage");
    UxUtils.setId(aggregateSummaryPage, "aggregateSummaryPage");
    const sumamaryContainer = await getTopSummaryView();
    UxUtils.addElement(sumamaryContainer, aggregateSummaryPage);
    const questionContainer = createQuestionView();
    UxUtils.addElement(questionContainer, aggregateSummaryPage);
    return aggregateSummaryPage;
}

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

async function getTopSummaryView() {
    let participationPercentage = 0;
    const barDiv = UxUtils.getElement("div");
    UxUtils.setClass(barDiv, "TopSummaryContainer")
    let getSubscriptionCount = new actionSDK.GetSubscriptionMemberCount.Request(actionContext.subscription);
    let response = await actionSDK.executeApi(getSubscriptionCount) as actionSDK.GetSubscriptionMemberCount.Response;
    let memberCount = response.memberCount;
    participationPercentage = Math.round((actionSummary.rowCreatorCount / memberCount) * 100);
    let percentageBar = UxUtils.getElement("div");
    let headingpercentage = UxUtils.getElement("text");
    UxUtils.setClass(headingpercentage, "headings")
    headingpercentage.innerText = "Participation " + participationPercentage + " %";
    UxUtils.addElement(headingpercentage, percentageBar);
    let progressBar = UxUtils.getElement("div");
    let myProgress = UxUtils.getElement("progress", { width: "100%" });
    myProgress.setAttribute("value", participationPercentage.toString());
    myProgress.setAttribute("max", "100");
    UxUtils.addElement(myProgress, progressBar);

    let buttonLink = UxUtils.getElement("div");
    let summaryText = UxUtils.getElement("button");
    UxUtils.setClass(summaryText, "buttonAsString");
    if (actionSummary.rowCreatorCount == actionSummary.rowCount) {
        summaryText.textContent = actionSummary.rowCreatorCount + " of " + memberCount + " have responded";
    }
    else {
        summaryText.textContent = actionSummary.rowCount + " responses by " + actionSummary.rowCreatorCount + " people";
    }
    summaryText.addEventListener('click', () => {
        setTabs();
        setPages("aggregateSummaryPage", "tabPage");
    });

    UxUtils.addElement(summaryText, buttonLink);

    UxUtils.addElement(percentageBar, barDiv);
    UxUtils.addElement(progressBar, barDiv);
    UxUtils.addElement(buttonLink, barDiv);
    return barDiv;
}

function createQuestionView() {
    const totalQuestion = UxUtils.getElement("div");
    actionInstance.dataTables[0].dataColumns.forEach((column) => {

        const questionDiv = UxUtils.getElement("div");
        UxUtils.setClass(questionDiv, "questionContainer");
        const questionHeading = UxUtils.getElement('h4');

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

    let optionDiv = UxUtils.getElement("div");
    let responseRowSpan = UxUtils.getElement("div");

    let percentage = (actionSummary.defaultAggregates).hasOwnProperty(column.name) ? JSON.parse(actionSummary.defaultAggregates[column.name])[optionId] : 0;
    let wid = percentage / actionSummary.rowCount * 100;
    let optionpercentage = isNaN(wid) ? "0%" : wid.toFixed(2) + "%";
    let optionCount = isNaN(percentage) ? 0 : percentage;
    UxUtils.setClass(responseRowSpan, "row");

    let optionDetails = UxUtils.getElement("div");
    UxUtils.setClass(optionDetails, "row");
    let optionTitle = UxUtils.getElement('text', { float: "left" });
    UxUtils.setClass(optionTitle, "textDisplay column");
    optionTitle.innerHTML = title;
    UxUtils.addElement(optionTitle, optionDetails);

    let optionParticipation = UxUtils.getElement('text', { float: "right" });
    UxUtils.setClass(optionParticipation, "textDisplay column");
    optionParticipation.innerHTML = optionCount + " (" + optionpercentage + ")";
    UxUtils.addElement(optionParticipation, optionDetails);

    UxUtils.addElement(optionDetails, responseRowSpan);

    let meterDiv = UxUtils.getElement("div");
    UxUtils.setClass(meterDiv, "meter");
    let spanTag1 = UxUtils.getElement('span');


    spanTag1.style.width = optionpercentage;
    UxUtils.addElement(spanTag1, meterDiv);
    UxUtils.addElement(meterDiv, responseRowSpan);
    UxUtils.addElement(responseRowSpan, optionDiv);

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

    let responseRowSpan = UxUtils.getElement("div");
    UxUtils.setClass(responseRowSpan, "row");
    let sumText = UxUtils.getElement("text", { textAlign: "center" });
    UxUtils.setClass(sumText, "textDisplay column");
    sumText.innerText = "Sum : " + sum;
    let averageText = UxUtils.getElement("text", { textAlign: "center" });
    UxUtils.setClass(averageText, "textDisplay column");
    averageText.innerText = "Average : " + average.toFixed(2);
    let responseText = UxUtils.getElement("button", { textAlign: "center" });
    responseText.innerText = responsesCount + " Response";
    UxUtils.setClass(responseText, "buttonAsString column");
    responseText.addEventListener('click', () => {
        getResponsesperQuestion(column);
        setPages("aggregateSummaryPage", "responseViewPage");
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
    let responseRowSpan = UxUtils.getElement("div");
    UxUtils.setClass(responseRowSpan, "row");
    let responseText = UxUtils.getElement("button", { textAlign: "center" });
    responseText.innerText = responseCount + " Response";
    UxUtils.setClass(responseText, "buttonAsString column");
    responseText.addEventListener('click', () => {
        getResponsesperQuestion(column);
        setPages("aggregateSummaryPage", "responseViewPage");
    });
    UxUtils.addElement(responseText, responseRowSpan);
    UxUtils.addElement(responseRowSpan, optionDiv);
    return optionDiv;
}

async function getResNonResTabs() {
    let tabPage = UxUtils.getElement("div");
    UxUtils.setClass(tabPage, "tabPage");
    UxUtils.setId(tabPage, "tabPage");
    let tabDiv = UxUtils.getElement("div");
    UxUtils.setClass(tabDiv, "tabs");

    let tabBarDiv = UxUtils.getElement("div");
    UxUtils.setClass(tabBarDiv, "tabs__horizontal");

    let responderButton = UxUtils.getElement("button");
    UxUtils.setClass(responderButton, "tabs__button tabs__button--active");
    responderButton.innerText = "Responders";
    responderButton.setAttribute("data-for-tab", "1");

    let nonResponderButton = UxUtils.getElement("button");
    UxUtils.setClass(nonResponderButton, "tabs__button");
    nonResponderButton.innerText = "NonResponders";
    nonResponderButton.setAttribute("data-for-tab", "2");

    UxUtils.addElement(responderButton, tabDiv);
    UxUtils.addElement(nonResponderButton, tabDiv);

    UxUtils.addElement(tabDiv, tabPage);

    UxUtils.addElement(getResponderTabs(), tabBarDiv);
    UxUtils.addElement(getNonRespondersTabs(), tabBarDiv);
    UxUtils.addElement(tabBarDiv, tabPage);

    let backButton = UxUtils.getElement("button");
    backButton.innerText = "Back";
    UxUtils.setClass(backButton, "buttonAsString");
    UxUtils.addElement(backButton, tabPage);

    backButton.addEventListener('click', () => {
        setPages("tabPage", "aggregateSummaryPage");
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
    let responderContent = UxUtils.getElement("div");
    UxUtils.setClass(responderContent, "tabs__content tabs__content--active");
    responderContent.setAttribute("data-tab", "1");
    let ResponderDiv = UxUtils.getElement("div");
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
        UxUtils.setClass(profilePic, "profilePic");
        profilePic.setAttribute('src', 'images/dummyUser.png');
        UxUtils.addElement(profilePic, profilePicColumn);
        UxUtils.addElement(profilePicColumn, tableRow);

        let nameColumn = UxUtils.getElement('TD');
        if (ResponderDate[itr].value2 == myUserId) {
            nameColumn.innerText = "You";
        }
        else {
            nameColumn.innerText = ResponderDate[itr].label;
        }
        UxUtils.addElement(nameColumn, tableRow);
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
            setPages("tabPage", "responsePerUserViewPage");
        }
    };
    UxUtils.addElement(table, ResponderDiv);
    UxUtils.addElement(ResponderDiv, responderContent);
    return responderContent;
}

function getNonRespondersTabs() {
    let nonResponderContent = UxUtils.getElement("div");
    UxUtils.setClass(nonResponderContent, "tabs__content");
    nonResponderContent.setAttribute("data-tab", "2");
    let NonResponderDiv = UxUtils.getElement("div");
    UxUtils.setClass(NonResponderDiv, "responseContainer");
    for (let itr = 0; itr < actionNonResponders.length; itr++) {
        let perNonResponder = UxUtils.getElement("div");
        UxUtils.setClass(perNonResponder, "textDisplay");
        if (actionNonResponders[itr].value2 == myUserId) {
            perNonResponder.innerText = "You";
        }
        else {
            perNonResponder.innerText = actionNonResponders[itr].label;
        }

        UxUtils.addElement(perNonResponder, NonResponderDiv);
    }
    UxUtils.addElement(NonResponderDiv, nonResponderContent);
    return nonResponderContent;
}

function getResponderListPagePerQuestion() {
    let responseView = UxUtils.getElement("div");
    UxUtils.setClass(responseView, "responseViewPage");
    UxUtils.setId(responseView, "responseViewPage");
    UxUtils.addCSS(responseView, { display: "none" });
    UxUtils.addElement(responseView, root);
}

function getResponsesperQuestion(column) {
    let rowDiv = UxUtils.getElement("div");
    UxUtils.setClass(rowDiv, "responseRow");
    let pageId = document.getElementById("responseViewPage");
    UxUtils.clearElement(pageId);
    let questionTitle = UxUtils.getElement("div");
    UxUtils.setClass(questionTitle, "TitleDiv");
    questionTitle.innerText = column.displayName;
    UxUtils.addElement(questionTitle, rowDiv);
    if (pageId) {
        for (let itr = 0; itr < ResponderDate.length; itr++) {
            let rowData = UxUtils.getElement("div");
            UxUtils.setClass(rowData, "responseContainer");
            let userProfile = UxUtils.getElement("span");
            UxUtils.setClass(userProfile, "userProfile");
            let perRowuser = UxUtils.getElement("Text");
            UxUtils.setClass(perRowuser, "textDisplay");
            let profilePic = document.createElement('img');
            UxUtils.setClass(profilePic, "profilePic");
            profilePic.setAttribute('src', 'images/dummyUser.png');
            if (myUserId == actionDataRows[itr].creatorId) {
                perRowuser.innerText = "You";
            }
            else {
                perRowuser.innerText = ResponderDate[itr].label;
            }
            UxUtils.addElement(profilePic, userProfile);
            UxUtils.addElement(perRowuser, userProfile);
            UxUtils.addElement(userProfile, rowData);
            let perRowResponse = UxUtils.getElement("div");
            UxUtils.setClass(perRowResponse, "responsePerQuestion");
            perRowResponse.innerText = actionDataRows[itr].columnValues[column.name];
            UxUtils.addElement(perRowResponse, rowData);
            UxUtils.addElement(rowData, rowDiv);
            UxUtils.addElement(UxUtils.lineBreak(), rowDiv);
        }
    }
    let backButton = UxUtils.getElement("button");
    backButton.innerText = "Back";
    UxUtils.setClass(backButton, "buttonAsString");
    backButton.addEventListener('click', () => {
        setPages("responseViewPage", "aggregateSummaryPage");
    });
    UxUtils.addElement(rowDiv, pageId);
    UxUtils.addElement(backButton, pageId);
}

function getPageResponsePerUser() {
    let ResponsePerUserView = UxUtils.getElement("div");
    UxUtils.setClass(ResponsePerUserView, "ResponsePerUserViewPage");
    UxUtils.setId(ResponsePerUserView, "responsePerUserViewPage");
    UxUtils.addCSS(ResponsePerUserView, { display: "none" });
    UxUtils.addElement(ResponsePerUserView, root);
}

async function getResponsePerUser(id, index) {
    let rowDiv = UxUtils.getElement("div");
    UxUtils.setClass(rowDiv, "responseRow");
    let pageId = document.getElementById("responsePerUserViewPage");
    UxUtils.clearElement(pageId);
    let responderName = UxUtils.getElement("div");
    UxUtils.setClass(responderName, "TitleDiv");
    let requestResponders = new actionSDK.GetSubscriptionMembers.Request(actionContext.subscription, [id]);
    let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
    let userDetail = responseResponders.members;
    if (id == myUserId) {
        responderName.innerText = "Your Response"
    }
    else {
        responderName.innerText = userDetail[0].displayName;
    }
    UxUtils.addElement(responderName, rowDiv);
    if (pageId) {
        let dataPerUser = actionDataRows[index].columnValues;
        let questionItr = 0;
        for (let idx in dataPerUser) {
            let rowData = UxUtils.getElement("div");
            UxUtils.setClass(rowData, "responseContainer");
            let ques = UxUtils.getElement("div");
            UxUtils.setClass(ques, "textDisplay");
            ques.innerText = "Question: " + actionInstance.dataTables[0].dataColumns[questionItr].displayName
            let ans = UxUtils.getElement("div");
            UxUtils.setClass(ans, "responsePerQuestion");
            if (actionInstance.dataTables[0].dataColumns[questionItr].valueType.localeCompare("SingleOption") == 0 || actionInstance.dataTables[0].dataColumns[questionItr].valueType.localeCompare("MultiOption") == 0) {
                let optionques = actionInstance.dataTables[0].dataColumns[questionItr].options
                for (let opt = 0; opt < optionques.length; opt++) {
                    if ((optionques[opt].name).localeCompare(actionDataRows[index].columnValues[idx]) == 0) {
                        ans.innerText = optionques[opt].displayName;
                        break;
                    }
                }
            }
            else {
                ans.innerText = actionDataRows[index].columnValues[idx];
            }
            UxUtils.addElement(ques, rowData);
            UxUtils.addElement(ans, rowData);
            questionItr++;
            UxUtils.addElement(rowData, rowDiv);
            UxUtils.addElement(UxUtils.lineBreak(), rowDiv);
        }
    }
    let backButton = UxUtils.getElement("button");
    backButton.innerText = "Back";
    UxUtils.setClass(backButton, "buttonAsString");
    backButton.addEventListener('click', () => {
        setPages("responsePerUserViewPage", "tabPage");
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