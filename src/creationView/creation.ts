import * as actionSDK from 'action-sdk-sunny';
import questionTemplate from './questionSet.json';
import { Utils } from "../common/Utils";
import { UxUtils } from '../common/UxUtils';
import { Question } from './Question';

var questionTemplateKeys = Object.keys(questionTemplate);
var questionMap = new Map();
var mcqChoicesMap = new Map();
var root = document.getElementById("root");
var bodyDiv = document.createElement("div");
var footerDiv = document.createElement("div");
var questionCount = 0;
let currentSelectedTemplate = 0;

OnPageLoad();

function clear() {
    bodyDiv.innerHTML = "";
    questionCount = 0;
}

function fetchQuetionSetForTemplate(val: number) {
    var templateQuestions = Object.values(questionTemplate)[val];

    //Clear Current template
    clear();

    //Set Survey Title to template Title
    (<HTMLInputElement>document.getElementById("surveyTitle")).innerText = Object.keys(questionTemplate)[val];

    //For None Template Selected make survey title empty
    if (val == 0) {
        (<HTMLInputElement>document.getElementById("surveyTitle")).innerText = "";
    }

    //Load all template Questions
    templateQuestions.forEach(question => {
        addQuestion("1", question);
    });
}

function getQuestionSet() {
    let columnArray = [];
    var isSuccess = true;
    questionMap.forEach(ques => {

        var title = (<HTMLInputElement>document.getElementById(ques.id)).value;
        let val = {
            name: ques.id,
            displayName: title,
            valueType: ques.type,
            allowNullValue: false,
            options: []
        }

        if (mcqChoicesMap.get(ques.id)) {
            mcqChoicesMap.get(ques.id).forEach(choiceId => {
                var optionDisplayName = (<HTMLInputElement>document.getElementById(choiceId + "ip")).value;
                if (Utils.isEmptyString(optionDisplayName)) {
                    isSuccess = false;
                    // break;
                }
                let option = {
                    name: choiceId,
                    displayName: optionDisplayName
                }
                val.options.push(option);
            });
        }
        columnArray.push(val);
    });

    return { isSuccess: isSuccess, columnArray: columnArray };
}

function createAction(actionPackageId) {
    var surveyTitle = (<HTMLInputElement>document.getElementById("surveyTitle")).innerText;
    if (Utils.isEmptyString(surveyTitle)) {
        UxUtils.showAlertDailog("Validation Failed", "Survey title cannnot be Empty", "OK", null, null, null);
        return;
    }

    var result = getQuestionSet();
    if (!result["isSuccess"]) {
        UxUtils.showAlertDailog("Validation Failed", "Question title cannnot be Empty", "OK", null, null, null);
        return;
    }

    var questionsSet = result["columnArray"];
    var action = {
        id: Utils.generateGUID(),
        actionPackageId: actionPackageId,
        version: 1,
        displayName: (<HTMLInputElement>document.getElementById("surveyTitle")).innerText,
        expiryTime: new Date().getTime() + (7 * 24 * 60 * 60 * 1000),
        properties: [],
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
    var request = new actionSDK.CreateAction.Request(action);
    actionSDK.executeApi(request)
        .then(function (response: actionSDK.GetContext.Response) {
            console.info("CreateAction - Response: " + JSON.stringify(response));
        })
        .catch(function (error) {
            console.error("CreateAction - Error: " + JSON.stringify(error));
        });
}

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


function OnPageLoad() {
    var selectTemplate = document.createElement("select");
    var surveytitle = UxUtils.getContentEditableSpan("", UxUtils.getString("surveyTitlePlaceholder"), {}, null);
    surveytitle.setAttribute("id", "surveyTitle");
    var questionTypeList = document.createElement("select");
    var addQuestionButton = document.createElement("BUTTON");   // Create a <button> element
    var submit = document.createElement("BUTTON");   // Create a <button> element

    UxUtils.setClass(selectTemplate, 'selectTemplateDropDown');
    // selectTemplate.className = 'selectTemplateDropDown';
    questionTemplateKeys.forEach(element => {
        selectTemplate.options.add(new Option(element));
    });

    selectTemplate.addEventListener("change", function () {

        if (questionCount == 0 && Utils.isEmptyString(surveytitle.innerText)) {
            fetchQuetionSetForTemplate(selectTemplate.selectedIndex);
            currentSelectedTemplate = selectTemplate.selectedIndex;
        }
        else {
            UxUtils.showAlertDailog("Template Change", "All your changes will be lost when template is changed. Are you sure you want to change the template?",
                "OK", () => {
                    fetchQuetionSetForTemplate(selectTemplate.selectedIndex);
                    currentSelectedTemplate = selectTemplate.selectedIndex;
                },
                "Cancel", () => {
                    selectTemplate.selectedIndex = currentSelectedTemplate;
                });
        }
    });

    UxUtils.setClass(surveytitle, 'surveyTitle');

    questionTypeList.options.add(new Option("MCQ", "1"));
    questionTypeList.options.add(new Option("TEXT", "2"));
    questionTypeList.options.add(new Option("NUMBER", "3"));
    questionTypeList.selectedIndex = -1;
    addQuestionButton.innerHTML = "Add Question";
    submit.innerHTML = "Create Form";
    submit.setAttribute("id", "submitForm");

    UxUtils.setClass(questionTypeList, 'questionTypeList');
    UxUtils.setClass(addQuestionButton, 'addQuestionButton');
    UxUtils.setClass(submit, 'submitButton');
    UxUtils.setClass(footerDiv, 'creationFooterDiv');

    UxUtils.addElement(selectTemplate, root);
    UxUtils.addElement(surveytitle, root);
    UxUtils.addElement(bodyDiv, root);
    UxUtils.addElement(footerDiv, root);
    UxUtils.addElement(UxUtils.lineBreak(), footerDiv);
    UxUtils.addElement(addQuestionButton, footerDiv);
    UxUtils.addElement(questionTypeList, footerDiv);
    UxUtils.addElement(submit, footerDiv);

    addQuestionButton.addEventListener("click", function () {
        addQuestion("1");
    });

    questionTypeList.addEventListener("change", function () {
        addQuestion(questionTypeList.value);
        questionTypeList.selectedIndex = -1;
    });

    submit.addEventListener("click", function () {
        submitForm();
    });
}


// *********************************************** HTML ELEMENT***********************************************

function deleteQuestion(elem, qId) {
    var parentDiv = document.getElementById(elem.parentNode.id);
    UxUtils.removeElement(parentDiv);
    questionMap.delete(qId);
}

function getQuestionDeletebutton(qId: String) {
    var deleteQuestionButton = document.createElement('img');
    deleteQuestionButton.setAttribute('src', 'images/delete.svg');
    UxUtils.setClass(deleteQuestionButton, 'deleteQuestionButton');
    deleteQuestionButton.addEventListener("click", function () {
        deleteQuestion(this, qId);
    });
    return deleteQuestionButton;
}

function addMcqQuestion(question?: JSON) {
    var qDiv = document.createElement("div");
    var cDiv = document.createElement("ul");
    var qId = questionCount.toString();
    var questionHeading = document.createElement('label'); // Heading of Form
    var choiceCount = 0;
    var inputelement = UxUtils.createInputElement("Enter Question", questionCount.toString(), "text"); // Create Input Field for Name
    var choices = [];
    var ques = new Question(qId, "SingleOption", 0, true);
    var addChoiceButton = document.createElement("BUTTON");   // Create a <button> element

    inputelement.setAttribute("dt", "SingleOption");
    mcqChoicesMap.set(qId, choices);
    questionMap.set(qId, ques);
    qDiv.setAttribute("id", qId + "div");

    UxUtils.setClass(inputelement, 'addQuestionTitleInputElement');
    UxUtils.addElement(UxUtils.lineBreak(), qDiv);
    UxUtils.addElement(questionHeading, qDiv);
    UxUtils.addElement(getQuestionDeletebutton(qId), qDiv);
    UxUtils.addElement(inputelement, qDiv);

    if (question != null) {
        inputelement.value = question["title"];

        question["options"].forEach(option => {
            choices.push(qId + "c" + choiceCount);
            mcqChoicesMap.set(qId, choices);

            var choice = addChoice("Add Choice", qId, qId + "c" + choiceCount++, option.title);
            UxUtils.addElement(choice, cDiv);
        });
    }
    else {
        choices.push(qId + "c" + choiceCount);
        var choice = addChoice("Add Choice", qId, qId + "c" + choiceCount++);
        UxUtils.addElement(choice, cDiv);

        choices.push(qId + "c" + choiceCount);
        choice = addChoice("Add Choice", qId, qId + "c" + choiceCount++);
        UxUtils.addElement(choice, cDiv);

        mcqChoicesMap.set(qId, choices);
    }

    addChoiceButton.innerHTML = "+ Add Choice";
    UxUtils.setClass(addChoiceButton, 'addChoiceButton');

    addChoiceButton.addEventListener("click", function () {

        choices.push(qId + "" + choiceCount);
        var choice = addChoice("Add Choice", qId, qId + "" + choiceCount++);
        UxUtils.addElement(choice, cDiv);
        mcqChoicesMap.set(qId, choices);
    });

    UxUtils.addElement(cDiv, qDiv);
    UxUtils.addElement(addChoiceButton, qDiv);
    UxUtils.addElement(UxUtils.lineBreak(), qDiv);

    return qDiv;
}

function addNumberQuestion(question?: JSON) {
    var qDiv = document.createElement("div");
    var questionHeading = document.createElement('label'); // Heading of Form
    var inputelement = UxUtils.createInputElement("Enter Question", questionCount.toString(), "text"); // Create Input Field for Name
    var qId = questionCount.toString();
    var ques = new Question(qId, "Numeric", -1, true);

    questionMap.set(qId, ques);

    if (question != null) {
        inputelement.value = question["title"];
    }

    qDiv.setAttribute("id", questionCount + "div");

    UxUtils.setClass(inputelement, 'addQuestionTitleInputElement');
    UxUtils.addElement(UxUtils.lineBreak(), qDiv);
    UxUtils.addElement(questionHeading, qDiv);
    UxUtils.addElement(getQuestionDeletebutton(qId), qDiv);
    UxUtils.addElement(inputelement, qDiv);
    UxUtils.addElement(addInputElement("Enter Number", questionCount + "0", "", true), qDiv);
    UxUtils.addElement(UxUtils.lineBreak(), qDiv);
    questionCount++;
    return qDiv;
}

function addTextQuestion(question?: JSON) {
    var qDiv = document.createElement("div");
    var questionHeading = document.createElement('label'); // Heading of Form
    var inputelement = UxUtils.createInputElement("Enter Question", questionCount.toString(), "text"); // Create Input Field for Name
    var qId = questionCount.toString();
    var ques = new Question(qId, "Text", -1, true);

    questionMap.set(qId, ques);

    if (question != null) {
        inputelement.value = question["title"];
    }

    qDiv.setAttribute("id", questionCount + "div");

    UxUtils.setClass(inputelement, 'addQuestionTitleInputElement');
    UxUtils.addElement(questionHeading, qDiv);
    UxUtils.addElement(getQuestionDeletebutton(qId), qDiv);
    UxUtils.addElement(inputelement, qDiv);
    UxUtils.addElement(addInputElement("Enter Text", questionCount + "0", "", true), qDiv);
    UxUtils.addElement(UxUtils.lineBreak(), qDiv);

    questionCount++;
    return qDiv;
}

function addQuestion(type: string, question?: JSON) {
    var newQues;

    if (type == "1") {
        newQues = addMcqQuestion(question);
    }
    if (type == "2") {
        newQues = addTextQuestion(question);
    }
    if (type == "3") {
        newQues = addNumberQuestion(question);
    }
    UxUtils.setClass(newQues, 'baseQuestion');

    questionCount++;
    UxUtils.addElement(newQues, bodyDiv);
    window.scrollTo(0, document.documentElement.scrollHeight);

    return newQues;
}

function addInputElement(ph: string, id: string, val: string = "", disableInput: boolean = false) {
    var inputelement = document.createElement('input');

    inputelement.setAttribute("type", "text");
    inputelement.setAttribute("value", val);
    inputelement.setAttribute("id", id);
    inputelement.placeholder = ph;
    UxUtils.setClass(inputelement, 'inputElement');
    if (disableInput) {
        inputelement.setAttribute("disabled", "disabled");
    }

    return inputelement;
}

function addChoice(ph: string, questionId: string, choiceId: string, val: string = "", disableInput: boolean = false) {
    var li = document.createElement('li');
    UxUtils.setId(li, choiceId);

    var inputelement = document.createElement('input');
    inputelement.setAttribute("type", "text");
    inputelement.setAttribute("value", val);
    inputelement.placeholder = ph;
    UxUtils.setClass(inputelement, 'addChoiceInput');
    UxUtils.setId(inputelement, choiceId + "ip");

    if (disableInput) {
        inputelement.setAttribute("disabled", "disabled");
    }

    var deleteButton = getChoiceDeletebutton(questionId, choiceId);
    var inputAndDelete = UxUtils.getHorizontalDiv([inputelement, deleteButton]);

    UxUtils.addElement(inputAndDelete, li);
    return li;
}

function getChoiceDeletebutton(questionId: string, choiceId: string) {
    var deleteChoiceButton = document.createElement('img');
    deleteChoiceButton.setAttribute('src', 'images/deleteChoice.png');
    UxUtils.setClass(deleteChoiceButton, 'deleteChoiceButton');
    deleteChoiceButton.addEventListener("click", function () {
        deleteChoice(questionId, choiceId);
    });
    return deleteChoiceButton;
}

function deleteChoice(questionId, choiceId) {
    if (mcqChoicesMap.get(questionId).length == 2) {
        UxUtils.showAlertDailog("Choice Delete Error", "At least two choices is mandatory", "OK", null, null, null);
        return;
    }
    var choiceElement = document.getElementById(choiceId);
    choiceElement.parentNode.removeChild(choiceElement);
    var choiceIds = mcqChoicesMap.get(questionId) as string[];
    var choiceIndex = choiceIds.indexOf(choiceId);
    if (choiceIndex >= 0) {
        delete choiceIds[choiceIndex];
    }
}