const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const dynamodb = require('@aws-cdk/aws-dynamodb');
const CfnParameter = require('@aws-cdk/core').CfnParameter
const Provider = require('@aws-cdk/custom-resources').Provider
const path = require("path")
const Duration = require("@aws-cdk/core").Duration
const ManagedPolicy = require("@aws-cdk/aws-iam").ManagedPolicy

class DeployStack extends cdk.Stack {

    constructor(scope, id, props) {
        super(scope, id, props);

        const InstanceId = new CfnParameter(this, "InstanceId", {
            type: "String",
            description: "The Amazon Connect Instance Alias "
        });

        const table = new dynamodb.Table(this, 'Foundry', {
            partitionKey: {name: "phone", type: dynamodb.AttributeType.STRING}
        })

        const dynamoLambda = new lambda.Function(this, "DynamoLambdaHandler", {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset("foundry.zip"),
            timeout: Duration.seconds(120),
            handler: "index.handler",
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        table.grantFullAccess(dynamoLambda)

        const onEvent = new lambda.Function(this, "MnomicFlow", {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            timeout: Duration.seconds(120),
            code: lambda.Code.fromAsset(path.join(__dirname, 'MnomicFlow'))
        })

        onEvent.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AmazonConnect_FullAccess"))

        const myProvider = new Provider(this, "MnonmicProvider", {
            onEventHandler: onEvent
        })

        new cdk.CustomResource(this, "MnonmicFlow", {
            serviceToken: myProvider.serviceToken,
            properties: {
                "lambdaArn": dynamoLambda.functionArn,
                "InstanceId": InstanceId
            }
        });
    }
}

module.exports = {DeployStack}
