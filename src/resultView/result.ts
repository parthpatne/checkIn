
import * as actionSDK from 'action-sdk-sunny';

var root = document.getElementById("root");
let actionInstance = null;
let actionSummary = null;
let actionContext = null;
let actionDataItems = null;
let actionUserProfiles = null;
let actionDataItemsLength = 0;
let actionNonResponderslength = 0;
let ResponderDate = [];
let actionNonResponders = [];
let linebreak = document.createElement("br");
let isEmptyOrNull = (value: string) => {
    if (!value || value.trim().length === 0)
        return true;
    return false;
};

function setPages(id1, id2) {
    var e1 = document.getElementById(id1);
    var e2 = document.getElementById(id2);
    console.log("e1.style.display: " + e1.style.display);
    console.log("e2.style.display: " + e2);
    if (e1 && e1.style.display == 'block') {
        e1.style.display = 'none';
        e2.style.display = 'block';
    }
}
OnPageLoad();

async function createBody() {
    var title = document.createElement('h3');
    title.innerHTML = actionInstance.title;
    root.appendChild(title);
    await getUserprofile();
    root.appendChild(await mainPage());
    getResNonResTabs();
    getResponderListPagePerQuestion();
    getPageResponsePerUser();

}

async function mainPage() {
    console.log("Console log: Main Page");
    var fullPage = document.createElement("div");
    fullPage.className = "MainPage";
    fullPage.id = "1";
    fullPage.style.display = "block";
    var sumamaryContainer = await getTopSummaryView();
    fullPage.appendChild(sumamaryContainer);
    var questionContainer = createQuestionView();
    fullPage.appendChild(questionContainer);
    console.log("Console log: covered the main page");
    return fullPage;
}

async function getUserprofile() {
    console.log("Console log: getUserrProfile");
    let memberIds: string[] = [];
    if (actionDataItemsLength > 0) {
        for (var i = 0; i < actionDataItemsLength; i++) {
            console.log("Console log: actionDataItems[i].creatorId: " + actionDataItems[i].creatorId);
            console.log("Console log: actionDataItem[i]: " + actionDataItems[i]);
            memberIds.push(actionDataItems[i].creatorId);
            let requestResponders = new actionSDK.GetSubscriptionMembers.Request(actionContext.subscription, [actionDataItems[i].creatorId]);
            let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
            var perUserProfile = responseResponders.members;
            console.log("Console log: actionDataItems[i]: " + actionDataItems[i].dataItems);
            ResponderDate.push({ label: perUserProfile[0].displayName, value: new Date(actionDataItems[i].updateTime).toDateString(), value2: perUserProfile[0].id });
        }
        let requestResponders = new actionSDK.GetSubscriptionMembers.Request(actionContext.subscription, memberIds);
        let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
        console.log("Console log: responseResponders.members.length " + responseResponders.members.length);
        actionUserProfiles = responseResponders.members;
        console.log("Console log: actionUserProfiles[0]: " + actionUserProfiles[0]);
        console.log("Console log: actionUserProfiles.length: " + actionUserProfiles.length);
    }
    let requestNonResponders = new actionSDK.GetActionSubscriptionNonParticipants.Request(actionContext.actionId, actionContext.subscription.id);
    let responseNonResponders = await actionSDK.executeApi(requestNonResponders) as actionSDK.GetActionSubscriptionNonParticipants.Response;
    var tempresponse = responseNonResponders.nonParticipants;
    if (tempresponse != null) {
        for (var i = 0; i < tempresponse.length; i++) {
            console.log("Hey Here");
            actionNonResponders.push({ label: tempresponse[i].displayName, value: tempresponse[i].id });
        }
    }
    actionNonResponderslength = actionNonResponders.length;
    console.log("Console log: actionNonResponders: " + actionNonResponders);
    console.log("Console log: actionNonResponderslength: " + actionNonResponderslength);
}

async function getTopSummaryView() {
    console.log("Console log: getTopSummaryView()");
    let participationPercentage = 0;
    let barDiv = document.createElement("div");
    let getSubscriptionCount = new actionSDK.GetSubscriptionMemberCount.Request(actionContext.subscription);
    let response = await actionSDK.executeApi(getSubscriptionCount) as actionSDK.GetSubscriptionMemberCount.Response;
    let memberCount = response.memberCount;
    participationPercentage = Math.round((actionSummary.itemCreatorCount / memberCount) * 100);
    console.log("Console log: " + participationPercentage + "% ");
    console.log("Console log: member count: " + memberCount);
    let percentagebar = document.createElement("div");
    let headingpercentage = document.createElement("text");
    headingpercentage.innerText = "Participation " + participationPercentage + " %";
    headingpercentage.style.fontWeight = "bold";
    percentagebar.appendChild(headingpercentage);
    let progressbar = document.createElement("div");
    let myProgress = document.createElement("progress");
    myProgress.style.width = "100%"
    myProgress.setAttribute("value", participationPercentage.toString());
    myProgress.setAttribute("max", "100");
    progressbar.appendChild(myProgress);

    let buttonlink = document.createElement("span");
    let leftspan = document.createElement("span");
    leftspan.style.float = "left";
    let parText = document.createElement("button");
    parText.className = "button_as_link"
    parText.textContent = actionSummary.itemCreatorCount + " of " + memberCount + " have responded";
    parText.addEventListener('click', function () {
        setTabs();
        setPages("1", "2");
    });

    leftspan.appendChild(parText);
    let rightspan = document.createElement("span");
    rightspan.style.float = "right";
    let sendRemider = document.createElement("button");
    sendRemider.className = "button_as_link"
    sendRemider.textContent = "Send Reminder";
    sendRemider.addEventListener('click', function () {
        alert("Reminder Sent");
    });
    rightspan.appendChild(sendRemider);
    buttonlink.appendChild(leftspan);
    buttonlink.appendChild(rightspan);

    barDiv.appendChild(percentagebar);
    barDiv.appendChild(progressbar);
    barDiv.appendChild(buttonlink);
    return barDiv;
}

function createQuestionView() {
    var totalQuestion = document.createElement("div");
    var count = 1;
    actionInstance.dataSets[0].dataFields.forEach((column) => {

        var qDiv = document.createElement("div");
        var linebreak = document.createElement('br');
        var questionHeading = document.createElement('h4');

        qDiv.appendChild(linebreak);
        questionHeading.innerHTML = count + "." + column.title;
        qDiv.appendChild(questionHeading);
        let optionView = null;
        switch (column.type) {
            case actionSDK.ActionDataFieldType.SingleOption:
            case actionSDK.ActionDataFieldType.MultiOption:
                column.options.forEach((option: actionSDK.ActionDataFieldOption) => {
                    optionView = getAggregateOptionView(option.title, option.id, column);
                    qDiv.appendChild(optionView);
                });
                break;
            case actionSDK.ActionDataFieldType.Numeric:
                optionView = getAggregateNumericView(column);
                qDiv.appendChild(optionView);
                break;
            default:
                optionView = getAggregateTextView(column);
                qDiv.appendChild(optionView);
        }
        totalQuestion.appendChild(qDiv);
        count++;
    });
    return totalQuestion;
}

function getAggregateOptionView(title, optionId, column) {

    var oDiv = document.createElement("div");
    var optionTitle = document.createElement('h6');

    optionTitle.innerHTML = title;
    oDiv.appendChild(optionTitle);

    var mDiv = document.createElement("div");
    mDiv.className = "meter";
    var spanTag1 = document.createElement('span');

    let percentage = (actionSummary.defaultAggregates).hasOwnProperty(column.id) ? JSON.parse(actionSummary.defaultAggregates[column.id])[optionId] : 0;
    let wid = percentage / actionSummary.itemCount * 100;
    spanTag1.style.width = isNaN(wid) ? "0%" : wid + "%";

    mDiv.appendChild(spanTag1);

    oDiv.appendChild(mDiv);
    oDiv.addEventListener('click', function () {
        getResponsesperQuestion(column, true, optionId);
        setPages("1", "3");
    });
    return oDiv;
}

function getAggregateNumericView(column) {
    let oDiv = document.createElement("div");
    let questionSummary = (actionSummary.defaultAggregates).hasOwnProperty(column.id) ? JSON.parse(actionSummary.defaultAggregates[column.id]) : {};
    //let questionSummary = (actionSummary.aggregates).hasOwnProperty(column.id) ?  JSON.parse(actionSummary.aggregates[column.id]) : {};
    let responseCount = 0;
    for (let i = 0; i < questionSummary.length; i++) {
        if (!isEmptyOrNull(questionSummary[i])) {
            responseCount++;
        }
    }
    console.log("Console log: Aggregate Numeric View : " + questionSummary);
    console.log("Console log: Question number: " + column.id);
    let sum = questionSummary.hasOwnProperty("s") ? questionSummary["s"] : 0;
    let average = questionSummary.hasOwnProperty("a") ? questionSummary["a"] : 0;
    let responsesCount = (sum === 0) ? responseCount : (Math.round(sum / average));
    let sumText = document.createElement("text");
    sumText.innerText = "  |  " + sum + "  Sum  |  ";
    let averageText = document.createElement("text");
    averageText.innerText = average + " average";

    console.log("Console log: Sum :" + sum);
    console.log("Console log: Average :" + average)
    console.log("Console log: ResponseCount: " + responsesCount);

    let responseDiv = document.createElement("div");
    responseDiv.style.gap = "gap.medium";
    responseDiv.className = "stats-indicator summary-item";
    let responseRowSpan = document.createElement("span");
    let responseText = document.createElement("button");
    responseText.innerText = responsesCount + " Response";
    responseText.className = "button_as_link";
    responseText.addEventListener('click', function () {
        getResponsesperQuestion(column, false);
        setPages("1", "3");
    });
    responseRowSpan.appendChild(responseText);
    responseRowSpan.appendChild(sumText);
    responseRowSpan.appendChild(averageText);
    let newline = document.createElement("br");
    oDiv.appendChild(responseRowSpan);
    oDiv.appendChild(newline);
    return oDiv;
}

function getAggregateTextView(column) {
    let oDiv = document.createElement("div");
    //let questionSummary =  (actionSummary.aggregates).hasOwnProperty(column.id) ? JSON.parse(actionSummary.aggregates[column.id]) : [];
    let questionSummary = (actionSummary.defaultAggregates).hasOwnProperty(column.id) ? JSON.parse(actionSummary.defaultAggregates[column.id]) : [];
    let responseCount = 0;
    for (let i = 0; i < questionSummary.length; i++) {
        if (!isEmptyOrNull(questionSummary[i])) {
            responseCount++;
        }
    }
    let responseText = document.createElement("button");
    responseText.innerText = responseCount + " Response";
    responseText.className = "button_as_link";
    responseText.addEventListener('click', function () {
        getResponsesperQuestion(column, false);
        setPages("1", "3");
    });
    oDiv.appendChild(responseText);
    return oDiv;
}

async function getResNonResTabs() {
    var page2 = document.createElement("div");
    page2.className = "Page";
    page2.id = "2";
    var tabDiv = document.createElement("div");
    tabDiv.className = "tabs";

    var tabBarDiv = document.createElement("div");
    tabBarDiv.className = "tabs__horizontal";

    var button1 = document.createElement("button");
    button1.className = "tabs__button tabs__button--active";
    button1.innerText = "Responders";
    button1.setAttribute("data-for-tab", "1");

    var button2 = document.createElement("button");
    button2.className = "tabs__button";
    button2.innerText = "NonResponders";
    button2.setAttribute("data-for-tab", "2");

    tabDiv.appendChild(button1);
    tabDiv.appendChild(button2);

    page2.appendChild(tabDiv);

    tabBarDiv.appendChild(getResponderTabs());
    tabBarDiv.appendChild(getNonRespondersTabs());
    page2.appendChild(tabBarDiv);

    var goback = document.createElement("button");
    goback.innerText = "Back";
    page2.appendChild(goback);

    goback.addEventListener('click', function () {
        setPages("2", "1");
    });
    page2.style.display = "none";

    root.appendChild(page2);
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
            barParent.querySelectorAll(".tabs__button").forEach(button => {
                console.log("console.log: button.classList: " + button.classList);
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
    var tabContentDiv1 = document.createElement("div");
    tabContentDiv1.className = "tabs__content tabs__content--active";
    tabContentDiv1.setAttribute("data-tab", "1");
    var ResponderDiv = document.createElement("div");
    console.log("Console log: getResponderTabs");
    console.log("ResponderDate.length: " + ResponderDate.length);
    let table = document.createElement('TABLE');
    let tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);
    for (var itr = 0; itr < ResponderDate.length; itr++) {
        console.log("ResponderDate[itr].label: " + ResponderDate[itr].label);
        let tr = document.createElement('TR');
        tr.id = ResponderDate[itr].value2;
        tableBody.appendChild(tr);
        let td1 = document.createElement('TD');
        td1.appendChild(document.createTextNode(ResponderDate[itr].label));
        tr.appendChild(td1);
        let td2 = document.createElement('TD');
        td2.appendChild(document.createTextNode(""));
        td2.style.width = "20%";
        tr.appendChild(td2);
        let td3 = document.createElement('TD');
        td3.appendChild(document.createTextNode(ResponderDate[itr].value));
        tr.appendChild(td3);
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
    ResponderDiv.appendChild(table);
    tabContentDiv1.appendChild(ResponderDiv);
    return tabContentDiv1;
}

function getNonRespondersTabs() {
    var tabContentDiv2 = document.createElement("div");
    tabContentDiv2.className = "tabs__content";
    tabContentDiv2.setAttribute("data-tab", "2");
    var NonResponderDiv = document.createElement("div");
    console.log("Console log: getNonResponderTabs");
    console.log("actionNonResponderslength: " + actionNonResponders.length);
    for (var itr = 0; itr < actionNonResponders.length; itr++) {
        console.log("Console log: row in Nonresponder: " + actionNonResponders[itr].label);
        var perResponder = document.createElement("div");
        perResponder.className = "nonResRow";
        perResponder.innerText = actionNonResponders[itr].label;
        NonResponderDiv.appendChild(perResponder);
    }
    tabContentDiv2.appendChild(NonResponderDiv);
    return tabContentDiv2;
}

function getResponderListPagePerQuestion() {
    var responseView = document.createElement("div");
    responseView.className = "ResponseViewPage";
    responseView.id = "3";
    console.log("responseView.style.display: " + responseView.style.display);
    responseView.style.display = "none";
    root.appendChild(responseView);
}

function getResponsesperQuestion(column, options, optionId = "") {
    var rowDiv = document.createElement("div");
    rowDiv.className = "responseRow";
    var pageId = document.getElementById("3");
    while (pageId.firstChild) {
        pageId.removeChild(pageId.firstChild);
    }
    let questionTitle = document.createElement("div");
    questionTitle.className = "TitleDiv";
    questionTitle.innerText = column.title;
    rowDiv.appendChild(questionTitle);
    if (pageId) {
        for (var itr = 0; itr < ResponderDate.length; itr++) {
            var rowData = document.createElement("div");
            var perRowuser = document.createElement("div");
            if (options) {
                if (optionId.localeCompare(actionDataItems[itr].fieldValues[column.id]) == 0) {
                    perRowuser.innerText = " - " + ResponderDate[itr].label;
                    rowData.appendChild(perRowuser);
                }
            }
            else {
                perRowuser.innerText = " - " + ResponderDate[itr].label;
                var perRowResponse = document.createElement("div");
                perRowResponse.className = "responseperquestion"
                perRowResponse.innerText = "Response: " + actionDataItems[itr].fieldValues[column.id];
                rowData.appendChild(perRowuser);
                rowData.appendChild(perRowResponse);
            }
            rowDiv.appendChild(rowData);
            rowDiv.appendChild(linebreak);
            console.log("Console log: For loop in getContentForPage");
        }
    }
    var goback = document.createElement("button");
    goback.innerText = "Back";
    goback.addEventListener('click', function () {
        setPages("3", "1");
    });
    pageId.appendChild(rowDiv);
    pageId.appendChild(goback);
}

function getPageResponsePerUser() {
    var ResponsePerUserView = document.createElement("div");
    ResponsePerUserView.className = "ResponsePerUserViewPage";
    ResponsePerUserView.id = "4";
    ResponsePerUserView.style.display = "none";
    root.appendChild(ResponsePerUserView);
}

function getResponsePerUser(id, index) {
    var rowDiv = document.createElement("div");
    rowDiv.className = "responseRow";
    var pageId = document.getElementById("4");
    while (pageId.firstChild) {
        pageId.removeChild(pageId.firstChild);
    }
    console.log("console log: id: " + id);
    console.log("console log: index: " + index);
    if (pageId) {
        var dataPerUser = actionDataItems[index].fieldValues;
        let questionitr = 0;
        for (var idx in dataPerUser) {
            console.log("console log: actionDataItems[index].fieldValues[idx]: " + actionDataItems[index].fieldValues[idx]);
            console.log("console log: actionInstance.dataSets[0].dataFields[questionitr].title:" + actionInstance.dataSets[0].dataFields[questionitr].title);
            var rowData = document.createElement("div");
            var ques = document.createElement("div");
            ques.innerText = "Question: " + actionInstance.dataSets[0].dataFields[questionitr].title
            var ans = document.createElement("div");
            ans.className = "responseperquestion";
            ans.innerText = "Response: " + actionDataItems[index].fieldValues[idx];
            rowData.appendChild(ques);
            rowData.appendChild(ans);
            questionitr++;
            rowDiv.appendChild(rowData);
            rowDiv.appendChild(linebreak);
        }
    }
    var goback = document.createElement("button");
    goback.innerText = "Back";
    goback.addEventListener('click', function () {
        setPages("4", "2");
    });
    pageId.appendChild(rowDiv);
    pageId.appendChild(goback);
}

function OnPageLoad() {
    actionSDK.executeApi(new actionSDK.GetContext.Request())
        .then(function (response: actionSDK.GetContext.Response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            actionContext = response.context;
            getDataItems(response.context.actionId);
        })
        .catch(function (error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

function getDataItems(actionId) {
    var getActionRequest = new actionSDK.GetAction.Request(actionId);
    var getSummaryRequest = new actionSDK.GetActionDataItemsSummary.Request(actionId, true);
    var getDataItemsRequest = new actionSDK.GetActionDataItems.Request(actionId);
    // var closeViewRequest = new actionSDK.CloseView.Request();
    var batchRequest = new actionSDK.BaseApi.BatchRequest([getActionRequest, getSummaryRequest, getDataItemsRequest]);
    actionSDK.executeBatchApi(batchRequest)
        .then(function (batchResponse: actionSDK.BaseApi.BatchResponse) {
            console.info("BatchResponse: " + JSON.stringify(batchResponse));
            actionInstance = (<actionSDK.GetAction.Response>batchResponse.responses[0]).action;
            actionSummary = (<actionSDK.GetActionDataItemsSummary.Response>batchResponse.responses[1]).summary;
            actionDataItems = (<actionSDK.GetActionDataItems.Response>batchResponse.responses[2]).dataItems;
            actionDataItemsLength = actionDataItems == null ? 0 : actionDataItems.length;
            createBody();
        })
        .catch(function (error) {
            console.log("Console log: Error: " + JSON.stringify(error));
        });
}