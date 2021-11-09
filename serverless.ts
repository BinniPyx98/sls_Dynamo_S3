import type { AWS } from '@serverless/typescript';
import { authorizationConfig } from './config/serverless/parts/auth/auth';
import { getGalleryConfig } from './config/serverless/parts/gallery/gallery';
import { s3Config } from './config/serverless/parts/s3/s3';
import { galleryConfig } from './config/serverless/parts/tables/galleryTable';
import { restApiCorsConfig } from './config/serverless/parts/rest-api-cors';
import { joinParts } from './config/serverless/utils';

const masterConfig: AWS = {
  service: 'kalinichenko-sls',
  configValidationMode: 'warn',
  variablesResolutionMode: '20210326',
  unresolvedVariablesNotificationMode: 'error',
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: '${opt:stage, "dev"}',
    lambdaHashingVersion: '20201221',
    // @ts-ignore
    region: '${file(./env.yml):${self:provider.stage}.REGION}',
    profile: '${file(./env.yml):${self:provider.stage}.PROFILE}',
    environment: {
      STAGE: '${self:provider.stage}',
    },
    tags: {
      client: '${file(./env.yml):${self:provider.stage}.CLIENT}',
    },
    logs: {
      httpApi: true,
    },
    httpApi: {
      useProviderTags: true,
      payload: '2.0',
      cors: true,
    },
  },
  package: {
    individually: true,
    patterns: ['bin/*'],
  },
  custom: {
    webpack: {
      webpackConfig: 'webpack.config.js',
      includeModules: {
        forceExclude: ['aws-sdk'],
      },
      concurrency: 5,
      serializedCompile: true,
      packager: 'npm',
    },
    prune: {
      automatic: true,
      number: 3,
    },
    envFiles: ['env.yml'],
    envEncryptionKeyId: {
      local: '${file(./kms_key.yml):local}',
      dev: '${file(./kms_key.yml):dev}',
      test: '${file(./kms_key.yml):test}',
      prod: '${file(./kms_key.yml):prod}',
    },
  },
  plugins: [
    '@redtea/serverless-env-generator',
    'serverless-webpack',
    'serverless-offline-sqs',
    'serverless-offline',
    'serverless-prune-plugin',
  ],
};

module.exports = joinParts(masterConfig, [restApiCorsConfig, authorizationConfig, getGalleryConfig, galleryConfig]);
