import * as cdk from 'aws-cdk-lib/core';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

import type { EnvConfig } from './config';

export interface DataStackProps extends cdk.StackProps {
  config: EnvConfig;
  vpc: ec2.IVpc;
}

/** Aurora PostgreSQL Serverless v2 in isolated subnets. Credentials live in Secrets Manager. */
export class DataStack extends cdk.Stack {
  readonly cluster: rds.DatabaseCluster;
  readonly securityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);
    const { config, vpc } = props;

    this.securityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'Aurora PostgreSQL: ingress only from the API service',
      allowAllOutbound: false,
    });

    this.cluster = new rds.DatabaseCluster(this, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_17_5 }),
      defaultDatabaseName: 'touchline',
      credentials: rds.Credentials.fromGeneratedSecret('touchline'),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [this.securityGroup],
      serverlessV2MinCapacity: config.dbMinCapacity,
      serverlessV2MaxCapacity: config.dbMaxCapacity,
      writer: rds.ClusterInstance.serverlessV2('writer'),
      readers: config.dbReader ? [rds.ClusterInstance.serverlessV2('reader', { scaleWithWriter: true })] : [],
      storageEncrypted: true,
      backup: { retention: cdk.Duration.days(config.name === 'prod' ? 30 : 7) },
      deletionProtection: config.retainData,
      removalPolicy: config.retainData ? cdk.RemovalPolicy.SNAPSHOT : cdk.RemovalPolicy.DESTROY,
    });
  }
}
