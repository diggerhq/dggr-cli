import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {
  CreateBucketCommand,
  ListBucketsCommand,
  PutBucketEncryptionCommand,
  PutBucketVersioningCommand, PutPublicAccessBlockCommand,
  S3Client,
} from "@aws-sdk/client-s3";


const ddbClient = new DynamoDB({region: "us-east-1"});

const s3Client = new S3Client({region: "us-east-1"});
const createBucket = async (s3Client: S3Client, bucketName: string) => {
  // Create the parameters for calling createBucket
  const bucketParams = {
    Bucket: bucketName
  };

  let bucketExists = false;

  const bucketsList = await s3Client.send(new ListBucketsCommand({}));
  if (bucketsList && bucketsList?.Buckets) {
    for (const element of bucketsList?.Buckets) {
      if (element.Name == bucketName) bucketExists = true
    }
  }


  if (bucketExists) {
    console.log(`S3 bucket ${bucketName} already exists.`)
    return
  }

  // call S3 to create the bucket
  try {
    await s3Client.send(new CreateBucketCommand(bucketParams));
  } catch (error) {
    console.log("Error:", error);
    return
  }

  console.log(`Bucket ${bucketName} created successfully.`);

  const versioningParams = {
    Bucket: bucketName,
    VersioningConfiguration: {
      MFADelete: 'Disabled',
      Status: 'Enabled'
    },
  };

  try {
    await s3Client.send(new PutBucketVersioningCommand(versioningParams));
  } catch (error) {
    console.log("Error:", error);
    return
  }

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
          BucketKeyEnabled: true
        },
      ]
    },
  };

  try {
    await s3Client.send(new PutBucketEncryptionCommand(encryptionParams));
  } catch (error) {
    console.log("Error:", error);
    return
  }

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

  try {
    await s3Client.send(new PutPublicAccessBlockCommand(publicAccessParams));
  } catch (error) {
    console.log("Error:", error);
    return
  }

  console.log(`Public access disabled for ${bucketName} bucket.`);
}

const createDynamoDB = async (ddbClient: DynamoDB, ddbTableName: string) => {

  let ddbTableExists = false;

  const data = await ddbClient.listTables({})
  if (data && data?.TableNames ) {
    for (const tableName of data?.TableNames) {
      if (tableName == ddbTableName) ddbTableExists = true
    }
  }

  if (ddbTableExists) {
    console.log(`DynamoDB table ${ddbTableName} already exists.`)
    return
  }

  const params = {
    TableName: ddbTableName,
    KeySchema: [
      {AttributeName: "LockID", KeyType: "HASH"},
    ],
    AttributeDefinitions: [
      {AttributeName: "LockID", AttributeType: "S"}
    ],
    BillingMode: "PAY_PER_REQUEST"
  };

  ddbClient.createTable(params, function (err: any, data: any) {
    if (err) {
      if (err.name == "ResourceInUseException") {
        // table already exist, do nothing
        console.log(`DynamoDB table ${params.TableName} already exists, skipping creation.`)
      } else {
        console.log("Error", err.name);
      }
    } else {
      console.log(`DynamoDB table ${params.TableName} has been created successfully.`)
    }
  });
}

export const createRemoteState = async (diggerConfig: any) => {
  if (diggerConfig.remote_state !== "local") {
    const ddbTableName = "digger-terraform-state-lock"
    const bucketName = 'digger-remote-state-bucket';
    createBucket(s3Client, bucketName)
    createDynamoDB(ddbClient, ddbTableName)
  }
};
