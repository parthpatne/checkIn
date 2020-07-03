import * as actionSDK from 'action-sdk-sunny';

export class ActionSdkHelper {

    /*
    * @desc Gets the localized strings in which the app is rendered
    */
    public static getLocalizedStrings() {
        actionSDK.executeApi(new actionSDK.GetLocalizedStrings.Request())
            .then(function (response: actionSDK.GetLocalizedStrings.Response) {
                return response.strings;
            })
            .catch(function (error) {
                console.error("GetContext - Error: " + JSON.stringify(error));
            });
    }
    /*
    * @desc Service Request to create new Action Instance 
    * @param {actionSDK.Action} action instance which need to get created
    */
    public static createActionInstance(action: actionSDK.Action) {

        let request = new actionSDK.CreateAction.Request(action);
        actionSDK.executeApi(request)
            .then(function (response: actionSDK.GetContext.Response) {
                console.info("CreateAction - Response: " + JSON.stringify(response));
            })
            .catch(function (error) {
                console.error("CreateAction - Error: " + JSON.stringify(error));
            });
    }
    /*
    * @desc Get Package Id of Corresponding Action Instance
    * @param {Function} callBack funtion that need to get executes
    */
    public static getActionPackageId(callBack: Function) {
        actionSDK.executeApi(new actionSDK.GetContext.Request())
            .then(function (response: actionSDK.GetContext.Response) {
                console.info("GetContext - Response: " + JSON.stringify(response));
                callBack(response.context.actionPackageId);
            })
            .catch(function (error) {
                console.error("GetContext - Error: " + JSON.stringify(error));
                return error;
            });
    }
    /*
    * @desc Service API Request for fetching action instance
    * @param {Function} callBack funtion that need to get executes
    */
    public static getAction(callBack: Function) {
        actionSDK.executeApi(new actionSDK.GetContext.Request())
            .then(function (response: actionSDK.GetContext.Response) {
                console.info("GetContext - Response: " + JSON.stringify(response));
                /*
                * Get Action Instance Details 
                */
                actionSDK.executeApi(new actionSDK.GetAction.Request(response.context.actionId))
                    .then(function (response: actionSDK.GetAction.Response) {
                        console.info("Response: " + JSON.stringify(response));
                        /*
                        * After fetching the action instance details prepare the body of response view
                        */
                        callBack(response.action);
                    })
                    .catch(function (error) {
                        console.log("Error: " + JSON.stringify(error));
                    });
            })
            .catch(function (error) {
                console.error("GetContext - Error: " + JSON.stringify(error));
            });
    }
    /*
    * @desc Service API Request for Submit of Response
    * @param {Function} callBack funtion to prepare the data row
    */
    public static addDataRows(callBack: Function) {
        actionSDK.executeApi(new actionSDK.GetContext.Request())
            .then(function (response: actionSDK.GetContext.Response) {
                console.info("GetContext - Response: " + JSON.stringify(response));

                let addDataRowRequest = new actionSDK.AddActionDataRow.Request(callBack(response.context.actionId));
                let closeViewRequest = new actionSDK.CloseView.Request();

                /*
                * @desc Prepare Batch Request object for simultaneously making multiple APIs Request
                */
                let batchRequest = new actionSDK.BaseApi.BatchRequest([addDataRowRequest, closeViewRequest]);
                actionSDK.executeBatchApi(batchRequest)
                    .then(function (batchResponse) {
                        console.info("BatchResponse: " + JSON.stringify(batchResponse));
                    })
                    .catch(function (error) {
                        console.error("Error: " + JSON.stringify(error));
                    })
            })
            .catch(function (error) {
                console.error("GetContext - Error: " + JSON.stringify(error));
            });
    }
}