
import * as actionSDK from 'action-sdk-sunny';

var root = document.getElementById("root");
let row = {};
let actionInstance = null;

OnPageLoad();

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


function createQuestionView(){

  var count = 1;
  actionInstance.dataSets[0].dataFields.forEach((column) => {
    
          var qDiv = document.createElement("div");

          var linebreak = document.createElement('br');
          qDiv.appendChild(linebreak);  

          var questionHeading = document.createElement('h4'); // Heading of For
          questionHeading.innerHTML = count + "."+ column.title;
          qDiv.appendChild(questionHeading);      


          if(column.type == "SingleOption" ){
             //add radio button
            column.options.forEach((option) => {
              var radioOption = getRadioButton(option.title,column.id,option.id);
              qDiv.appendChild(radioOption);
            
             });
          }
          else  if(column.type == "Text" ){
            var radioOption = addInputElement("Enter Number",column.id,"text");
            qDiv.appendChild(radioOption);

          }
          else  if(column.type == "Numeric" ){
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
  row[colomnId]=optionId;
}

function submitForm() {
    actionSDK.executeApi(new actionSDK.GetContext.Request())
    .then(function ( response: actionSDK.GetContext.Response) {
      console.info("GetContext - Response: " + JSON.stringify(response));
          addDataItems(response.context.actionId);
      })
      .catch(function (error) {
          console.error("GetContext - Error: " + JSON.stringify(error));
      });
}

function generateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

function getDataItem(actionId) {
  return {
      id: generateGUID(),
      actionId: actionId,
      dataSetId: "TestDataSet",
      fieldValues: row
  };
}

function addDataItems(actionId) {
  var addDataItemRequest1 = new actionSDK.AddActionDataItem.Request(getDataItem(actionId));
  var closeViewRequest = new actionSDK.CloseView.Request();
  var batchRequest = new actionSDK.BaseApi.BatchRequest([addDataItemRequest1, closeViewRequest]);
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
      .then(function ( response: actionSDK.GetContext.Response) {
          console.info("GetContext - Response: " + JSON.stringify(response));
          getActionInstance(response.context.actionId);
      })
      .catch(function (error) {
          console.error("GetContext - Error: " + JSON.stringify(error));
      });
}


function getActionInstance(actionId) {
      actionSDK.executeApi(new actionSDK.GetAction.Request(actionId))
      .then(function ( response: actionSDK.GetAction.Response) {
          console.info("Response: " + JSON.stringify(response));
          actionInstance = response.action;
          createBody();
      })
      .catch(function (error) {
          console.log("Error: " + JSON.stringify(error));
      });
}