# Welcome to your CDK TypeScript project!

This is a quick start project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## First run
cdk bootstrap

## Create project
```
cdk --app "npx hello-cdk test/hello-cdk.test.ts" ls
mkdir hello-sdk
cdk init --language typescript
cdk ls
```

## build project
```
npm run watch
# Compiling the App
npm run build
# Synthesizing an AWS CloudFormation Template
cdk synth
# deploy the project resources
cdk deploy --profile cn-north-1
# destroy the project resources
cdk destroy --profile cn-north-1
# multi stack
cdk deploy CdkWorkshopStack
```
## add aws resource
### s3
```
npm install @aws-cdk/aws-s3

import s3 = require('@aws-cdk/aws-s3');
    new s3.Bucket(this, 'ray-cdk-lab-20191216', {
      versioned: true
    });
```

### sqs
```
npm install @aws-cdk/aws-sqs

import sqs = require('@aws-cdk/aws-sqs');
```


### lambda
```
npm install @aws-cdk/aws-lambda
npm install @aws-cdk/aws-lambda-event-sources

import lambda = require('@aws-cdk/aws-lambda');
import event_sources = require('@aws-cdk/aws-lambda-event-sources');

```

## dynamoDB
```
npm install @aws-cdk/aws-dynamodb

import dynamodb = require('@aws-cdk/aws-dynamodb');
```

## api gw
```
npm install @aws-cdk/aws-apigateway

import apigw = require('@aws-cdk/aws-apigateway');
```
