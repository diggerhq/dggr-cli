import { DynamoDB } from "@aws-sdk/client-dynamodb";
import {
  CreateBucketCommand,
  ListBucketsCommand,
  PutBucketEncryptionCommand,
  PutBucketVersioningCommand,
  PutPublicAccessBlockCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const ddbClient = new DynamoDB({ region: "us-east-1" });

const s3Client = new S3Client({ region: "us-east-1" });
const createBucket = async (s3Client: S3Client, bucketName: string) => {
  // Create the parameters for calling createBucket
  const bucketParams = {
    Bucket: bucketName,
  };

  try {
    const bucketsList = await s3Client.send(new ListBucketsCommand({}));

    const bucketExists = bucketsList?.Buckets?.find(
      (bucket) => bucket.Name === bucketName
    );

    if (bucketExists) {
      console.log(`S3 bucket ${bucketName} already exists.`);
      return;
    }

    // call S3 to create the bucket
    await s3Client.send(new CreateBucketCommand(bucketParams));

    console.log(`Bucket ${bucketName} created successfully.`);

    const versioningParams = {
      Bucket: bucketName,
      VersioningConfiguration: {
        MFADelete: "Disabled",
        Status: "Enabled",
      },
    };

    await s3Client.send(new PutBucketVersioningCommand(versioningParams));

    console.log(`Versioning enabled for ${bucketName} bucket.`);

    const encryptionParams = {
      Bucket: bucketName,
      ServerSideEncryptionConfiguration: {
        Rules: [
          {
            ApplyServerSideEncryptionByDefault: {
              SSEAlgorithm: "aws:kms",
              //  KMSMasterKeyID: 'STRING_VALUE'
            },
            BucketKeyEnabled: true,
          },
        ],
      },
    };

    await s3Client.send(new PutBucketEncryptionCommand(encryptionParams));

    console.log(`Encryption enabled for ${bucketName} bucket.`);

    const publicAccessParams = {
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    };

    await s3Client.send(new PutPublicAccessBlockCommand(publicAccessParams));
  } catch (error) {
    console.log("Error:", error);
    return;
  }

  console.log(`Public access disabled for ${bucketName} bucket.`);
};

const createDynamoDB = async (ddbClient: DynamoDB, ddbTableName: string) => {
  const data = await ddbClient.listTables({});

  const ddbTableExists = data?.TableNames?.find(
    (table) => table === ddbTableName
  );

  if (ddbTableExists) {
    console.log(`DynamoDB table ${ddbTableName} already exists.`);
    return;
  }

  const params = {
    TableName: ddbTableName,
    KeySchema: [{ AttributeName: "LockID", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "LockID", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  };

  try {
    await ddbClient.createTable(params);

    console.log(
      `DynamoDB table ${params.TableName} has been created successfully.`
    );
  } catch (error: any) {
    if (error.name === "ResourceInUseException") {
      // table already exist, do nothing
      console.log(
        `DynamoDB table ${params.TableName} already exists, skipping creation.`
      );
    } else {
      console.log("Error", error.name);
    }
  }
};

export const createRemoteState = async (diggerConfig: any) => {
  if (diggerConfig.remote_state !== "local") {
    const ddbTableName = "digger-terraform-state-lock";
    const bucketName = "digger-remote-state-bucket";
    await createBucket(s3Client, bucketName);
    await createDynamoDB(ddbClient, ddbTableName);
  }
};
