import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.Function;
}

export class HitCounter extends cdk.Construct {
  /** allows accessing the counter function by other constructor or stack */
  public readonly lambda_handler: lambda.Function;

  /** the hit counter table which expose to access by other constructor or stack */
  public readonly table: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    // create hit table
    const table = new dynamodb.Table(this, 'HelloCDK-API-Hits', {
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
        //sortKey: { name: 'hits', type: dynamodb.AttributeType.NUMBER }
    });

    this.table = table;

    this.lambda_handler = new lambda.Function(this, 'HitCounterHandler', {
        runtime: lambda.Runtime.NODEJS_10_X,
        handler: 'hitcounter.handler',
        code: lambda.Code.asset('lambda'),
        environment: {
            HITS_TABLE_NAME: table.tableName,
            DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName
        }
    });

    // grant lambda to access the dynamodb table
    table.grantReadWriteData(this.lambda_handler);
    // grant lambda to invoke downstream lambda function
    props.downstream.grantInvoke(this.lambda_handler);

  }
}