import * as ActionSDK from 'actionSDK2';
import questionTemplate from '../../output/json/questionSet.json'; 
import { Question } from './Question';
// 1) Code CleanUp
// 2) Add Run end to end:


var keys = Object.keys(questionTemplate);
var questionMap = new Map();
var mcqChoicesMap = new Map();
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
  
  var templateQuestions = Object.values(questionTemplate)[val];
  clear();
  document.getElementById("surveyTitle").setAttribute("value",Object.keys(questionTemplate)[val]);
  templateQuestions.forEach(question => {
    bodyDiv.appendChild(lineBreak());
    bodyDiv.appendChild(addQuestion("3",question));
    questionCount++;
  });
}

function clear(){
  bodyDiv.innerHTML = "";
  questionCount = 0;
}

function createBody() {

  var select = document.createElement("select");
  select.style.border = "none";
  select.style.background = "#DCDCDC";
  select.style.padding = "5px";
  select.style.borderRadius = "5px";

  keys.forEach(element => {
    select.options.add( new Option(element) );
  });
  
  select.addEventListener("change", function () {

    fetchQuetionSetForTemplate(select.selectedIndex);
  });
  root.appendChild(select);

  var surveytitle = createInputElement("Survey title", "surveyTitle");
  surveytitle.style.border = "none";
  surveytitle.style.background = "#DCDCDC";
  surveytitle.style.fontWeight = "bold";
  surveytitle.style.borderRadius = "5px";


  root.appendChild(surveytitle);
  root.appendChild(bodyDiv);
  root.appendChild(footerDiv);

  var linebreak = document.createElement('br');


  //var addQuestionButton = document.createElement("BUTTON");   // Create a <button> element
  //addQuestionButton.innerHTML = "Add Question";

  var questionTypeList = document.createElement("select");

  questionTypeList.options.add( new Option("MCQ","1") );
  questionTypeList.options.add( new Option("TEXT","2") );
  questionTypeList.options.add( new Option("NUMBER","3") );

  // questionTypeList.style.width="18px";
  questionTypeList.style.height="21px";
  
  var addQuestionButton = document.createElement("BUTTON");   // Create a <button> element
  addQuestionButton.innerHTML = "Add Question";
  addQuestionButton.style.float = "left"; 

   

  var submit = document.createElement("BUTTON");   // Create a <button> element
  submit.innerHTML = "Create Form";
  submit.style.float = "right";

  footerDiv.appendChild(linebreak);
  footerDiv.appendChild(addQuestionButton);
  footerDiv.appendChild(questionTypeList);
  footerDiv.appendChild(submit);

  addQuestionButton.addEventListener("click", function () {
    var linebreak = document.createElement('br');
    bodyDiv.appendChild(linebreak);
    bodyDiv.appendChild(addQuestion(questionTypeList.value));
  });


  submit.addEventListener("click", function () {

    submitForm();
  });
}

function submitForm() {
  var surveyTitle = (<HTMLInputElement>document.getElementById("surveyTitle")).value;
  createQuestionArray();
  sendActioninstance(surveyTitle, questions);
}

function createQuestionArray() {
//parth: need to update this for text and Number and Multi Options

  questionMap.forEach(question => {

    var val : string = (<HTMLInputElement>document.getElementById(question.id)).value+"~";
    question.isOptional?val+"1":val+"0";
    val = val +"~"+question.dt+question.type;
    
    if( mcqChoicesMap.get(question.id)){
      mcqChoicesMap.get(question.id).forEach(choiceId => {
        val = val+"~"+(<HTMLInputElement>document.getElementById(choiceId)).value
      });
    }

    questions.push(val);
  });

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

function getActionInstance(title: string, questions: string[]) {

  let columnArray: ActionSDK.ActionInstanceColumn[] = [];

  questionMap.forEach(ques => {
  
    var title = (<HTMLInputElement>document.getElementById(ques.id)).value;
   
    let col: ActionSDK.ActionInstanceColumn = {
      id: ques.id,
      type: ques.type,
      title: title,
      isOptional: ques.isOptional,
      options: []
    }

    col.isInvisible = false;
    col.isExcludedFromReporting = true;


    // mcqChoicesMap.get(ques.id).forEach(choiceId => {
    //   let option: ActionSDK.ActionInstanceColumnOption = {
    //     id: choiceId,
    //     title: (<HTMLInputElement>document.getElementById(choiceId)).value
    //   }
    //   col.options.push(option);
    // });

    if( mcqChoicesMap.get(ques.id)){
      mcqChoicesMap.get(ques.id).forEach(choiceId => {
        let option: ActionSDK.ActionInstanceColumnOption = {
          id: choiceId,
          title: (<HTMLInputElement>document.getElementById(choiceId)).value
        }
        col.options.push(option);
      });
    }

    columnArray.push(col);
  });

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

function createInputElement(ph: string, id: string) {
  var inputelement = document.createElement('input'); // Create Input Field for Name
  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("id", id);
  inputelement.placeholder = ph;
  return inputelement;
}

function deleteQuestion(img){
  console.log(img.parentNode.id);
}

function addMcqQuestion(question?:JSON) {
  var qDiv = document.createElement("div");
  var cDiv = document.createElement("ul");
  var questionHeading = document.createElement('label'); // Heading of Form
  var inputelement = document.createElement('input'); // Create Input Field for Name
  var img = document.createElement('img');
  var qId = questionCount.toString();
  var choices = [];
  mcqChoicesMap.set(qId,choices);
  var ques = new Question(qId,"SingleOption",0,true); 
   questionMap.set(qId,ques);

  questionHeading.innerHTML = (questionCount+1)+".";


  img.setAttribute('src','../../output/images/delete.svg');
  img.addEventListener("click",function(){
        deleteQuestion(this);
  });
  
  var choiceCount = 0;

  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", "");
  inputelement.setAttribute("dt", "SingleOption");
  inputelement.setAttribute("id", qId);

  inputelement.placeholder = "Enter Question";
  inputelement.style.width = "93%";
  inputelement.style.margin = "0 0 0 1%";
  inputelement.style.borderRadius = "3px";
  inputelement.style.border = "none";
  inputelement.style.fontWeight = "bold";

  var linebreak = document.createElement('br');
  
  qDiv.setAttribute("id",qId+"div");
  qDiv.appendChild(linebreak);
  qDiv.appendChild(questionHeading);
  // qDiv.appendChild(img);
  qDiv.appendChild(inputelement);

  if(question != null){
    inputelement.value = question["title"];

    question["options"].forEach(option => {
      choices.push(qId + "" + choiceCount);
      mcqChoicesMap.set(qId,choices);

      var choice = addChoice("Add Choice", qId + "" + choiceCount++,option.title);
      cDiv.appendChild(choice);

    });
  }
  else{
    choices.push(qId + "" + choiceCount);
    var choice = addChoice("Add Choice", qId + "" + choiceCount++);
    cDiv.appendChild(choice);

    choices.push(qId + "" + choiceCount);
    choice = addChoice("Add Choice", qId + "" + choiceCount++);
    cDiv.appendChild(choice);

    mcqChoicesMap.set(qId,choices);
  }
  

  var addChoiceButton = document.createElement("BUTTON");   // Create a <button> element
  addChoiceButton.innerHTML = "Add Choice";
  addChoiceButton.style.marginLeft = "25px"
  addChoiceButton.style.float = "left"; 

  addChoiceButton.addEventListener("click", function () {

    choices.push(qId + "" + choiceCount);
    var choice = addChoice("Add Choice", qId + "" + choiceCount++);
    cDiv.appendChild(choice);
    mcqChoicesMap.set(qId,choices);
  });

  qDiv.appendChild(cDiv);
  qDiv.appendChild(addChoiceButton);
  qDiv.appendChild(linebreak);

  questionCount++;
  return qDiv;
}

function addNumberQuestion(question?:JSON) {
  var qDiv = document.createElement("div");
  var linebreak = document.createElement('br');
  var questionHeading = document.createElement('label'); // Heading of Form
  var inputelement = document.createElement('input'); // Create Input Field for Name
  var img = document.createElement('img');
  var qId = questionCount.toString();
  var ques = new Question(qId,"Numeric",-1,true); 
   questionMap.set(qId,ques);

  questionHeading.innerHTML = (questionCount+1) +". ";

  if(question != null){
    inputelement.value = question["title"];
  }
  img.setAttribute('src','../../output/images/delete.svg');
  img.addEventListener("click",function(){
        deleteQuestion(this);
  });
  

  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", "");
  inputelement.setAttribute("id", questionCount.toString());
  inputelement.placeholder = "Enter Question";

  inputelement.style.width = "95%";
  inputelement.style.margin = "0 0 0 1%";
  inputelement.style.border = "none";
  inputelement.style.borderRadius = "3px";
  inputelement.style.fontWeight = "bold";

  var linebreak = document.createElement('br');
  
  qDiv.setAttribute("id",questionCount+"div");
  qDiv.appendChild(linebreak);
  qDiv.appendChild(questionHeading);
  // qDiv.appendChild(img);
  qDiv.appendChild(inputelement);

  qDiv.appendChild(addInputElement("Enter Number", questionCount+"0","",true));

  qDiv.appendChild(linebreak);

  questionCount++;
  return qDiv;
}

function addTextQuestion(question?:JSON) {
  var qDiv = document.createElement("div");
  var questionHeading = document.createElement('label'); // Heading of Form
  var inputelement = document.createElement('input'); // Create Input Field for Name
  var qId = questionCount.toString();
  var ques = new Question(qId,"Text",-1,true); 
   questionMap.set(qId,ques);

  questionHeading.innerHTML = (questionCount+1)+".  ";
   if(question != null){
    inputelement.value = question["title"];
  }

  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", "");
  inputelement.setAttribute("id", questionCount.toString());
  inputelement.style.width = "95%";
  inputelement.style.margin = "0 0 0 1%";
  inputelement.style.border = "none";
  inputelement.style.borderRadius = "3px";
  inputelement.style.fontWeight = "bold";
  
  inputelement.placeholder = "Enter Question";
  
  
  qDiv.setAttribute("id",questionCount+"div");
  qDiv.appendChild(questionHeading);
  qDiv.appendChild(inputelement);
  qDiv.appendChild(addInputElement("Enter Text", questionCount+"0","",true));  
  qDiv.appendChild(lineBreak());

  questionCount++;
  return qDiv;
}

function lineBreak(){
  return document.createElement('br');
}

function addQuestion(type:string,question?:JSON) {

  var newQues;
  if(type == "1"){ 
    newQues = addMcqQuestion(question);
  }
  if(type == "2"){
    newQues = addTextQuestion(question);
  }
  if(type == "3"){
    newQues = addNumberQuestion(question);
  }
  newQues.style.background = "#DCDCDC";
  newQues.style.borderRadius = "5px";
  newQues.style.padding = "10px";
  newQues.style.width = "100%"
  newQues.style.border = "none";

  return newQues;
}


function addInputElement(ph: string, id: string,val:string="",disableInput:boolean=false) {
  var inputelement = document.createElement('input'); 
  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", val);
  inputelement.setAttribute("id", id);
  if(disableInput){
    inputelement.setAttribute("disabled","disabled");
  }
  inputelement.style.width = "93%";
  inputelement.style.margin = "10px 0 10px 3%";
  inputelement.placeholder = ph;
  inputelement.style.border = "none";
  inputelement.style.background = "white";
  inputelement.style.borderRadius = "3px";
  return inputelement;

}

function addChoice(ph: string, id: string,val:string="",disableInput:boolean=false) {
  var li = document.createElement('li'); 
  var inputelement = document.createElement('input'); 
  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", val);
  inputelement.setAttribute("id", id);
  if(disableInput){
    inputelement.setAttribute("disabled","disabled");
  }
  inputelement.style.width = "95%";
  inputelement.placeholder = ph;
  inputelement.style.border = "none";
  inputelement.style.borderRadius = "3px";
  li.appendChild(inputelement);
  return li;
}