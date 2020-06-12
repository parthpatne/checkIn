
import * as actionSDK from 'action-sdk-sunny';

var root = document.getElementById("root");
let actionInstance = null;
let actionSummary  = null;

OnPageLoad();

function createBody(){
    var title = document.createElement('h3');
    title.innerHTML = actionInstance.title;
    root.appendChild(title);
    createQuestionView();
}

function createQuestionView(){

  var count = 1;
  actionInstance.dataSets[0].dataFields.forEach((column) => {
    
          var qDiv = document.createElement("div");
          var linebreak = document.createElement('br');
          var questionHeading = document.createElement('h4'); 

          qDiv.appendChild(linebreak);  
          questionHeading.innerHTML = count + "."+ column.title;
          qDiv.appendChild(questionHeading);      
          column.options.forEach((option) => {
           var optionView = getAggregateOptionView(option.title,option.id,column.id);
           qDiv.appendChild(optionView);
          });
          root.appendChild(qDiv);
          count++;
  });

}

function getAggregateOptionView( title,optionId,columnId) {

    var oDiv = document.createElement("div");
    var optionTitle = document.createElement('h6'); 
    
    optionTitle.innerHTML = title;
    oDiv.appendChild(optionTitle);  

    var mDiv = document.createElement("div");
    mDiv.className = "meter";
    var spanTag1 = document.createElement('span');

    var wid = JSON.parse(actionSummary.defaultAggregates[columnId])[optionId]/actionSummary.itemCount*100;
    spanTag1.style.width =  isNaN(wid) ? "0%": wid + "%";

    mDiv.appendChild(spanTag1);  

    oDiv.appendChild(mDiv);  
  
    var newline = document.createElement('br');
    oDiv.appendChild(newline);
    return oDiv;  
} 

function OnPageLoad() {
  actionSDK.executeApi(new actionSDK.GetContext.Request())
  .then(function ( response: actionSDK.GetContext.Response) {
          console.info("GetContext - Response: " + JSON.stringify(response));
          getDataItems(response.context.actionId);
      })
      .catch(function (error) {
          console.error("GetContext - Error: " + JSON.stringify(error));
      });
}

function getDataItems(actionId) {
  var getActionRequest = new actionSDK.GetAction.Request(actionId);
  var getSummaryRequest = new actionSDK.GetActionDataItemsSummary.Request(actionId,true);
  var getDataItemsRequest = new actionSDK.GetActionDataItems.Request(actionId);
  // var closeViewRequest = new actionSDK.CloseView.Request();
  var batchRequest = new actionSDK.BaseApi.BatchRequest([getActionRequest, getSummaryRequest, getDataItemsRequest]);
  actionSDK.executeBatchApi(batchRequest)
      .then(function (batchResponse: actionSDK.BaseApi.BatchResponse) {
          console.info("BatchResponse: " + JSON.stringify(batchResponse));
          actionInstance = (<actionSDK.GetAction.Response>batchResponse.responses[0]).action;
          actionSummary = (<actionSDK.GetActionDataItemsSummary.Response>batchResponse.responses[1]).summary;
          createBody();
      })
      .catch(function (error) {
          console.log("Error: " + JSON.stringify(error));
      });
}