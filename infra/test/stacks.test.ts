import * as cdk from 'aws-cdk-lib/core';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { AuthStack } from '../lib/auth-stack';
import { resolveConfig } from '../lib/config';
import { DataStack } from '../lib/data-stack';
import { MediaStack } from '../lib/media-stack';
import { NetworkStack } from '../lib/network-stack';

function build(envName: 'dev' | 'prod') {
  const app = new cdk.App();
  const config = resolveConfig(envName, undefined);
  const network = new NetworkStack(app, 'Network', { config });
  // Build every stack before synthesising any template: the tree is frozen after the first synth.
  const data = new DataStack(app, 'Data', { config, vpc: network.vpc });
  const media = new MediaStack(app, 'Media', { config });
  const auth = new AuthStack(app, 'Auth', { config });
  return { data: Template.fromStack(data), media: Template.fromStack(media), auth: Template.fromStack(auth) };
}

describe('Touchline stacks', () => {
  it('encrypts Aurora and protects prod data', () => {
    const { data } = build('prod');
    data.hasResourceProperties('AWS::RDS::DBCluster', {
      Engine: 'aurora-postgresql',
      StorageEncrypted: true,
      DeletionProtection: true,
    });
    data.resourceCountIs('AWS::RDS::DBInstance', 2);
  });

  it('keeps every media bucket private', () => {
    const { media } = build('dev');
    media.resourceCountIs('AWS::S3::Bucket', 2);
    media.allResourcesProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  it('requires a date of birth at sign-up', () => {
    const { auth } = build('dev');
    auth.hasResourceProperties('AWS::Cognito::UserPool', {
      Schema: Match.arrayWith([Match.objectLike({ Name: 'birthdate', Required: true })]),
    });
  });
});
