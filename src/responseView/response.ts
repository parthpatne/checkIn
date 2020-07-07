import * as actionSDK from 'action-sdk-sunny';
import { Utils } from '../common/Utils';
import { UxUtils } from '../common/UxUtils';
import { ActionSdkHelper } from '../common/ActionSdkHelper';

let root = document.getElementById("root");
let actionInstance: actionSDK.Action = null;
let columnValues = {};

/*
* Entry Point for Building Up the Response View
*/
OnPageLoad();

/*
* @desc Entry Point for Building Up Response View and Loads requires attributes from Action SDK,
*       Fetch Action Instance using Service API and on Success create Response body
*/
function OnPageLoad() {
    ActionSdkHelper.getAction(createBody);
}

/*
* @desc Create Response View Body for corresponding Action Instances
*/
function createBody(action: actionSDK.Action) {
    actionInstance = action;
    let title = UxUtils.getElement('h3');
    let submitButton = UxUtils.getButton(UxUtils.getString("submit"), function () {
        /*
        * Submit Response flow to create response for corresponding Action Instances
        */
        submitForm();
    });
    title.innerHTML = actionInstance.displayName;
    UxUtils.setClass(submitButton, 'submitButton');
    UxUtils.addElement(title, root);
    /*
    * Prepare the Question View Component of the response view
    */
    createQuestionView();
    submitButton.setAttribute("id", "submitForm");
    UxUtils.addElement(submitButton, root);
    UxUtils.addElement(UxUtils.lineBreak(), root);
    UxUtils.addElement(UxUtils.lineBreak(), root);
}

/*
* @desc Prepare the Question View Component of the response view
*/
function createQuestionView() {
    actionInstance.dataTables[0].dataColumns.forEach((column) => {
        let questionDiv = UxUtils.getElement('div');
        let questionTitle = UxUtils.getElement('h4');
        questionTitle.innerHTML = column.displayName;

        UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
        /*
        * Add Question Title
        */
        UxUtils.addElement(questionTitle, questionDiv);

        /*
        * Add Columns specific to Column type
        */
        if (column.valueType == actionSDK.ActionDataColumnValueType.SingleOption) {
            column.options.forEach((option) => {
                let radioOption = getRadioButton(option.displayName, column.name, option.name);
                UxUtils.addElement(radioOption, questionDiv);
            });
        }
        else if (column.valueType == actionSDK.ActionDataColumnValueType.Text) {
            let radioOption = addInputElement(UxUtils.getString("enterTextPlaceholder"), column.name, "text");
            UxUtils.addElement(radioOption, questionDiv);
        }
        else if (column.valueType == actionSDK.ActionDataColumnValueType.Numeric) {
            let radioOption = addInputElement(UxUtils.getString("enterNumberPlaceholder"), column.name, "number");
            UxUtils.addElement(radioOption, questionDiv);
        }
        UxUtils.addElement(questionDiv, root);
    });
}

/*
* @desc Function to trigger the flow for Submit Survey Response,
*       Get action package context from Service which is required to create response
*/
function submitForm() {
    /*
    * Create Submit Response Request
    */
    ActionSdkHelper.addDataRows(getDataRow);
}

/*
* @desc Prepare Data Row request object for given Action Instance Id
* @param {string} actionId of the Action Instance
* @returns Data Row request object
*/
function getDataRow(actionId: string) {
    return {
        id: Utils.generateGUID(),
        actionId: actionId,
        dataTableId: "TestDataSet",
        columnValues: columnValues
    };
}

/*
* @desc Prepare HTML component for Input type Responses and handles Update Question Response
* @param {string} placeholder of empty input response element
* @param {string} id of input response element
* @param {string} type allowed for input response element
* @returns {HTMLElement} inputElement
*/
function addInputElement(placeholder: string, id: string, type: string) {
    let inputElement = UxUtils.createInputElement(placeholder, id, type);
    inputElement.setAttribute("columnId", id);
    UxUtils.setClass(inputElement, 'responseInputElement');
    inputElement.addEventListener("change", function () {
        updateQuestionResponse(this.value, this.getAttribute("columnId"));
    });
    return inputElement;
}

/*
* @desc Prepare HTML component for MCQ/SingleSelect choice responses and handles Update Question Response
* @param {string} text of MCQ/SingleSelect choice
* @param {string} name of MCQ/SingleSelect choice
* @param {string} id of MCQ/SingleSelect choice Div
* @returns {HTMLElement} inputElement
*/
function getRadioButton(text: string, name: string, id: string) {
    let radioInputDiv = document.createElement("div");
    radioInputDiv.id = id;
    radioInputDiv.setAttribute("columnId", name);
    radioInputDiv.addEventListener("click", function () {
        updateQuestionResponse(this.id, this.getAttribute("columnId"));
    });
    let radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = name;
    radioInput.id = id;
    UxUtils.setClass(radioInput, 'radioInput');
    UxUtils.addElement(radioInput, radioInputDiv);
    radioInputDiv.appendChild(document.createTextNode(text));
    UxUtils.addElement(UxUtils.lineBreak(), radioInputDiv);
    return radioInputDiv;
}

/*
* @desc Function to Update Question Response after update of response
* @param {string} questionResponse for corresponding Question with colomn Id
* @param {string} colomnId of corresponding Question 
*/
function updateQuestionResponse(questionResponse: string, colomnId: string) {
    columnValues[colomnId] = questionResponse;
}
