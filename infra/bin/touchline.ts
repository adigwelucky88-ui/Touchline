#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';

import { ApiStack } from '../lib/api-stack';
import { AuthStack } from '../lib/auth-stack';
import { resolveConfig } from '../lib/config';
import { DataStack } from '../lib/data-stack';
import { MediaStack } from '../lib/media-stack';
import { NetworkStack } from '../lib/network-stack';

/**
 * Usage: pnpm cdk synth -c env=dev    (dev | staging | prod)
 *        pnpm cdk deploy --all -c env=staging -c imageTag=<git sha>
 */
const app = new cdk.App();
const config = resolveConfig(app.node.tryGetContext('env'), app.node.tryGetContext('account') ?? process.env.CDK_DEFAULT_ACCOUNT);
const env = { account: config.account, region: config.region };
const prefix = `Touchline-${config.name}`;

cdk.Tags.of(app).add('project', 'touchline');
cdk.Tags.of(app).add('environment', config.name);

const network = new NetworkStack(app, `${prefix}-Network`, { env, config });
const data = new DataStack(app, `${prefix}-Data`, { env, config, vpc: network.vpc });
new AuthStack(app, `${prefix}-Auth`, { env, config });
const media = new MediaStack(app, `${prefix}-Media`, { env, config });
new ApiStack(app, `${prefix}-Api`, {
  env,
  config,
  vpc: network.vpc,
  database: data.cluster,
  databaseSecurityGroup: data.securityGroup,
  rawBucket: media.rawBucket,
  processedBucket: media.processedBucket,
  mediaDistribution: media.distribution,
});
