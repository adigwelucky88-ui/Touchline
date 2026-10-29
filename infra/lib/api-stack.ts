import * as cdk from 'aws-cdk-lib/core';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

import type { EnvConfig } from './config';

export interface ApiStackProps extends cdk.StackProps {
  config: EnvConfig;
  vpc: ec2.IVpc;
  database: rds.DatabaseCluster;
  databaseSecurityGroup: ec2.SecurityGroup;
  rawBucket: s3.IBucket;
  processedBucket: s3.IBucket;
  mediaDistribution: cloudfront.IDistribution;
}

/**
 * NestJS API on ECS Fargate behind an ALB. CI builds backend/Dockerfile, pushes it to the
 * repository below and deploys with `-c imageTag=<git sha>`.
 */
export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    const { config, vpc, database } = props;

    const repository = new ecr.Repository(this, 'ApiRepository', {
      repositoryName: `touchline-api-${config.name}`,
      imageScanOnPush: true,
      lifecycleRules: [{ maxImageCount: 20 }],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const imageTag = this.node.tryGetContext('imageTag') ?? 'latest';
    const secret = database.secret!;

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Api', {
      cluster: new ecs.Cluster(this, 'Cluster', { vpc, containerInsightsV2: ecs.ContainerInsights.ENABLED }),
      taskSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      desiredCount: config.apiDesiredCount,
      cpu: config.apiCpu,
      memoryLimitMiB: config.apiMemoryMiB,
      circuitBreaker: { rollback: true },
      // TODO(phase 2): attach the domain's ACM certificate and redirect HTTP to HTTPS.
      publicLoadBalancer: true,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository, imageTag),
        containerPort: 3000,
        environment: {
          NODE_ENV: 'production',
          PORT: '3000',
          CORS_ORIGINS: config.webOrigins.join(','),
          MEDIA_CDN_URL: `https://${props.mediaDistribution.distributionDomainName}`,
          RAW_BUCKET: props.rawBucket.bucketName,
          DB_HOST: database.clusterEndpoint.hostname,
          DB_PORT: String(database.clusterEndpoint.port),
          DB_NAME: 'touchline',
        },
        secrets: {
          DB_USER: ecs.Secret.fromSecretsManager(secret, 'username'),
          DB_PASSWORD: ecs.Secret.fromSecretsManager(secret, 'password'),
        },
      },
    });

    service.targetGroup.configureHealthCheck({ path: '/v1/health' });

    const scaling = service.service.autoScaleTaskCount({
      minCapacity: config.apiDesiredCount,
      maxCapacity: config.apiDesiredCount * 4,
    });
    scaling.scaleOnCpuUtilization('Cpu', { targetUtilizationPercent: 60 });

    // Declared in this stack (not via addIngressRule on the Data stack's group) to avoid a cross-stack cycle.
    new ec2.CfnSecurityGroupIngress(this, 'DbIngressFromApi', {
      groupId: props.databaseSecurityGroup.securityGroupId,
      sourceSecurityGroupId: service.service.connections.securityGroups[0]!.securityGroupId,
      ipProtocol: 'tcp',
      fromPort: database.clusterEndpoint.port,
      toPort: database.clusterEndpoint.port,
      description: 'API tasks',
    });
    props.rawBucket.grantPut(service.taskDefinition.taskRole);
    props.processedBucket.grantRead(service.taskDefinition.taskRole);

    new cdk.CfnOutput(this, 'ApiUrl', { value: `http://${service.loadBalancer.loadBalancerDnsName}` });
    new cdk.CfnOutput(this, 'ApiRepositoryUri', { value: repository.repositoryUri });
  }
}
