import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class FishSurvivorCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3バケットの作成（静的ウェブサイトホスティング用）
    const websiteBucket = new s3.Bucket(this, 'FishSurvivorWebsiteBucket', {
      // バケット名は自動生成されますが、特定の名前を指定する場合は以下のようにします
      // bucketName: 'my-fish-survivor-game',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // セキュリティのためパブリックアクセスをブロック
      removalPolicy: cdk.RemovalPolicy.DESTROY, // スタック削除時にバケットも削除（開発環境用）
      autoDeleteObjects: true, // スタック削除時にオブジェクトも削除（開発環境用）
    });

    // CloudFront Origin Access Identity (OAI) の作成
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: 'Allow CloudFront to access the S3 bucket',
    });

    // S3バケットポリシーの設定（CloudFrontからのアクセスを許可）
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        principals: [
          new iam.CanonicalUserPrincipal(
            originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // CloudFrontディストリビューションの作成
    const distribution = new cloudfront.Distribution(this, 'FishSurvivorDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // S3バケットへのデプロイ
    new s3deploy.BucketDeployment(this, 'DeployFishSurvivorWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../fish-survivor'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // 出力
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'The URL of the Fish Survivor game',
    });
  }
}