import * as cdk from 'aws-cdk-lib/core';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import type { EnvConfig } from './config';

export interface MediaStackProps extends cdk.StackProps {
  config: EnvConfig;
}

/**
 * Video storage and delivery:
 * - raw bucket: clients upload originals here with presigned multipart URLs; never public.
 * - processed bucket: HLS renditions and thumbnails written by MediaConvert.
 * - CloudFront: the only way to read processed media.
 *
 * The processing workflow (EventBridge → Step Functions → MediaConvert → Rekognition) is
 * phase 3; the raw bucket already emits EventBridge events for it.
 */
export class MediaStack extends cdk.Stack {
  readonly rawBucket: s3.Bucket;
  readonly processedBucket: s3.Bucket;
  readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: MediaStackProps) {
    super(scope, id, props);
    const { config } = props;
    const removal = config.retainData
      ? { removalPolicy: cdk.RemovalPolicy.RETAIN }
      : { removalPolicy: cdk.RemovalPolicy.DESTROY, autoDeleteObjects: true };

    this.rawBucket = new s3.Bucket(this, 'RawUploads', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      eventBridgeEnabled: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT],
          allowedOrigins: config.webOrigins,
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        { abortIncompleteMultipartUploadAfter: cdk.Duration.days(2) },
        // Originals are kept only until processing and moderation finish.
        { expiration: cdk.Duration.days(30) },
      ],
      ...removal,
    });

    this.processedBucket = new s3.Bucket(this, 'ProcessedMedia', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      ...removal,
    });

    this.distribution = new cloudfront.Distribution(this, 'MediaCdn', {
      comment: `touchline-${config.name} media`,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.processedBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
        // TODO(phase 3): trusted key group for signed cookies on non-public videos.
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
    });

    new cdk.CfnOutput(this, 'MediaCdnUrl', { value: `https://${this.distribution.distributionDomainName}` });
  }
}
