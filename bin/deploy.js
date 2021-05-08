#!/usr/bin/env node
const cdk = require('@aws-cdk/core');
const { DeployStack } = require('../lib/deploy-stack');

const app = new cdk.App();
new DeployStack(app, 'DeployStack');
