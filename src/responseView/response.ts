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
    submit.innerHTML = UxUtils.getString("submit");
    UxUtils.setClass(submit, 'responseSubmitButton');
    submit.addEventListener("click", function () {
        submitForm();
    });
    UxUtils.addElement(title, root);
    createQuestionView();
    UxUtils.addElement(submit, root);
    UxUtils.addElement(UxUtils.lineBreak(), root);
    UxUtils.addElement(UxUtils.lineBreak(), root);
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
        var questionHeading = document.createElement('h4');
        questionHeading.innerHTML = column.displayName;
        UxUtils.addElement(questionHeading, questionDiv);
        if (column.valueType == "SingleOption") {
            column.options.forEach((option) => {
                var radioOption = getRadioButton(option.displayName, column.name, option.name);
                UxUtils.addElement(radioOption, questionDiv);

            });
        }
        else if (column.valueType == "Text") {
            var radioOption = addInputElement(UxUtils.getString("enterTextPlaceholder"), column.name, "text");
            UxUtils.addElement(radioOption, questionDiv);
        }
        else if (column.valueType == "Numeric") {
            var radioOption = addInputElement(UxUtils.getString("enterNumberPlaceholder"), column.name, "number");
            UxUtils.addElement(radioOption, questionDiv);
        }
        UxUtils.addElement(questionDiv, root);
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
    UxUtils.setClass(radioInput, 'radioInput');
    UxUtils.addElement(radioInput, radioInputDiv);
    radioInputDiv.appendChild(document.createTextNode(text));
    UxUtils.addElement(UxUtils.lineBreak(), radioInputDiv);
    return radioInputDiv;
} 