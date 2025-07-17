# フィッシュサバイバー - AWS CDKデプロイガイド

このプロジェクトは、ヴァンパイアサバイバー風のゲーム「フィッシュサバイバー」をAWS S3にデプロイするためのAWS CDKスタックを提供します。

## 前提条件

- [Node.js](https://nodejs.org/) (v14.x以上)
- [AWS CLI](https://aws.amazon.com/cli/) (インストールと設定済み)
- [AWS CDK](https://aws.amazon.com/cdk/) (v2.x)

## セットアップ手順

### 1. AWS CLIの設定

まだAWS CLIを設定していない場合は、以下のコマンドを実行して設定します：

```bash
aws configure
```

プロンプトに従って、AWS Access Key ID、Secret Access Key、デフォルトリージョン、出力形式を入力します。

### 2. AWS CDKのインストール

グローバルにAWS CDKをインストールします：

```bash
npm install -g aws-cdk
```

### 3. プロジェクトの依存関係をインストール

```bash
cd fish-survivor-cdk
npm install
```

### 4. AWS環境のブートストラップ

CDKを初めて使用する場合、または新しいAWSアカウント/リージョンで使用する場合は、環境をブートストラップする必要があります：

```bash
cdk bootstrap
```

## デプロイ手順

### 1. CDKスタックの合成

以下のコマンドを実行して、CloudFormationテンプレートを生成します：

```bash
cdk synth
```

### 2. CDKスタックのデプロイ

以下のコマンドを実行して、スタックをデプロイします：

```bash
cdk deploy
```

デプロイが完了すると、CloudFrontのURLが出力されます。このURLを使用してゲームにアクセスできます。

## ゲームの更新

ゲームのコードを変更した後、再デプロイするには：

```bash
cdk deploy
```

## スタックの削除

不要になったリソースを削除するには：

```bash
cdk destroy
```

## トラブルシューティング

### デプロイエラー

- **権限エラー**: AWS CLIの設定が正しいことを確認し、必要な権限があることを確認してください。
- **依存関係エラー**: `npm install`を再実行して、すべての依存関係が正しくインストールされていることを確認してください。

### ゲームが表示されない

- CloudFrontのキャッシュが古い可能性があります。数分待つか、キャッシュを無効化してください。
- S3バケットに正しくファイルがアップロードされているか確認してください。

## カスタマイズ

### バケット名の変更

`fish-survivor-cdk-stack.ts`ファイルの`bucketName`プロパティのコメントを解除し、希望するバケット名に変更します。

### リージョンの変更

`fish-survivor-cdk.ts`ファイルの`env`プロパティのコメントを解除し、希望するリージョンを設定します。

## 注意事項

- このプロジェクトは開発環境向けに設定されています。本番環境では、`removalPolicy`と`autoDeleteObjects`の設定を見直してください。
- CloudFrontディストリビューションの作成と削除には時間がかかる場合があります（20〜30分程度）。