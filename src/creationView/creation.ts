import * as ActionSDK from 'actionSDK2';
import questionSet from '../../assets/json/questionSet.json'; 

var keys = Object.keys(questionSet);
console.log(keys);

ActionSDK.APIs.actionViewDidLoad(true /*success*/);

// Fetching HTML Elements in Variables by ID.
var root = document.getElementById("root");
var bodyDiv = document.createElement("div");
var footerDiv = document.createElement("div");
var questionCount = 0;
let questions: string[] = new Array();

createBody();

function fetchQuetionSetForTemplate(val:number){
  
  var templateQuestions = Object.values(questionSet)[val];
  clear();
  document.getElementById("surveyTitle").setAttribute("value",Object.keys(questionSet)[val]);
  templateQuestions.forEach(question => {
    bodyDiv.appendChild(addQuestion(question));
  });
}

function clear(){
  bodyDiv.innerHTML = "";
  questionCount = 0;
}

function createBody() {

  var templateTitle = document.createElement("h3");
  var templateTitleText = document.createTextNode("Choose Check-in Template");
  templateTitle.appendChild(templateTitleText);
  root.appendChild(templateTitle);

  var select = document.createElement("select");

  keys.forEach(element => {
    select.options.add( new Option(element) );
  });
  
  select.addEventListener("change", function () {

    fetchQuetionSetForTemplate(select.selectedIndex);
  });
  root.appendChild(select);


  root.appendChild(createInputElement("Survey title", "surveyTitle"));
  root.appendChild(bodyDiv);
  root.appendChild(footerDiv);

  var linebreak = document.createElement('br');


  var addQuestionButton = document.createElement("BUTTON");   // Create a <button> element
  addQuestionButton.innerHTML = "Add Question";


  var submit = document.createElement("BUTTON");   // Create a <button> element
  submit.innerHTML = "Create Form";
  submit.style.float = "right";

  footerDiv.appendChild(linebreak);
  footerDiv.appendChild(addQuestionButton);
  footerDiv.appendChild(submit);

  addQuestionButton.addEventListener("click", function () {
    bodyDiv.appendChild(addQuestion());
  });


  submit.addEventListener("click", function () {

    submitForm();
  });
}

function createQuestionArray() {

  for (var i = 0; i < questionCount; i++) {
    var val: string = (<HTMLInputElement>document.getElementById(i.toString())).value + "~1~0~SingleOption~" +
      (<HTMLInputElement>document.getElementById(i + "0")).value + "~" + (<HTMLInputElement>document.getElementById(i + "1")).value;

    questions.push(val);
  }
}

function sendActioninstance(surveyTitle: string, questions: string[]) {

  let actionInstance = getActionInstance(surveyTitle, questions);

  ActionSDK.APIs.getCurrentContext()
    .then((context: ActionSDK.ActionContext) => {
      ActionSDK.ActionUtils.prepareActionInstance(actionInstance, context);
      let data = CreateViewData(actionInstance, surveyTitle);
      ActionSDK.APIs.createActionInstance(actionInstance, data);
    });

}

function CreateViewData(actionInstance: ActionSDK.ActionInstance, title: string) {

  let surveyData = {
    ti: title,
    et: ActionSDK.Utils.getDefaultExpiry(7).getTime(),
    ia: actionInstance.isAnonymous ? 1 : 0,
    cl: questions,
    ns: `${actionInstance.notificationSettings[0].mode}~${actionInstance.notificationSettings[0].time}`,
    rv: 1,
    mr: 0
  };
  return surveyData;
}


function getActionInstance(title: string, questions: string[]) {


  let columnArray: ActionSDK.ActionInstanceColumn[] = [];

  for (var i = 0; i < questionCount; i++) {
    var val = (<HTMLInputElement>document.getElementById(i.toString())).value;// +"~1~0~SingleOption~"+
    var choice1 = (<HTMLInputElement>document.getElementById(i + "0")).value;
    var choice2 = (<HTMLInputElement>document.getElementById(i + "1")).value;

    let col: ActionSDK.ActionInstanceColumn = {
      id: i.toString(),
      type: ActionSDK.ActionInstanceColumnType.SingleOption,
      title: val,
      isOptional: false,
      options: []

    }

    col.isInvisible = false;
    col.isExcludedFromReporting = true;



    let op1: ActionSDK.ActionInstanceColumnOption = {
      id: i + "0",
      title: choice1

    }
    let op2: ActionSDK.ActionInstanceColumnOption = {
      id: i + "1",
      title: choice1

    }

    col.options.push(op1);
    col.options.push(op2);
    columnArray.push(col);
  }

  let actionInstance: ActionSDK.ActionInstance = {
    title: title,
    expiry: ActionSDK.Utils.getDefaultExpiry(7).getTime(),
    columns: columnArray,
    properties: []
  };

  actionInstance.rowsVisibility = ActionSDK.Visibility.All;

  actionInstance.notificationSettings = [];
  var notificationSettingsMode: ActionSDK.NotificationSettingMode;
  notificationSettingsMode = ActionSDK.NotificationSettingMode.None;

  actionInstance.notificationSettings.push({
    mode: notificationSettingsMode,
    time: 330
  });

  actionInstance.canUserAddMultipleRows = false;

  actionInstance.isAnonymous = false;

  return actionInstance;
}

function submitForm() {
  var surveyTitle = (<HTMLInputElement>document.getElementById("surveyTitle")).value;
  createQuestionArray();
  sendActioninstance(surveyTitle, questions);
}


function createInputElement(ph: string, id: string) {
  var inputelement = document.createElement('input'); // Create Input Field for Name
  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("id", id);
  inputelement.placeholder = ph;
  return inputelement;
}



function addQuestion(question?:JSON) {


  var qDiv = document.createElement("div");
  var linebreak = document.createElement('br');
  var questionHeading = document.createElement('h7'); // Heading of Form
  var inputelement = document.createElement('input'); // Create Input Field for Name
  var choiceCount = 0;

  questionHeading.innerHTML = "Question " + questionCount;
  

  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", "");
  inputelement.setAttribute("id", questionCount.toString());
  inputelement.placeholder = "Enter Question";
  var linebreak = document.createElement('br');
  
  qDiv.appendChild(linebreak);
  qDiv.appendChild(questionHeading);
  qDiv.appendChild(inputelement);

  if(question != null){
    inputelement.value = question["title"];

    question["options"].forEach(option => {
      qDiv.appendChild(addChoice("choice 1", questionCount + "" + choiceCount++,option.title));
    });
  }
  else{
    qDiv.appendChild(addChoice("choice 1", questionCount + "" + choiceCount++));
    qDiv.appendChild(addChoice("choice 2", questionCount + "" + choiceCount++));
  }
  
  qDiv.appendChild(linebreak);

  questionCount++;
  return qDiv;
}


function addChoice(ph: string, id: string,val:string="") {
  var inputelement = document.createElement('input'); // Create Input Field for Name
  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", val);
  inputelement.setAttribute("id", id);
  inputelement.placeholder = ph;
  return inputelement;
}