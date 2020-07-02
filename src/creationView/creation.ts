import * as actionSDK from 'action-sdk-sunny';
import questionTemplate from './questionSet.json';
import { Utils } from "../common/Utils";
import { UxUtils } from '../common/UxUtils';
import { Question } from './Question';

const questionTemplateTitles = Object.keys(questionTemplate);
const choiceIdPrefix = "choiceId";
let questionMap = new Map();
let singleOptionChoicesMap = new Map();
let root = document.getElementById("root");
let bodyDiv = UxUtils.getElement("div");
let footerDiv = UxUtils.getElement("div");
let questionCount = 0;
let currentSelectedTemplate = 0;
let strings;

/**
  * Entry Point for Building Up the Creation View
*/
OnPageLoad();

/**
  * @desc Entry Point for Building Up Creation View,It Loads requires attributes from Action SDK like Localized String
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

    surveytitle.setAttribute("id", "surveyTitle");
    submitButton.setAttribute("id", "submitForm");
    UxUtils.setClass(selectTemplate, 'selectTemplateDropDown');

    /**
    * Gets the localized strings in which the app is rendered
    */
    actionSDK.executeApi(new actionSDK.GetLocalizedStrings.Request())
        .then(function (response: actionSDK.GetLocalizedStrings.Response) {
            strings = response.strings;
        })
        .catch(function (error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });

    /**
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
            /**
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

    /**
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

    /**
    * Set CSS styling Attributed to HTML components using class name defined in CSS file
    */
    UxUtils.setClass(surveytitle, 'surveyTitle');
    UxUtils.setClass(questionTypeList, 'questionTypeList');
    UxUtils.setClass(addQuestionButton, 'addQuestionButton');
    UxUtils.setClass(submitButton, 'submitButton');
    UxUtils.setClass(footerDiv, 'creationFooterDiv');

    /**
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

/**
  * @desc Fetch and Render Questions of given index of Question Set Template Json
  * @param {Number} selectedIndex of Question template
*/
function fetchQuetionSetForTemplate(selectedIndex: number) {

    let templateQuestions = Object.values(questionTemplate)[selectedIndex];
    bodyDiv.innerHTML = "";
    questionCount = 0;

    /**
    * Set Survey Title to template Title
    */
    (<HTMLInputElement>document.getElementById("surveyTitle")).innerText = Object.keys(questionTemplate)[selectedIndex];

    /**
    * For None Selected Question Template make survey title empty
    */
    if (selectedIndex == 0) {
        (<HTMLInputElement>document.getElementById("surveyTitle")).innerText = "";
    }

    /**
    * Render Question Set for Given Template
    */
    templateQuestions.forEach(question => {
        addQuestion(actionSDK.ActionDataColumnValueType.SingleOption, question);

    });
}

/**
  * @desc Create new Question of given type with optional question JSON attribute which will create Question with Prefilled Content
  * @param {actionSDK.ActionDataColumnValueType} type : Question Type 
  * @param {JSON} questionJson : required for prefilled question content
  * @return question component of given question type
*/
function addQuestion(type: actionSDK.ActionDataColumnValueType, questionJson?: JSON) {
    let question;

    if (type == actionSDK.ActionDataColumnValueType.SingleOption) {
        /**
        * Render SingleOption Question Component
        */
        question = addSingleOptionQuestion(questionJson);
    }
    if (type == actionSDK.ActionDataColumnValueType.Text) {
        /**
        * Render TEXT Question Component
        */
        question = addTextQuestion(questionJson);
    }
    if (type == actionSDK.ActionDataColumnValueType.Numeric) {
        /**
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

/**
  * @desc Create new SingleOption Question with optional question JSON attribute which will create Question with Prefilled Content
  * @param {JSON} questionJson : required for prefilled question content
  * @return SingleOption question component
*/
function addSingleOptionQuestion(question?: JSON) {
    let questionDiv = UxUtils.getElement("div");
    let choiceDiv = UxUtils.getElement("ul");
    let questionId = questionCount.toString();
    let questionHeading = UxUtils.getElement("label");
    let questionTitleInputelement = UxUtils.createInputElement(UxUtils.getString("enterQuestionPlaceholder"), questionCount.toString(), "text");
    //Todo : @parth replace this with actionSdk Question Model
    let ques = new Question(questionId, "SingleOption", 0, true);
    let choices = [];
    let choiceCount = 0;
    let addChoiceButton = UxUtils.getButton(UxUtils.getString("addChoiceButton"), function () {
        choices.push(questionId + "" + choiceCount);
        let choice = addChoice(UxUtils.getString("addChoicePlaceholder"), questionId, questionId + choiceIdPrefix + choiceCount++);
        UxUtils.addElement(choice, choiceDiv);
        singleOptionChoicesMap.set(questionId, choices);
    });

    questionTitleInputelement.setAttribute("dt", "SingleOption");
    singleOptionChoicesMap.set(questionId, choices);
    questionMap.set(questionId, ques);
    questionDiv.setAttribute("id", questionId + "div");

    UxUtils.setClass(questionTitleInputelement, 'addQuestionTitleInputElement');
    UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
    UxUtils.addElement(questionHeading, questionDiv);
    UxUtils.addElement(getQuestionDeletebutton(questionId), questionDiv);
    UxUtils.addElement(questionTitleInputelement, questionDiv);

    if (question != null) {
        /**
        * Render Question with given Prefilled Content
        */
        questionTitleInputelement.value = question["title"];
        question["options"].forEach(option => {
            choices.push(questionId + choiceIdPrefix + choiceCount);
            singleOptionChoicesMap.set(questionId, choices);

            let choice = addChoice(UxUtils.getString("addChoicePlaceholder"), questionId, questionId + choiceIdPrefix + choiceCount++, option.title);
            UxUtils.addElement(choice, choiceDiv);
        });
    }
    else {
        /**
        * Add two default choice with empty content
        */

        /* Choice 1 */
        choices.push(questionId + choiceIdPrefix + choiceCount);
        let choice = addChoice(UxUtils.getString("addChoicePlaceholder"), questionId, questionId + choiceIdPrefix + choiceCount++);
        UxUtils.addElement(choice, choiceDiv);

        /* Choice 2 */
        choices.push(questionId + choiceIdPrefix + choiceCount);
        choice = addChoice(UxUtils.getString("addChoicePlaceholder"), questionId, questionId + choiceIdPrefix + choiceCount++);
        UxUtils.addElement(choice, choiceDiv);
        singleOptionChoicesMap.set(questionId, choices);
    }
    UxUtils.setClass(addChoiceButton, 'addChoiceButton');
    UxUtils.addElement(choiceDiv, questionDiv);
    UxUtils.addElement(addChoiceButton, questionDiv);
    UxUtils.addElement(UxUtils.lineBreak(), questionDiv);
    return questionDiv;
}

/**
  * @desc Create new Number Question with optional question JSON attribute which will create Question with Prefilled Content
  * @param {JSON} questionJson : required for prefilled question content
  * @return Number question component
*/
function addNumberQuestion(question?: JSON) {
    //Todo: @parth try to combine Text , Number and SingleOption part
    let questionDiv = UxUtils.getElement("div");
    let questionHeading = UxUtils.getElement("label");
    let questionTitleInputelement = UxUtils.createInputElement(UxUtils.getString("enterQuestionPlaceholder"), questionCount.toString(), "text"); // Create Input Field for Name
    let questionId = questionCount.toString();
    let ques = new Question(questionId, "Numeric", -1, true);
    let disabledResponse = UxUtils.createInputElement(UxUtils.getString("enterTextPlaceholder"), questionCount.toString(), "text");
    disabledResponse.disabled = true

    questionMap.set(questionId, ques);
    if (question != null) {
        questionTitleInputelement.value = question["title"];
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

/**
  * @desc Create new TEXT Question with optional question JSON attribute which will create Question with Prefilled Content
  * @param {JSON} questionJson : required for prefilled question content
  * @return TEXT question component
*/
function addTextQuestion(question?: JSON) {
    //Todo: @parth try to combine Text , Number and SingleOption part
    let questionDiv = UxUtils.getElement("div");
    let questionHeading = UxUtils.getElement("label");
    let questionTitleInputelement = UxUtils.createInputElement(UxUtils.getString("enterQuestionPlaceholder"), questionCount.toString(), "text"); // Create Input Field for Name
    let questionId = questionCount.toString();
    let ques = new Question(questionId, "Text", -1, true);
    let disabledResponse = UxUtils.createInputElement(UxUtils.getString("enterTextPlaceholder"), questionCount.toString(), "text");
    disabledResponse.disabled = true

    questionMap.set(questionId, ques);

    if (question != null) {
        questionTitleInputelement.value = question["title"];
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

/**
  * @desc Function to trigger the flow for Creating new survey instance,
  *       fetch the action package context from Service which is required to create the new action instance
*/
function submitForm() {
    actionSDK.executeApi(new actionSDK.GetContext.Request())
        .then(function (response: actionSDK.GetContext.Response) {
            console.info("GetContext - Response: " + JSON.stringify(response));
            createAction(response.context.actionPackageId);
        })
        .catch(function (error) {
            console.error("GetContext - Error: " + JSON.stringify(error));
        });
}

/**
  * @desc Function to create new action instance after validation,
  *       in case of validation failure it will prompt Dialog specific to error
  * @param {string} actionPackageId required for prefilled question content
*/
function createAction(actionPackageId: string) {
    let surveyTitle = (<HTMLInputElement>document.getElementById("surveyTitle")).innerText;


    /**
     * Validate for Non Empty Survey title
    */
    if (Utils.isEmptyString(surveyTitle)) {
        UxUtils.showAlertDialog(UxUtils.getString("validationErrorTitle"), UxUtils.getString("emptySurveyTitleError"), UxUtils.getString("ok"), null, null, null);
        return;
    }

    /**
     * Validate Question Set with required inputs and prepare the Question List Array
    */
    let result = getQuestionSet();
    if (!result["isSuccess"]) {
        UxUtils.showAlertDialog(UxUtils.getString("validationErrorTitle"), UxUtils.getString("emptyQuestionTitleError"), UxUtils.getString("ok"), null, null, null);
        return;
    }

    let questionsSet = result["columnArray"];

    /**
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
    let request = new actionSDK.CreateAction.Request(action);

    /**
     * Service Request to create new Action Instance 
    */
    actionSDK.executeApi(request)
        .then(function (response: actionSDK.GetContext.Response) {
            console.info("CreateAction - Response: " + JSON.stringify(response));
        })
        .catch(function (error) {
            console.error("CreateAction - Error: " + JSON.stringify(error));
        });
}

/**
 *  @desc Funtion to Validate Question Set with required inputs and prepare the Question List Array
 *  @return {Object} result with attributes {boolean} isSuccess and {JSON Array} columnArray                   
*/
function getQuestionSet() {
    let columnArray = [];
    let isSuccess = true;

    if (questionMap.size == 0) {
        return { isSuccess: false, columnArray: columnArray };
    }

    questionMap.forEach(ques => {
        let title = (<HTMLInputElement>document.getElementById(ques.id)).value;
        if (Utils.isEmptyString(title)) {
            isSuccess = false;
            return;
        }
        let question: actionSDK.ActionDataColumn = {
            name: ques.id,
            displayName: title,
            valueType: ques.type,
            allowNullValue: false,
            options: []
        }
        if (singleOptionChoicesMap.get(ques.id)) {
            singleOptionChoicesMap.get(ques.id).forEach(choiceId => {
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

/**
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

/**
 * @desc Funtion to Delete Question Component
 * @param {HTMLElement} element
 * @param {string} questionId of the Question which need to get deleted
*/
function deleteQuestion(element: HTMLElement, questionId: string) {
    let parentDiv = document.getElementById((<HTMLElement>element.parentNode).id);
    UxUtils.removeElement(parentDiv);
    questionMap.delete(questionId);
}

/**
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

/**
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

/**
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