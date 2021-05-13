exports.SUCCESS = "SUCCESS";
exports.FAILED = "FAILED";

/**
 * @param {{ InstanceId: any; lambdaARN: any; StackId: any; RequestId: any; LogicalResourceId: any; }} event
 * @param {{ logStreamName: string; }} context
 * @param {any} responseStatus
 * @param {any} responseData
 * @param {any} physicalResourceId
 * @param {any} noEcho
 */
exports.handler = async (event, context,responseStatus,responseData,physicalResourceId, noEcho) => {
    console.log("EVENT",event);
    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: physicalResourceId || context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        NoEcho: noEcho || false,
        Data: responseData
    });
    // @ts-ignore

    const AWS = require("aws-sdk")
    //const connectInstanceId = "arn:aws:connect:us-west-2:586316580575:instance/354c47de-186f-4a4a-9227-c840a11db50e";

    var connectClient = new AWS.Connect({
        apiVersion: "2017-08-08",
        region: "us-west-2"
    });

    // @ts-ignore
    if (event.RequestType === "Delete") {
        return(event, context, "SUCCESS");

    }

    //if(typeof event.ResouceProperties != "undefined") {
        const connectInstanceId = event.ResourceProperties.InstanceId;
        const lambdaARN = event.ResourceProperties.lambdaArn;
        console.log("Response body:\n", responseBody);
        console.log(connectInstanceId);
        var content = '{"Version":"2019-10-30","StartAction":"4d36a741-bc87-4035-b3fa-9c8390e687ac","Metadata":{"entryPointPosition":{"x":32,"y":15},"snapToGrid":false,"ActionMetadata":{"96f62f74-1905-40cd-acca-714c0782717a":{"position":{"x":1719,"y":448}},"431f29e2-cca7-44e4-a449-90a38c2d327b":{"position":{"x":920,"y":566},"useDynamic":false},"4d36a741-bc87-4035-b3fa-9c8390e687ac":{"position":{"x":186,"y":50},"useDynamic":false},"1b9a1e90-a330-450b-85a9-dcad8ef3b045":{"position":{"x":1181,"y":73},"useDynamic":false},"7eefafd6-402f-4759-967c-b017ef5f3969":{"position":{"x":143,"y":245},"dynamicMetadata":{},"useDynamic":false},"7329da0c-3dcb-4661-a72e-95b6e841a4a4":{"position":{"x":924,"y":361},"useDynamic":false}}},"Actions":[{"Identifier":"96f62f74-1905-40cd-acca-714c0782717a","Type":"DisconnectParticipant","Parameters":{},"Transitions":{}},{"Identifier":"431f29e2-cca7-44e4-a449-90a38c2d327b","Parameters":{"Text":"Sorry, we failed to find any results for your number."},"Transitions":{"NextAction":"1b9a1e90-a330-450b-85a9-dcad8ef3b045","Errors":[],"Conditions":[]},"Type":"MessageParticipant"},{"Identifier":"4d36a741-bc87-4035-b3fa-9c8390e687ac","Parameters":{"Text":"Using your phone number, we will attempt to come up with a friendly mnemonic to help you remember your phone number."},"Transitions":{"NextAction":"7eefafd6-402f-4759-967c-b017ef5f3969","Errors":[],"Conditions":[]},"Type":"MessageParticipant"},{"Identifier":"1b9a1e90-a330-450b-85a9-dcad8ef3b045","Parameters":{"Text":"Thank You for playing. Good Bye."},"Transitions":{"NextAction":"96f62f74-1905-40cd-acca-714c0782717a","Errors":[],"Conditions":[]},"Type":"MessageParticipant"},{"Identifier":"7eefafd6-402f-4759-967c-b017ef5f3969","Parameters":{"LambdaFunctionARN":"'+lambdaARN+'","InvocationTimeLimitSeconds":"8"},"Transitions":{"NextAction":"7329da0c-3dcb-4661-a72e-95b6e841a4a4","Errors":[{"NextAction":"431f29e2-cca7-44e4-a449-90a38c2d327b","ErrorType":"NoMatchingError"}],"Conditions":[]},"Type":"InvokeLambdaFunction"},{"Identifier":"7329da0c-3dcb-4661-a72e-95b6e841a4a4","Parameters":{"SSML":"The results are in. $.External.message <break time=\\"1s\\"/>Your first mnemonic is $.External.resthree. <break time=\\"2s\\"/>Your next result is $.External.restwo. <break time=\\"2s\\"/>And your best result is, <break time=\\"2s\\"/>$.External.resone. <break time=\\"1s\\"/>Cool."},"Transitions":{"NextAction":"1b9a1e90-a330-450b-85a9-dcad8ef3b045","Errors":[],"Conditions":[]},"Type":"MessageParticipant"}]}'
//content = JSON.stringify(content);
    //content = escape(content);

   // console.log("CONTENT",content)
    var lambdaId = connectInstanceId.substring(connectInstanceId.length - 36, connectInstanceId.length);
        console.log("LID",lambdaId)
        var contactParams = {
            "Description": "Mnenomic Flow",
            "Name": "MnenomicFlow",
            "Type": "CONTACT_FLOW",
            "InstanceId": lambdaId,
            "Content": content
        };



        var listUsersPromise = connectClient.createContactFlow(contactParams).promise();
        var listUsersResponse = await listUsersPromise;
        var assn = connectClient.associateLambdaFunction({"InstanceId": connectInstanceId,"FunctionArn": lambdaARN})
        console.log("REZ",listUsersResponse);
        console.log("AN",assn)
       // return (responseBody);
    //}
    if (event.RequestType == "Create") {
        return(responseBody, context, "SUCCESS");
    }
}
