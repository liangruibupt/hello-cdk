import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');
import sqs = require('@aws-cdk/aws-sqs');

export class FargateSQSCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC (Limit 2 AZs) and Fargate Cluster
    const myVpc = new ec2.Vpc(this, 'FargateSQSCdkVPC', { maxAzs: 2 });
    const myFargateCluster = new ecs.Cluster(this, 'FargateSQSCdkCluster', { vpc: myVpc });

    const mySQSqueue = new sqs.Queue(this, "FargateSQSCdkQueue", {
      visibilityTimeout: cdk.Duration.seconds(60),
      retentionPeriod: cdk.Duration.days(2) // 2 days
    });

    // Instantiate Fargate Service with just cluster and image
    const myQueueProcessingService = new ecs_patterns.QueueProcessingFargateService(this, "MyQueueProcessingService", {
      cluster: myFargateCluster,
      memoryLimitMiB: 512,
      image: ecs.ContainerImage.fromRegistry("receive-sqs-message"),
      command: [mySQSqueue.queueName, cdk.Aws.REGION],
      enableLogging: true,
      desiredTaskCount: 2,
      environment: {
        SQS_QUEUE_URL: mySQSqueue.queueName,
        AWS_REGION: cdk.Aws.REGION
      },
      maxScalingCapacity: 4,
      queue: mySQSqueue
    });

    const myFunction = new lambda.Function(
      this, "FargateSQSCdkFrontendFunction", {
        runtime: lambda.Runtime.NODEJS_10_X,
        timeout: cdk.Duration.seconds(30),
        handler: "sendmessage.handler",
        code: lambda.Code.asset("lambda"),
        environment: {
          QUEUE_NAME: mySQSqueue.queueName
        }
      });
    
    mySQSqueue.grantSendMessages(myFunction);

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'FargateSQSCdkAPI', {
        handler: myFunction,
        endpointTypes: [apigw.EndpointType.REGIONAL]
    });
  }
}