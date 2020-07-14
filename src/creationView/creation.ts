import * as actionSDK from 'action-sdk-sunny';
import questionTemplate from './questionSet.json';
import { Utils } from "../common/Utils";
import { UxUtils } from '../common/UxUtils';
import { ActionSdkHelper } from '../common/ActionSdkHelper';

const questionTemplateTitles = Object.keys(questionTemplate);
const choiceIdPrefix = "choiceId";
let questionMap = new Map();
let singleOptionChoicesMap = new Map();
let root = document.getElementById("root");
let bodyDiv = UxUtils.getDiv();
let footerDiv = UxUtils.getDiv();
let questionCount = 0;
let currentSelectedTemplate = 0;
let strings;

/*
* Entry Point for Building Up the Creation View
*/
OnPageLoad();

/*
* @desc Entry Point for Building Up Creation View and Loads requires attributes from Action SDK
*/
function OnPageLoad() {

    let surveytitle = UxUtils.getContentEditableSpan("", UxUtils.getString("surveyTitlePlaceholder"), {}, null);
    let selectTemplate = <HTMLSelectElement>UxUtils.getElement("select");
    let questionTypeList = <HTMLSelectElement>UxUtils.getElement("select");
    let submitButton = UxUtils.getButton(UxUtils.getString("submitForm"), function () {
        submitForm();
    });
    let addQuestionButton = UxUtils.getButton(UxUtils.getString("addQuestion"), function () {
        addQuestion(actionSDK.ActionDataColumnValueType.SingleOption);
    });

    strings = ActionSdkHelper.getLocalizedStrings();
    surveytitle.setAttribute("id", "surveyTitle");
    submitButton.setAttribute("id", "submitForm");
    UxUtils.setClass(selectTemplate, 'selectTemplateDropDown');

    /*
    * Create DropDown List for Question Templates Selection
    */
    questionTemplateTitles.forEach(element => {
        selectTemplate.options.add(new Option(element));
    });

    selectTemplate.addEventListener("change", function () {

        if (questionCount == 0 && Utils.isEmptyString(surveytitle.innerText)) {
            fetchQuetionSetForTemplate(selectTemplate.selectedIndex);
            currentSelectedTemplate = selectTemplate.selectedIndex;
        }
        else {
            /*
            * Show Dialog Alert for Content Loss after changing the Question Template
            */
            UxUtils.showAlertDialog(UxUtils.getString("templateChangeAlertTitle"), UxUtils.getString("templateChangeAlertText"),
                UxUtils.getString("ok"), () => {
                    fetchQuetionSetForTemplate(selectTemplate.selectedIndex);
                    currentSelectedTemplate = selectTemplate.selectedIndex;
                },
                UxUtils.getString("cancel"), () => {
                    selectTemplate.selectedIndex = currentSelectedTemplate;
                });
        }
    });

    /*
    * Create DropDown List for Adding new Question with avaliable Question Types
    */
    questionTypeList.options.add(new Option("SingleOption", actionSDK.ActionDataColumnValueType.SingleOption));
    questionTypeList.options.add(new Option("TEXT", actionSDK.ActionDataColumnValueType.Text));
    questionTypeList.options.add(new Option("NUMBER", actionSDK.ActionDataColumnValueType.Numeric));
    questionTypeList.selectedIndex = -1;
    questionTypeList.addEventListener("change", function () {
        addQuestion(<actionSDK.ActionDataColumnValueType>questionTypeList.value);
        questionTypeList.selectedIndex = -1;
    });

    /*
    * Set CSS styling Attributed to HTML components using class name defined in CSS file
    */
    UxUtils.setClass(surveytitle, 'surveyTitle');
    UxUtils.setClass(questionTypeList, 'questionTypeList');
    UxUtils.setClass(addQuestionButton, 'addQuestionButton');
    UxUtils.setClass(submitButton, 'submitButton');
    UxUtils.setClass(footerDiv, 'creationFooterDiv');

    /*
    * Prepare HTML DOM Body
    */
    UxUtils.addElement(selectTemplate, root);
    UxUtils.addElement(surveytitle, root);
    UxUtils.addElement(bodyDiv, root);
    UxUtils.addElement(footerDiv, root);
    UxUtils.addElement(UxUtils.lineBreak(), footerDiv);
    UxUtils.addElement(addQuestionButton, footerDiv);
    UxUtils.addElement(questionTypeList, footerDiv);
    UxUtils.addElement(submitButton, footerDiv);
}

/*
* @desc Fetch and Render Questions of given index of Question Set Template Json
* @param {Number} selectedIndex of Question template
*/
function fetchQuetionSetForTemplate(selectedIndex: number) {

    let templateQuestions = Object.values(questionTemplate)[selectedIndex];
    bodyDiv.innerHTML = "";
    questionCount = 0;

    /*
    * Set Survey Title to template Title
    */
    (<HTMLInputElement>document.getElementById("surveyTitle")).innerText = Object.keys(questionTemplate)[selectedIndex];

    /*
    * For None Selected Question Template make survey title empty
    */
    if (selectedIndex == 0) {
        (<HTMLInputElement>document.getElementById("surveyTitle")).innerText = "";
    }

    /*
    * Render Question Set for Given Template
    */
    templateQuestions.forEach(question => {
        addQuestion(actionSDK.ActionDataColumnValueType.SingleOption, question);

    });
}

/*
* @desc Create new Question of given type with optional question JSON attribute which will create Question with Prefilled Content
* @param {actionSDK.ActionDataColumnValueType} type : Question Type 
* @param {JSON} questionJson : required for prefilled question content
* @return question component of given question type
*/
function addQuestion(type: actionSDK.ActionDataColumnValueType, questionJson?: JSON) {
    let question;

    if (type == actionSDK.ActionDataColumnValueType.SingleOption) {
        /*
        * Render SingleOption Question Component
        */
        question = addSingleOptionQuestion(questionJson);
    }
    if (type == actionSDK.ActionDataColumnValueType.Text) {
        /*
        * Render TEXT Question Component
        */
        question = addTextQuestion(questionJson);
    }
    if (type == actionSDK.ActionDataColumnValueType.Numeric) {
        /*
        * Render NUMBER Question Component
        */
        question = addNumberQuestion(questionJson);
    }
    UxUtils.setClass(question, 'baseQuestion');
    UxUtils.addElement(question, bodyDiv);
    window.scrollTo(0, document.documentElement.scrollHeight);
    questionCount++;
    return question;
}

/*
* @desc Create new SingleOption Question with optional question JSON attribute which will create Question with Prefilled Content
* @param {JSON} questionJson : required for prefilled question content
* @return SingleOption question component
*/
function addSingleOptionQuestion(questionJson?: JSON) {
    let questionDiv = UxUtils.getDiv();

    let choiceDiv = UxUtils.getElement("ul");
    let questionId = questionCount.toString();
    let questionHeading = UxUtils.getElement("label");
    let questionTitleInputelement = UxUtils.createInputElement(UxUtils.getString("enterQuestionPlaceholder"), questionCount.toString(), "text");
    let question: actionSDK.ActionDataColumn = {
        name: questionId,
        displayName: "",
        valueType: actionSDK.ActionDataColumnValueType.SingleOption,
        allowNullValue: false,
        options: []
    }
    let choices = [];
    let choiceCount = 0;
    let addChoiceButton = UxUtils.getButton(UxUtils.getString("addChoiceButton"), function () {
        let choiceId = getChoiceId(questionId, choiceCount++);
        choices.push(choiceId);
        let choice = addChoice(UxUtils.getString("addChoicePlaceholder"), questionId, choiceId);
        UxUtils.addElement(choice, choiceDiv);
        singleOptionChoicesMap.set(questionId, choices);
    });

    questionTitleInputelement.setAttribute("dt", "SingleOption");
    singleOptionChoicesMap.set(questionId, choices);
    questionMap.set(questionId, question);
    questionDiv.setAttribute("id", questionId + "div");

    UxUtils.setClass(questionTitleInputelement, 'addQuestionTitleInputElement');
    UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
    UxUtils.addElement(questionHeading, questionDiv);
    UxUtils.addElement(getQuestionDeletebutton(questionId), questionDiv);
    UxUtils.addElement(questionTitleInputelement, questionDiv);

    if (questionJson != null) {
        /*
        * Render Question with given Prefilled Content
        */
        questionTitleInputelement.value = questionJson["title"];
        questionJson["options"].forEach(option => {
            let choiceId = getChoiceId(questionId, choiceCount++);
            choices.push(choiceId);
            singleOptionChoicesMap.set(questionId, choices);
            let choice = addChoice(UxUtils.getString("addChoicePlaceholder"), questionId, choiceId, option.title);
            UxUtils.addElement(choice, choiceDiv);
        });
    }
    else {
        /*
        * Add two default choice with empty content
        */

        /* Choice 1 */
        let choiceId1 = getChoiceId(questionId, choiceCount++);
        choices.push(choiceId1);
        let choice = addChoice(UxUtils.getString("addChoicePlaceholder"), questionId, choiceId1);
        UxUtils.addElement(choice, choiceDiv);

        /* Choice 2 */
        let choiceId2 = getChoiceId(questionId, choiceCount++);
        choices.push(choiceId2);
        choice = addChoice(UxUtils.getString("addChoicePlaceholder"), questionId, choiceId2);
        UxUtils.addElement(choice, choiceDiv);
        singleOptionChoicesMap.set(questionId, choices);
    }
    UxUtils.setClass(addChoiceButton, 'addChoiceButton');
    UxUtils.addElement(choiceDiv, questionDiv);
    UxUtils.addElement(addChoiceButton, questionDiv);
    UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
    return questionDiv;
}

function getChoiceId(questionId: string, choiceCount) {
    return (questionId + choiceIdPrefix + choiceCount);
}
/*
* @desc Create new Number Question with optional question JSON attribute which will create Question with Prefilled Content
* @param {JSON} questionJson : required for prefilled question content
* @return Number question component
*/
function addNumberQuestion(questionJson?: JSON) {
    let questionDiv = UxUtils.getDiv();

    let questionHeading = UxUtils.getElement("label");
    let questionTitleInputelement = UxUtils.createInputElement(UxUtils.getString("enterQuestionPlaceholder"), questionCount.toString(), "text"); // Create Input Field for Name
    let questionId = questionCount.toString();
    let question: actionSDK.ActionDataColumn = {
        name: questionId,
        displayName: "",
        valueType: actionSDK.ActionDataColumnValueType.Numeric,
        allowNullValue: false,
        options: []
    }
    let disabledResponse = UxUtils.createInputElement(UxUtils.getString("enterTextPlaceholder"), questionCount.toString(), "text");
    disabledResponse.disabled = true

    questionMap.set(questionId, question);
    if (questionJson != null) {
        questionTitleInputelement.value = questionJson["title"];
    }

    questionDiv.setAttribute("id", questionCount + "div");
    UxUtils.setClass(questionTitleInputelement, 'addQuestionTitleInputElement');
    UxUtils.setClass(disabledResponse, 'addQuestionTitleInputElement');
    UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
    UxUtils.addElement(questionHeading, questionDiv);
    UxUtils.addElement(getQuestionDeletebutton(questionId), questionDiv);
    UxUtils.addElement(questionTitleInputelement, questionDiv);
    UxUtils.addElement(disabledResponse, questionDiv);
    UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
    questionCount++;
    return questionDiv;
}

/*
* @desc Create new TEXT Question with optional question JSON attribute which will create Question with Prefilled Content
* @param {JSON} questionJson : required for prefilled question content
* @return TEXT question component
*/
function addTextQuestion(questionJson?: JSON) {
    let questionDiv = UxUtils.getDiv();

    let questionHeading = UxUtils.getElement("label");
    let questionTitleInputelement = UxUtils.createInputElement(UxUtils.getString("enterQuestionPlaceholder"), questionCount.toString(), "text"); // Create Input Field for Name
    let questionId = questionCount.toString();
    let question: actionSDK.ActionDataColumn = {
        name: questionId,
        displayName: "",
        valueType: actionSDK.ActionDataColumnValueType.Text,
        allowNullValue: false,
        options: []
    }
    let disabledResponse = UxUtils.createInputElement(UxUtils.getString("enterTextPlaceholder"), questionCount.toString(), "text");
    disabledResponse.disabled = true

    questionMap.set(questionId, question);

    if (questionJson != null) {
        questionTitleInputelement.value = questionJson["title"];
    }

    questionDiv.setAttribute("id", questionCount + "div");

    UxUtils.setClass(questionTitleInputelement, 'addQuestionTitleInputElement');
    UxUtils.setClass(disabledResponse, 'addQuestionTitleInputElement');
    UxUtils.addElement(questionHeading, questionDiv);
    UxUtils.addElement(getQuestionDeletebutton(questionId), questionDiv);
    UxUtils.addElement(questionTitleInputelement, questionDiv);
    UxUtils.addElement(disabledResponse, questionDiv);
    UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
    questionCount++;
    return questionDiv;
}

/*
* @desc Function to trigger the flow for Creating new survey instance,
*       fetch the action package context from Service which is required to create the new action instance
*/
function submitForm() {
    ActionSdkHelper.getActionPackageId(createAction);
}

/*
* @desc Function to create new action instance after validation,
*       in case of validation failure it will prompt Dialog specific to error
* @param {string} actionPackageId required for prefilled question content
*/
function createAction(actionPackageId: string) {
    let surveyTitle = (<HTMLInputElement>document.getElementById("surveyTitle")).innerText;


    /*
    * Validate for Non Empty Survey title
    */
    if (Utils.isEmptyString(surveyTitle)) {
        UxUtils.showAlertDialog(UxUtils.getString("validationErrorTitle"), UxUtils.getString("emptySurveyTitleError"), UxUtils.getString("ok"), null, null, null);
        return;
    }

    /*
    * Validate Question Set with required inputs and prepare the Question List Array
    */
    let result = getQuestionSet();
    if (!result["isSuccess"]) {
        UxUtils.showAlertDialog(UxUtils.getString("validationErrorTitle"), UxUtils.getString("emptyQuestionTitleError"), UxUtils.getString("ok"), null, null, null);
        return;
    }

    let questionsSet = result["columnArray"];

    /*
    * Prepare the Action Instance Request Object
    */
    let action: actionSDK.Action = {
        id: Utils.generateGUID(),
        actionPackageId: actionPackageId,
        version: 1,
        displayName: (<HTMLInputElement>document.getElementById("surveyTitle")).innerText,
        expiryTime: new Date().getTime() + (7 * 24 * 60 * 60 * 1000),
        dataTables: [
            {
                name: "TestDataSet",
                rowsVisibility: actionSDK.Visibility.All,
                rowsEditable: false,
                canUserAddMultipleRows: true,
                dataColumns: questionsSet
            }
        ]
    };

    /*
    * Service Request to create new Action Instance 
    */
    ActionSdkHelper.createActionInstance(action);
}

/*
*  @desc Funtion to Validate Question Set with required inputs and prepare the Question List Array
*  @return {Object} result with attributes {boolean} isSuccess and {JSON Array} columnArray                   
*/
function getQuestionSet() {
    let columnArray = [];
    let isSuccess = true;

    if (questionMap.size == 0) {
        return { isSuccess: false, columnArray: columnArray };
    }

    questionMap.forEach(question => {
        let title = (<HTMLInputElement>document.getElementById(question.name)).value;
        if (Utils.isEmptyString(title)) {
            isSuccess = false;
            return;
        }
        question.displayName = title;
        if (singleOptionChoicesMap.get(question.id)) {
            singleOptionChoicesMap.get(question.id).forEach(choiceId => {
                let optionDisplayName = (<HTMLInputElement>document.getElementById(choiceId + "ip")).value;
                if (Utils.isEmptyString(optionDisplayName)) {
                    isSuccess = false;
                    return;
                }
                let option = {
                    name: choiceId,
                    displayName: optionDisplayName
                }
                question.options.push(option);
            });
        }
        columnArray.push(question);
    });

    return { isSuccess: isSuccess, columnArray: columnArray };
}

/*
* @desc Funtion to Create and Bind delete button for given question id
* @param {string} questionId of the Question
*/
function getQuestionDeletebutton(questionId: string) {
    let deleteQuestionButton = UxUtils.getElement("img");
    deleteQuestionButton.setAttribute('src', 'images/delete.svg');
    UxUtils.setClass(deleteQuestionButton, 'deleteQuestionButton');
    deleteQuestionButton.addEventListener("click", function () {
        deleteQuestion(this, questionId);
    });
    return deleteQuestionButton;
}

/*
* @desc Funtion to Delete Question Component
* @param {HTMLElement} element
* @param {string} questionId of the Question which need to get deleted
*/
function deleteQuestion(element: HTMLElement, questionId: string) {
    let parentDiv = document.getElementById((<HTMLElement>element.parentNode).id);
    UxUtils.removeElement(parentDiv);
    questionMap.delete(questionId);
}

/*
* @desc Function to Add choice for MCQ/SingleSelect Question type
* @param {HTMLElement} element
* @param {string} questionId of the Question which need to get deleted
*/
function addChoice(ph: string, questionId: string, choiceId: string, val: string = "") {
    let li = UxUtils.getElement("li");
    UxUtils.setId(li, choiceId);

    let choiceInputElement = UxUtils.createInputElement(ph, choiceId + "ip", "text");
    choiceInputElement.setAttribute("value", val);
    UxUtils.setClass(choiceInputElement, 'addChoiceInput');

    let deleteButton = getChoiceDeletebutton(questionId, choiceId);
    let inputAndDelete = UxUtils.getHorizontalDiv([choiceInputElement, deleteButton]);

    UxUtils.addElement(inputAndDelete, li);
    return li;
}

/*
* @desc Create Delete Button component for MCQ/SingleSelect Question type
* @param {string} questionId of the Question
* @param {string} choiceId of the Question to get deleted
* @returns {HTMLElement} delete Choice Button component for MCQ/SingleSelect Question type
*/
function getChoiceDeletebutton(questionId: string, choiceId: string) {
    let deleteChoiceButton = UxUtils.getElement("img");
    deleteChoiceButton.setAttribute('src', 'images/deleteChoice.png');
    UxUtils.setClass(deleteChoiceButton, 'deleteChoiceButton');
    deleteChoiceButton.addEventListener("click", function () {
        deleteChoice(questionId, choiceId);
    });
    return deleteChoiceButton;
}

/*
* @desc Function to Delete choice for MCQ/SingleSelect Question type
* @param {string} questionId of the Question
* @param {string} choiceId of the Question to get deleted
*/
function deleteChoice(questionId: string, choiceId: string) {
    if (singleOptionChoicesMap.get(questionId).length == 2) {
        UxUtils.showAlertDialog(UxUtils.getString("choiceDeleteErrorTitle"), UxUtils.getString("choiceDeleteErrorText"), UxUtils.getString("ok"), null, null, null);
        return;
    }
    let choiceElement = document.getElementById(choiceId);
    choiceElement.parentNode.removeChild(choiceElement);
    let choiceIds = singleOptionChoicesMap.get(questionId) as string[];
    let choiceIndex = choiceIds.indexOf(choiceId);
    if (choiceIndex >= 0) {
        delete choiceIds[choiceIndex];
    }
}