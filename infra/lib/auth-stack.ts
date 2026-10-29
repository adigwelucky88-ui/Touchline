import * as cdk from 'aws-cdk-lib/core';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

import type { EnvConfig } from './config';

export interface AuthStackProps extends cdk.StackProps {
  config: EnvConfig;
}

/**
 * Cognito user pool. Date of birth is collected at sign-up; the API derives the age tier
 * (packages/core ageTier) and enforces guardian consent. Google and Sign in with Apple
 * identity providers are added once their credentials exist (phase 2).
 */
export class AuthStack extends cdk.Stack {
  readonly userPool: cognito.UserPool;
  readonly appClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);
    const { config } = props;

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `touchline-${config.name}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        birthdate: { required: true, mutable: false },
      },
      passwordPolicy: { minLength: 10, requireSymbols: false },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: { sms: false, otp: true },
      deletionProtection: config.retainData,
      removalPolicy: config.retainData ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Public client (mobile and web): authorization code flow with PKCE, no client secret.
    this.appClient = this.userPool.addClient('AppClient', {
      generateSecret: false,
      authFlows: { userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
        callbackUrls: ['touchline://auth', ...config.webOrigins.map((origin) => `${origin}/auth/callback`)],
        logoutUrls: ['touchline://signed-out', ...config.webOrigins],
      },
      preventUserExistenceErrors: true,
    });

    new cdk.CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new cdk.CfnOutput(this, 'AppClientId', { value: this.appClient.userPoolClientId });
  }
}
