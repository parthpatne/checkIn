import questionTemplate from '../../assets/json/questionSet.json';
import { Question } from './Question';
import * as actionSDK from 'action-sdk-sunny';

var keys = Object.keys(questionTemplate);
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
    document.getElementById("surveyTitle").setAttribute("value", Object.keys(questionTemplate)[val]);

    //For None Template Selected make survey title empty
    if (val == 0) {
        document.getElementById("surveyTitle").setAttribute("value", "");
    }

    //Load all template Questions
    templateQuestions.forEach(question => {
        addQuestion("1", question);
    });
}

function getQuestionSet() {
    let columnArray = [];
    questionMap.forEach(ques => {

        var title = (<HTMLInputElement>document.getElementById(ques.id)).value;
        let val = {
            id: ques.id,
            title: title,
            type: ques.type,
            allowNullValue: false,
            options: []
        }

        if (mcqChoicesMap.get(ques.id)) {
            mcqChoicesMap.get(ques.id).forEach(choiceId => {
                let option = {

                    id: choiceId,
                    title: (<HTMLInputElement>document.getElementById(choiceId)).value
                }
                val.options.push(option);
            });
        }
        columnArray.push(val);
    });

    return columnArray;
}

function createAction(actionPackageId) {

    var questionsSet = getQuestionSet();
    var action = {
        id: generateGUID(),
        actionPackageId: actionPackageId,
        version: 1,
        title: (<HTMLInputElement>document.getElementById("surveyTitle")).value,
        expiryTime: new Date().getTime() + (7 * 24 * 60 * 60 * 1000),
        properties: [],
        dataSets: [
            {
                id: "TestDataSet",
                itemsVisibility: actionSDK.Visibility.All,
                itemsEditable: false,
                canUserAddMultipleItems: true,
                dataFields: questionsSet
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

//need to create util file for this
function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
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
    var surveytitle = createInputElement("Survey title", "surveyTitle");
    var linebreak = document.createElement('br');
    var questionTypeList = document.createElement("select");
    var addQuestionButton = document.createElement("BUTTON");   // Create a <button> element
    var submit = document.createElement("BUTTON");   // Create a <button> element

    selectTemplate.className = 'selectTemplateDropDown';
    keys.forEach(element => {
        selectTemplate.options.add(new Option(element));
    });

    selectTemplate.addEventListener("change", function () {
        if (confirm("All your changes will be lost when template is changed. Are you sure you want to change the template?")) {
            fetchQuetionSetForTemplate(selectTemplate.selectedIndex);
            currentSelectedTemplate = selectTemplate.selectedIndex;
        }
        else {
            selectTemplate.selectedIndex = currentSelectedTemplate;
        }
    });

    surveytitle.className = 'surveyTitle';

    questionTypeList.options.add(new Option("MCQ", "1"));
    questionTypeList.options.add(new Option("TEXT", "2"));
    questionTypeList.options.add(new Option("NUMBER", "3"));
    questionTypeList.selectedIndex = -1;
    questionTypeList.className = 'questionTypeList';
    addQuestionButton.innerHTML = "Add Question";
    addQuestionButton.className = 'addQuestionButton';
    submit.innerHTML = "Create Form";
    submit.setAttribute("id", "submitForm");
    submit.className = 'submitButton';

    root.appendChild(selectTemplate);
    root.appendChild(surveytitle);
    root.appendChild(bodyDiv);
    root.appendChild(footerDiv);
    footerDiv.appendChild(linebreak);
    footerDiv.appendChild(addQuestionButton);
    footerDiv.appendChild(questionTypeList);
    footerDiv.appendChild(submit);

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

function createInputElement(ph: string, id: string) {
    var inputelement = document.createElement('input'); // Create Input Field for Name
    inputelement.setAttribute("type", "text");
    inputelement.setAttribute("id", id);
    inputelement.placeholder = ph;
    return inputelement;
}

function deleteQuestion(img, qId) {
    var elem = document.getElementById(img.parentNode.id);
    elem.parentNode.removeChild(elem);
    questionMap.delete(qId);
}

function addQuestionTitleInputElement(type: string) {
    var inputelement = document.createElement('input'); // Create Input Field for Name
    inputelement.setAttribute("type", type);
    inputelement.setAttribute("value", "");
    inputelement.setAttribute("id", questionCount.toString());
    inputelement.className = 'addQuestionTitleInputElement';
    inputelement.placeholder = "Enter Question";

    return inputelement;
}

function getQuestionDeletebutton(qId: String) {

    var deleteQuestionButton = document.createElement('img');
    deleteQuestionButton.setAttribute('src', '../images/delete.svg');
    deleteQuestionButton.style.height = "20px";
    deleteQuestionButton.style.float = "right";
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
    var inputelement = addQuestionTitleInputElement("text"); // Create Input Field for Name
    var choices = [];
    var ques = new Question(qId, "SingleOption", 0, true);
    var addChoiceButton = document.createElement("BUTTON");   // Create a <button> element

    inputelement.setAttribute("dt", "SingleOption");
    mcqChoicesMap.set(qId, choices);
    questionMap.set(qId, ques);
    qDiv.setAttribute("id", qId + "div");
    qDiv.appendChild(lineBreak());
    qDiv.appendChild(questionHeading);
    qDiv.appendChild(getQuestionDeletebutton(qId));
    qDiv.appendChild(inputelement);

    if (question != null) {
        inputelement.value = question["title"];

        question["options"].forEach(option => {
            choices.push(qId + "c" + choiceCount);
            mcqChoicesMap.set(qId, choices);

            var choice = addChoice("Add Choice", qId + "c" + choiceCount++, option.title);
            cDiv.appendChild(choice);

        });
    }
    else {
        choices.push(qId + "c" + choiceCount);
        var choice = addChoice("Add Choice", qId + "c" + choiceCount++);
        cDiv.appendChild(choice);

        choices.push(qId + "c" + choiceCount);
        choice = addChoice("Add Choice", qId + "c" + choiceCount++);
        cDiv.appendChild(choice);

        mcqChoicesMap.set(qId, choices);
    }

    addChoiceButton.innerHTML = "+ Add Choice";
    addChoiceButton.className = 'addChoiceButton';

    addChoiceButton.addEventListener("click", function () {

        choices.push(qId + "" + choiceCount);
        var choice = addChoice("Add Choice", qId + "" + choiceCount++);
        cDiv.appendChild(choice);
        mcqChoicesMap.set(qId, choices);
    });

    qDiv.appendChild(cDiv);
    qDiv.appendChild(addChoiceButton);
    qDiv.appendChild(lineBreak());

    return qDiv;
}

function addNumberQuestion(question?: JSON) {
    var qDiv = document.createElement("div");
    var questionHeading = document.createElement('label'); // Heading of Form
    var inputelement = addQuestionTitleInputElement("text"); // Create Input Field for Name
    var qId = questionCount.toString();
    var ques = new Question(qId, "Numeric", -1, true);

    questionMap.set(qId, ques);

    if (question != null) {
        inputelement.value = question["title"];
    }

    qDiv.setAttribute("id", questionCount + "div");
    qDiv.appendChild(lineBreak());
    qDiv.appendChild(questionHeading);
    qDiv.appendChild(getQuestionDeletebutton(qId));
    qDiv.appendChild(inputelement);
    qDiv.appendChild(addInputElement("Enter Number", questionCount + "0", "", true));
    qDiv.appendChild(lineBreak());

    questionCount++;
    return qDiv;
}

function addTextQuestion(question?: JSON) {
    var qDiv = document.createElement("div");
    var questionHeading = document.createElement('label'); // Heading of Form
    var inputelement = addQuestionTitleInputElement("text"); // Create Input Field for Name
    var qId = questionCount.toString();
    var ques = new Question(qId, "Text", -1, true);

    questionMap.set(qId, ques);

    if (question != null) {
        inputelement.value = question["title"];
    }

    qDiv.setAttribute("id", questionCount + "div");
    qDiv.appendChild(questionHeading);
    qDiv.appendChild(getQuestionDeletebutton(qId));
    qDiv.appendChild(inputelement);
    qDiv.appendChild(addInputElement("Enter Text", questionCount + "0", "", true));
    qDiv.appendChild(lineBreak());

    questionCount++;
    return qDiv;
}

function lineBreak() {
    return document.createElement('br');
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
    newQues.className = 'baseQuestion';
    questionCount++;
    bodyDiv.appendChild(newQues);
    window.scrollTo(0, document.body.scrollHeight);

    return newQues;
}

function addInputElement(ph: string, id: string, val: string = "", disableInput: boolean = false) {
    var inputelement = document.createElement('input');

    inputelement.setAttribute("type", "text");
    inputelement.setAttribute("value", val);
    inputelement.setAttribute("id", id);
    inputelement.placeholder = ph;
    inputelement.className = 'inputElement';
    if (disableInput) {
        inputelement.setAttribute("disabled", "disabled");
    }

    return inputelement;
}

function addChoice(ph: string, id: string, val: string = "", disableInput: boolean = false) {
    var li = document.createElement('li');
    var inputelement = document.createElement('input');

    inputelement.setAttribute("type", "text");
    inputelement.setAttribute("value", val);
    inputelement.setAttribute("id", id);
    inputelement.placeholder = ph;
    inputelement.className = 'addChoiceInput';

    if (disableInput) {
        inputelement.setAttribute("disabled", "disabled");
    }
    li.appendChild(inputelement);
    return li;
}
