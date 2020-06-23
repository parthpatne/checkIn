import * as actionSDK from 'action-sdk-sunny';
import { Utils } from '../common/Utils';
import { UxUtils } from '../common/UxUtils';

var root = document.getElementById("root");
let row = {};
let actionInstance = null;

OnPageLoad();

function createBody() {
    var title = document.createElement('h3');
    var submit = document.createElement("BUTTON");
    title.innerHTML = actionInstance.displayName;
    submit.innerHTML = "Submit";
    submit.style.float = "right";
    submit.addEventListener("click", function () {
        submitForm();
    });
    root.appendChild(title);
    createQuestionView();
    root.appendChild(submit);
    root.appendChild(document.createElement('br'));
    root.appendChild(document.createElement('br'));
}

function updateQuestionResponse(questionResponse, colomnId) {
    row[colomnId] = questionResponse;
}

function submitForm() {
    actionSDK.executeApi(new actionSDK.GetContext.Request())
        .then(function (response: actionSDK.GetContext.Response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            addDataRows(response.context.actionId);
        })
        .catch(function (error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

function getDataRow(actionId) {
    return {
        id: Utils.generateGUID(),
        actionId: actionId,
        dataTableId: "TestDataSet",
        columnValues: row
    };
}

function addDataRows(actionId) {
    var addDataRowRequest = new actionSDK.AddActionDataRow.Request(getDataRow(actionId));
    var closeViewRequest = new actionSDK.CloseView.Request();
    var batchRequest = new actionSDK.BaseApi.BatchRequest([addDataRowRequest, closeViewRequest]);
    actionSDK.executeBatchApi(batchRequest)
        .then(function (batchResponse) {
            console.info("BatchResponse: " + JSON.stringify(batchResponse));
        })
        .catch(function (error) {
            console.error("Error: " + JSON.stringify(error));
        })
}

function OnPageLoad() {
    actionSDK.executeApi(new actionSDK.GetContext.Request())
        .then(function (response: actionSDK.GetContext.Response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            getActionInstance(response.context.actionId);
        })
        .catch(function (error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

function getActionInstance(actionId) {
    actionSDK.executeApi(new actionSDK.GetAction.Request(actionId))
        .then(function (response: actionSDK.GetAction.Response) {
            console.info("Response: " + JSON.stringify(response));
            actionInstance = response.action;
            createBody();
        })
        .catch(function (error) {
            console.log("Error: " + JSON.stringify(error));
        });
}

// *********************************************** HTML ELEMENT***********************************************

function createQuestionView() {
    actionInstance.dataTables[0].dataColumns.forEach((column) => {
        var questionDiv = document.createElement("div");
        UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
        var questionHeading = document.createElement('h4'); // Heading of For
        questionHeading.innerHTML = column.displayName;
        questionDiv.appendChild(questionHeading);
        if (column.valueType == "SingleOption") {
            column.options.forEach((option) => {
                var radioOption = getRadioButton(option.displayName, column.name, option.name);
                questionDiv.appendChild(radioOption);

            });
        }
        else if (column.valueType == "Text") {
            var radioOption = addInputElement("Enter Text", column.name, "text");
            questionDiv.appendChild(radioOption);
        }
        else if (column.valueType == "Numeric") {
            var radioOption = addInputElement("Enter Number", column.name, "number");
            questionDiv.appendChild(radioOption);
        }
        root.appendChild(questionDiv);
    });
}

function addInputElement(ph: string, id: string, type: string) {
    var inputelement = UxUtils.createInputElement(ph, id, type);
    inputelement.setAttribute("columnId", id);
    UxUtils.setClass(inputelement, 'responseInputElement');
    inputelement.addEventListener("change", function () {
        updateQuestionResponse(this.value, this.getAttribute("columnId"));
    });
    return inputelement;
}

function getRadioButton(text, name, id) {
    var radioInputDiv = document.createElement("div");
    radioInputDiv.id = id;
    radioInputDiv.setAttribute("columnId", name);
    radioInputDiv.addEventListener("click", function () {
        updateQuestionResponse(this.id, this.getAttribute("columnId"));
    });
    var radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = name;
    radioInput.id = id;
    radioInput.style.margin = "10px";
    UxUtils.setClass(radioInput, 'radioInput');
    radioInputDiv.appendChild(radioInput);
    radioInputDiv.appendChild(document.createTextNode(text));
    UxUtils.addElement(UxUtils.lineBreak(), radioInputDiv);
    return radioInputDiv;
} 