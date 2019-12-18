import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import { HitCounter } from '../lib/hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
        runtime: lambda.Runtime.NODEJS_10_X,      // execution environment
        code: lambda.Code.asset('lambda'),  // code loaded from the "lambda" directory
        handler: 'hello.handler'                // file is "hello", function is "handler"
    });

    // use the construct and pass the hello Lambda as downstream function
    const HelloHitCounter = new HitCounter(this, "HelloHitCounter", {
        downstream: hello
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'CdkWorkshopAPI', {
        //handler: hello,
        handler: HelloHitCounter.lambda_handler,
        endpointTypes: [apigw.EndpointType.REGIONAL]
    });

    // DynamoDB table viewer constructor
    // this can only used in AWS global region due to APIGW is hardcode as EDGE which not supported by AWS Chian region
    // new TableViewer(this, 'ViewHitCounter', {
    //     title: 'Hello Hits',
    //     table: HelloHitCounter.table,
    //     sortBy: '-hits'
    // });
  }
}