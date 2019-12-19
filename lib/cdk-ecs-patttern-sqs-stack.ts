import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import ecs = require('@aws-cdk/aws-ecs');
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigateway');
import ecs_patterns = require('@aws-cdk/aws-ecs-patterns');
import sqs = require('@aws-cdk/aws-sqs');
import ecr = require('@aws-cdk/aws-ecr');

export class FargateSQSCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC (Limit 2 AZs) and Fargate Cluster
    const myVpc = new ec2.Vpc(this, 'FargateSQSCdkVPC', { maxAzs: 2 });
    const myFargateCluster = new ecs.Cluster(this, 'FargateSQSCdkCluster', { vpc: myVpc });
    const myRepository = ecr.Repository.fromRepositoryName(this, 'receive-sqs-message', 'receive-sqs-message');

    const mySQSqueue = new sqs.Queue(this, "FargateSQSCdkQueue", {
      visibilityTimeout: cdk.Duration.seconds(60),
      retentionPeriod: cdk.Duration.days(2) // 2 days
    });

    // Instantiate Fargate Service with just cluster and image
    const myQueueProcessingService = new ecs_patterns.QueueProcessingFargateService(this, "MyQueueProcessingService", {
      cluster: myFargateCluster,
      memoryLimitMiB: 512,
      //image: ecs.ContainerImage.fromRegistry("876820548815.dkr.ecr.cn-north-1.amazonaws.com.cn/receive-sqs-message:latest"),
      image: ecs.ContainerImage.fromEcrRepository(myRepository, 'latest'),
      enableLogging: true,
      desiredTaskCount: 2,
      environment: {
        SQS_QUEUE_URL: mySQSqueue.queueUrl,
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
          QUEUE_URL: mySQSqueue.queueUrl
        }
      });
    
    mySQSqueue.grantSendMessages(myFunction);
    mySQSqueue.grantConsumeMessages(myQueueProcessingService.taskDefinition.taskRole);
    //myRepository.grantPull(myQueueProcessingService.taskDefinition.taskRole);
    

    // defines an API Gateway REST API resource backed by our "hello" function.
    new apigw.LambdaRestApi(this, 'FargateSQSCdkAPI', {
        handler: myFunction,
        endpointTypes: [apigw.EndpointType.REGIONAL]
    });
  }
}