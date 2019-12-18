#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { HelloCdkStack } from '../lib/hello-sdk-stack';
import { CdkWorkshopStack } from '../lib/cdk-workshop-stack';
import { FargateSQSCdkStack } from '../lib/cdk-ecs-patttern-sqs-stack'

const app = new cdk.App();
new HelloCdkStack(app, 'HelloCdkStack');
new CdkWorkshopStack(app, 'CdkWorkshopStack');
new FargateSQSCdkStack(app, 'FargateSQSCdkStack');
