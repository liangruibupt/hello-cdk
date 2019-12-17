import cdk = require('@aws-cdk/core');
import sqs = require('@aws-cdk/aws-sqs');
import lambda = require('@aws-cdk/aws-lambda');
import event_sources = require('@aws-cdk/aws-lambda-event-sources');
import dynamodb = require('@aws-cdk/aws-dynamodb');

// input queue
export interface QueueRecorderProps {
    inputQueue: sqs.Queue
}


// queue consumer constructor
export class QueueRecorder extends cdk.Construct {
    constructor(parent: cdk.Construct, id: string, props: QueueRecorderProps){
        super(parent, id);

        const fn = new lambda.Function(this, "HelloCDK-SQSConsumer-Function", {
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambda.Code.asset('lambda'),
            handler: 'index.handler'
        });

        fn.addEventSource(new event_sources.SqsEventSource(props.inputQueue));

        const ddb_table = new dynamodb.Table(this, 'HelloCDK-QueueRecorderTable', {
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING}
        });

        fn.addEnvironment('TABLE_NAME', ddb_table.tableName);

        ddb_table.grantReadWriteData(fn);
    }
}