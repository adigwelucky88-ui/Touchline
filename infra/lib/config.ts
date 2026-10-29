/** Per-environment settings. Each environment deploys into its own AWS account. */

export type EnvName = 'dev' | 'staging' | 'prod';

export interface EnvConfig {
  name: EnvName;
  /** Set via CDK context or CDK_DEFAULT_ACCOUNT; undefined keeps stacks environment-agnostic for synth. */
  account?: string;
  region: string;
  /** NAT gateways: one is enough outside prod. */
  natGateways: number;
  /** Aurora Serverless v2 capacity in ACUs. */
  dbMinCapacity: number;
  dbMaxCapacity: number;
  /** Adds a reader instance for failover. */
  dbReader: boolean;
  apiDesiredCount: number;
  apiCpu: number;
  apiMemoryMiB: number;
  /** Retain data stores when a stack is deleted. */
  retainData: boolean;
  /** Origins allowed to upload directly to S3 and call the API from browsers. */
  webOrigins: string[];
}

const base = {
  region: 'eu-west-2',
} as const;

export const ENVIRONMENTS: Record<EnvName, Omit<EnvConfig, 'account'>> = {
  dev: {
    ...base,
    name: 'dev',
    natGateways: 1,
    dbMinCapacity: 0.5,
    dbMaxCapacity: 2,
    dbReader: false,
    apiDesiredCount: 1,
    apiCpu: 256,
    apiMemoryMiB: 512,
    retainData: false,
    webOrigins: ['http://localhost:8081', 'http://localhost:3001'],
  },
  staging: {
    ...base,
    name: 'staging',
    natGateways: 1,
    dbMinCapacity: 0.5,
    dbMaxCapacity: 4,
    dbReader: false,
    apiDesiredCount: 1,
    apiCpu: 512,
    apiMemoryMiB: 1024,
    retainData: true,
    webOrigins: ['https://staging.touchline.app'],
  },
  prod: {
    ...base,
    name: 'prod',
    natGateways: 2,
    dbMinCapacity: 1,
    dbMaxCapacity: 16,
    dbReader: true,
    apiDesiredCount: 2,
    apiCpu: 1024,
    apiMemoryMiB: 2048,
    retainData: true,
    webOrigins: ['https://touchline.app'],
  },
};

export function resolveConfig(name: string | undefined, account: string | undefined): EnvConfig {
  const envName = (name ?? 'dev') as EnvName;
  const config = ENVIRONMENTS[envName];
  if (!config) throw new Error(`Unknown environment "${name}". Use one of: ${Object.keys(ENVIRONMENTS).join(', ')}`);
  return { ...config, account };
}
