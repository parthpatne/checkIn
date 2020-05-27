
import * as ActionSDK from 'actionSDK2';
ActionSDK.APIs.actionViewDidLoad(true /*success*/);

// Fetching HTML Elements in Variables by ID.
var root = document.getElementById("root");
let row = {};
let actionInstance:  ActionSDK.ActionInstance = null;

initialize();

function createBody(){
    var title = document.createElement('h3');
    title.innerHTML = actionInstance.title;
    root.appendChild(title);
    createQuestionView();

    var submit = document.createElement("BUTTON");   // Create a <button> element
    submit.innerHTML = "Submit";
    submit.style.float = "right";
    submit.addEventListener("click", function () {

     submitForm();
    });

    root.appendChild(submit);
}
function submitForm() {
  
  //parth check how to get row and id 
  let actionInstanceRow: ActionSDK.ActionInstanceRow = {
    id: "",
    isUpdate: false,
    row: row
};


ActionSDK.Utils.announceText(ActionSDK.Localizer.getString("SubmittingResponse"));
        ActionSDK.ActionUtils.prepareActionInstanceRow(actionInstanceRow);
        ActionSDK.APIs.createOrUpdateActionInstanceRows(actionInstance.id, [actionInstanceRow])
            .then((success: boolean) => {
                    ActionSDK.Utils.announceText(ActionSDK.Localizer.getString("Submitted"));
                    ActionSDK.APIs.dismissScreen();
                
            }).catch(error => {
                console.log("submit failed: "+ error.toString());
            });
}


function createQuestionView(){

  var count = 1;
  actionInstance.columns.forEach((column: ActionSDK.ActionInstanceColumn) => {
    
          var qDiv = document.createElement("div");

          var linebreak = document.createElement('br');
          qDiv.appendChild(linebreak);  

          var questionHeading = document.createElement('h4'); // Heading of For
          questionHeading.innerHTML = count + "."+ column.title;
          qDiv.appendChild(questionHeading);      


          if(column.type == "SingleOption" ){
             //add radio button
            column.options.forEach((option:ActionSDK.ActionInstanceColumnOption) => {
              var radioOption = getRadioButton(option.title,column.id,option.id);
              qDiv.appendChild(radioOption);
            
             });
          }
          else  if(column.type == "Text" ){

            var radioOption = addInputElement("Enter Number",column.id,"text");
            qDiv.appendChild(radioOption);

          }
          else  if(column.type == "Numeric" ){
               //add radio button

              var radioOption = addInputElement("Enter Number",column.id,"number");
              qDiv.appendChild(radioOption);
            
          }
         
          root.appendChild(qDiv);
          count++;
  });

}


function addInputElement(ph: string, id: string,type:string) {
  var inputelement = document.createElement('input'); 
  inputelement.setAttribute("columnId", id);
  inputelement.setAttribute("type", type);
  inputelement.setAttribute("id", id);

  inputelement.style.width = "93%";
  inputelement.style.margin = "10px 0 10px 3%";
  inputelement.placeholder = ph;
  inputelement.style.border = "none";
  inputelement.style.background = "white";
  inputelement.style.borderRadius = "3px";

  inputelement.addEventListener("change", function () {
    radiobuttonclick(this.value,this.getAttribute("columnId"));
    });
  return inputelement;
}


function getRadioButton( text,name,id) {

    var oDiv = document.createElement("div");
    oDiv.id = id;
	  oDiv.setAttribute("columnId", name);
	
		oDiv.addEventListener("click", function () {
		radiobuttonclick(this.id,this.getAttribute("columnId"));
		});
    var radiobox = document.createElement('input');
    radiobox.type = 'radio';
    radiobox.name = name;
    radiobox.id = id;
    radiobox.attributes
  
    oDiv.appendChild(radiobox);
    oDiv.appendChild(document.createTextNode(text));    
  
    var newline = document.createElement('br');
  

    oDiv.appendChild(newline);

    return oDiv;  
} 

function radiobuttonclick(optionId,colomnId){
  console.log("parth radio button clicked: "+optionId + colomnId);
  row[colomnId]=optionId;
}
function initialize(){

    ActionSDK.APIs.getCurrentContext()
    .then((context: ActionSDK.ActionContext) => {   
      ActionSDK.APIs.getActionInstance(context.actionInstanceId)
      .then((ai: ActionSDK.ActionInstance) => {
      actionInstance = ai;
      createBody();
      })      
    });

}

