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

function fetchQuetionSetForTemplate(val:number){
    var templateQuestions = Object.values(questionTemplate)[val];
    clear();
    document.getElementById("surveyTitle").setAttribute("value",Object.keys(questionTemplate)[val]);
    if(val == 0){
      document.getElementById("surveyTitle").setAttribute("value","");
    }
    templateQuestions.forEach(question => {
      addQuestion("1",question);
    });
}

function clear(){
  bodyDiv.innerHTML = "";
  questionCount = 0;
}

OnPageLoad();
function OnPageLoad() {

  var select = document.createElement("select");
  select.style.border = "none";
  select.style.background = "#DCDCDC";
  select.style.padding = "5px";
  select.style.borderRadius = "5px";

  keys.forEach(element => {
    select.options.add( new Option(element) );
  });
  
  select.addEventListener("change", function () {

    if (confirm("All your changes will be lost when template is changed. Are you sure you want to change the template?")) {
      fetchQuetionSetForTemplate(select.selectedIndex);
      currentSelectedTemplate = select.selectedIndex;
    } 
    else{
      select.selectedIndex = currentSelectedTemplate;
    }
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
  var questionTypeList = document.createElement("select");

  questionTypeList.options.add( new Option("MCQ","1") );
  questionTypeList.options.add( new Option("TEXT","2") );
  questionTypeList.options.add( new Option("NUMBER","3") );
  questionTypeList.selectedIndex = -1;


  questionTypeList.style.width="15px";
  questionTypeList.style.height="21px";
  questionTypeList.style.background = "#6264a7";
  questionTypeList.style.color = "white";
  questionTypeList.style.border = "none";
  questionTypeList.style.outline= "none";
  questionTypeList.style.boxShadow = "none";
  
  
  var addQuestionButton = document.createElement("BUTTON");   // Create a <button> element
  addQuestionButton.innerHTML = "Add Question";
  addQuestionButton.style.float = "left"; 
  addQuestionButton.style.background = "#6264a7";
  addQuestionButton.style.color = "white";
  addQuestionButton.style.border = "none";
  addQuestionButton.style.height = "21px";
  addQuestionButton.style.marginRight= "1px";
  addQuestionButton.style.outline= "none";
  addQuestionButton.style.boxShadow = "none";

   

  var submit = document.createElement("BUTTON");   // Create a <button> element
  submit.innerHTML = "Create Form";
  submit.style.float = "right";
  submit.style.background = "#6264a7";
  submit.style.color = "white";
  submit.style.border = "none";
  submit.style.height = "21px";
  submit.style.outline= "none";
  submit.style.boxShadow = "none";
  submit.setAttribute("id","submitForm");


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

    submitFormNew();
  });
}

function createInputElement(ph: string, id: string) {
  var inputelement = document.createElement('input'); // Create Input Field for Name
  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("id", id);
  inputelement.placeholder = ph;
  return inputelement;
}

function deleteQuestion(img,qId){
  var elem = document.getElementById(img.parentNode.id);
  elem.parentNode.removeChild(elem);
  questionMap.delete(qId);
}

function addMcqQuestion(question?:JSON) {
  var qDiv = document.createElement("div");
  var cDiv = document.createElement("ul");
  var qId = questionCount.toString();
  var questionHeading = document.createElement('label'); // Heading of Form

  var inputelement = document.createElement('input'); // Create Input Field for Name
  var choices = [];
  mcqChoicesMap.set(qId,choices);
  var ques = new Question(qId,"SingleOption",0,true); 
  questionMap.set(qId,ques);

  var img = document.createElement('img');
  img.setAttribute('src','../images/delete.svg');
  img.style.height = "20px";
  img.style.float = "right";
  img.addEventListener("click",function(){
        deleteQuestion(this,qId);
  });
  
  var choiceCount = 0;

  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", "");
  inputelement.setAttribute("dt", "SingleOption");
  inputelement.setAttribute("id", qId);

  inputelement.placeholder = "Enter Question";
  inputelement.style.width = "88%";
  inputelement.style.margin = "0 0 0 1%";
  inputelement.style.borderRadius = "3px";
  inputelement.style.border = "none";
  inputelement.style.fontWeight = "bold";

  var linebreak = document.createElement('br');
  
  qDiv.setAttribute("id",qId+"div");
  qDiv.appendChild(linebreak);
  qDiv.appendChild(questionHeading);
  qDiv.appendChild(img);
  qDiv.appendChild(inputelement);

  if(question != null){
    inputelement.value = question["title"];

    question["options"].forEach(option => {
      choices.push(qId + "c" + choiceCount);
      mcqChoicesMap.set(qId,choices);

      var choice = addChoice("Add Choice", qId + "c" + choiceCount++,option.title);
      cDiv.appendChild(choice);

    });
  }
  else{
    choices.push(qId + "c" + choiceCount);
    var choice = addChoice("Add Choice", qId + "c" + choiceCount++);
    cDiv.appendChild(choice);

    choices.push(qId + "c" + choiceCount);
    choice = addChoice("Add Choice", qId + "c" + choiceCount++);
    cDiv.appendChild(choice);

    mcqChoicesMap.set(qId,choices);
  }
  

  var addChoiceButton = document.createElement("BUTTON");   // Create a <button> element
  addChoiceButton.innerHTML = "+ Add Choice";
  addChoiceButton.style.marginLeft = "25px"
  addChoiceButton.style.float = "left"; 
  addChoiceButton.style.background = "rgb(220, 220, 220)";
  addChoiceButton.style.color = "#6264a7";
  addChoiceButton.style.border = "none";
  addChoiceButton.style.height = "21px";
  addChoiceButton.style.outline= "none";
  addChoiceButton.style.boxShadow = "none";

  addChoiceButton.addEventListener("click", function () {

    choices.push(qId + "" + choiceCount);
    var choice = addChoice("Add Choice", qId + "" + choiceCount++);
    cDiv.appendChild(choice);
    mcqChoicesMap.set(qId,choices);
  });

  qDiv.appendChild(cDiv);
  qDiv.appendChild(addChoiceButton);
  qDiv.appendChild(linebreak);

  return qDiv;
}

function addNumberQuestion(question?:JSON) {
  var qDiv = document.createElement("div");
  var linebreak = document.createElement('br');
  var questionHeading = document.createElement('label'); // Heading of Form
  var inputelement = document.createElement('input'); // Create Input Field for Name
  var qId = questionCount.toString();
  var ques = new Question(qId,"Numeric",-1,true); 
   questionMap.set(qId,ques);

  if(question != null){
    inputelement.value = question["title"];
  }
  var img = document.createElement('img');
  img.setAttribute('src','../images/delete.svg');
  img.style.height = "20px";
  img.style.float = "right";
  img.addEventListener("click",function(){
        deleteQuestion(this,qId);
  });

  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", "");
  inputelement.setAttribute("id", questionCount.toString());
  inputelement.placeholder = "Enter Question";

  inputelement.style.width = "88%";
  inputelement.style.margin = "0 0 0 1%";
  inputelement.style.border = "none";
  inputelement.style.borderRadius = "3px";
  inputelement.style.fontWeight = "bold";

  var linebreak = document.createElement('br');
  
  qDiv.setAttribute("id",questionCount+"div");
  qDiv.appendChild(linebreak);
  qDiv.appendChild(questionHeading);
  qDiv.appendChild(img);
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

   if(question != null){
    inputelement.value = question["title"];
  }

  var img = document.createElement('img');
  img.setAttribute('src','../images/delete.svg');
  img.style.height = "20px";
  img.style.float = "right";
  img.addEventListener("click",function(){
        deleteQuestion(this,qId);
  });

  inputelement.setAttribute("type", "text");
  inputelement.setAttribute("value", "");
  inputelement.setAttribute("id", questionCount.toString());
  inputelement.style.width = "88%";
  inputelement.style.margin = "0 0 0 1%";
  inputelement.style.border = "none";
  inputelement.style.borderRadius = "3px";
  inputelement.style.fontWeight = "bold";
  
  inputelement.placeholder = "Enter Question";
  
  
  qDiv.setAttribute("id",questionCount+"div");
  qDiv.appendChild(questionHeading);
  qDiv.appendChild(img);
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
  newQues.style.margin = "10px 0 10px 0"
  questionCount++;
  bodyDiv.appendChild(newQues);
  window.scrollTo(0,document.body.scrollHeight);

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
  inputelement.style.width = "88%";
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
  inputelement.style.width = "90%";
  inputelement.placeholder = ph;
  inputelement.style.border = "none";
  inputelement.style.borderRadius = "3px";
  li.appendChild(inputelement);
  return li;
}

function getQuestionSet() {
  let columnArray = [];
  questionMap.forEach(ques => {

       var title = (<HTMLInputElement>document.getElementById(ques.id)).value;
       let val =  {
            id: ques.id,
            title: title,
            type: ques.type,
            allowNullValue: false,
            options: []
       }

       if( mcqChoicesMap.get(ques.id)){
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
  .then(function ( response: actionSDK.GetContext.Response) {
    console.info("CreateAction - Response: " + JSON.stringify(response));
      })
      .catch(function (error) {
          console.error("CreateAction - Error: " + JSON.stringify(error));
      });
}

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

function submitFormNew() {
  actionSDK.executeApi(new actionSDK.GetContext.Request())
  .then(function ( response: actionSDK.GetContext.Response) {
      console.info("GetContext - Response: " + JSON.stringify(response));
      createAction(response.context.actionPackageId);
  })
.catch(function (error) {
    console.error("GetContext - Error: " + JSON.stringify(error));
  });
}

