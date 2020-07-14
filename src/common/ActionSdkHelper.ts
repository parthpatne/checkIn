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
    /*
    *   @desc Service API Request for getting the actionContext
    *   @return response.context: actionSDK.ActionSdkContext
    */
    public static async getContext() {
        let response = await actionSDK.executeApi(new actionSDK.GetContext.Request()) as actionSDK.GetContext.Response;
        return response.context;
    }
    /*
    *   @desc Service API Request for getting the actionInstance
    *   @param context - actionInstance context: actionSDK.ActionSdkContext
    *   @return response.action: actionSDK.Action
    */
    public static async getActionInstance(context: actionSDK.ActionSdkContext) {
        let getActionRequest = new actionSDK.GetAction.Request(context.actionId);
        let response = await actionSDK.executeApi(getActionRequest) as actionSDK.GetAction.Response;
        return response.action;
    }
    /*
    *   @desc Service API Request for getting the actionInstance response summary
    *   @param context - actionInstance context: actionSDK.ActionSdkContext
    *   @return response.summary: actionSDK.GetActionDataRowsSummary
    */
    public static async getActionSummary(context: actionSDK.ActionSdkContext) {
        let getSummaryRequest = new actionSDK.GetActionDataRowsSummary.Request(context.actionId, true);
        let response = await actionSDK.executeApi(getSummaryRequest) as actionSDK.GetActionDataRowsSummary.Response;
        return response.summary;
    }
    /*
    *   @desc Service API Request for getting the actionInstance responses
    *   @param context - actionInstance context: actionSDK.ActionSdkContext
    *   @return response.dataRows: actionSDK.GetActionDataRows
    */
    public static async getActionDataRows(context: actionSDK.ActionSdkContext) {
        let getDataRowsRequest = new actionSDK.GetActionDataRows.Request(context.actionId);
        let response = await actionSDK.executeApi(getDataRowsRequest) as actionSDK.GetActionDataRows.Response;
        return response.dataRows;

    }
    /*
    *   @desc Service API Request for getting the membercount
    *   @param context - action context: actionSDK.ActionSdkContext
    *   @return response.memberCount: number
    */
    public static async getMemberCount(context: actionSDK.ActionSdkContext) {
        let getSubscriptionCount = new actionSDK.GetSubscriptionMemberCount.Request(context.subscription);
        let response = await actionSDK.executeApi(getSubscriptionCount) as actionSDK.GetSubscriptionMemberCount.Response;
        return response.memberCount;
    }
    /*
    *   @desc Service API Request for getting the responders details
    *   @param context - action context: actionSDK.ActionSdkContext
    *   @param actionDataRowsLength - number of response rows: number
    *   @param actionDataRows - total response rows: actionSDK.ActionDataRow
    *   @return responderDetails: [label:<>,time:<>,userId:<>]
    */
    public static async getResponderDetails(context: actionSDK.ActionSdkContext, actionDataRowsLength: number, actionDataRows) {
        let responderDetail = [];
        for (let i = 0; i < actionDataRowsLength; i++) {
            let requestResponders = new actionSDK.GetSubscriptionMembers.Request(context.subscription, [actionDataRows[i].creatorId]);
            let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
            let UserProfileMembers = responseResponders.members;
            for (var itr = 0; itr < UserProfileMembers.length; itr++) {
                responderDetail.push({ label: UserProfileMembers[itr].displayName, time: new Date(actionDataRows[itr].updateTime).toDateString(), userId: UserProfileMembers[itr].id });
            }
        }
        return responderDetail;
    }
    /*
    *   @desc Service API Request for getting the nonResponders details
    *   @param context - action context: actionSDK.ActionSdkContext
    *   @return NonResponders: [label:<>,userId:<>]
    */
    public static async getNonResponders(context: actionSDK.ActionSdkContext) {
        let NonResponders = [];
        let requestNonResponders = new actionSDK.GetActionSubscriptionNonParticipants.Request(context.actionId, context.subscription.id);
        let responseNonResponders = await actionSDK.executeApi(requestNonResponders) as actionSDK.GetActionSubscriptionNonParticipants.Response;
        let tempresponse = responseNonResponders.nonParticipants;
        if (tempresponse != null) {
            for (let i = 0; i < tempresponse.length; i++) {
                NonResponders.push({ label: tempresponse[i].displayName, userId: tempresponse[i].id });
            }
        }
        return NonResponders;
    }
    /*
    *   @desc Service API Request for getting the membercount, responder list and nonResponder list
    *   @param subscription - action subscription: actionSDK.ActionSdkContext.subscription
    *   @param creatorId - id of responder: string
    */
    public static async getResponder(subscription: actionSDK.Subscription, creatorId: string) {
        let requestResponders = new actionSDK.GetSubscriptionMembers.Request(subscription, [creatorId]);
        let responseResponders = await actionSDK.executeApi(requestResponders) as actionSDK.GetSubscriptionMembers.Response;
        return responseResponders.members;
    }
}