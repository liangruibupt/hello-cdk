import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import sqs = require('@aws-cdk/aws-sqs');

import { QueueRecorder } from '../lib/queue-recorder';

export class HelloCdkStack extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props);

    // The code that defines your stack goes here
    new s3.Bucket(this, 'ray-cdk-lab-20191216', {
      versioned: true
    });

    const queue = new sqs.Queue(this, "HelloCDKQueue", {
      visibilityTimeout: cdk.Duration.seconds(60),
      retentionPeriod: cdk.Duration.days(2) // 2 days
    });

    new QueueRecorder(this, 'QueueRecorder', {
      inputQueue: queue
    });
  }
}
