/* eslint-disable camelcase */
import * as fs from "node:fs";
import * as blocks from "../utils/block-defaults";
import * as crypto from "node:crypto";
import { ConfigIniParser } from "config-ini-parser";
import { getSecretsFromIniFile, getVarsFromIniFile } from "./io";

export const diggerJsonPath = `${process.cwd()}/dgctl.json`;
export const diggerAPIKeyPath = `${process.cwd()}/.dgctl`;

export const diggerJsonExists = () => {
  return fs.existsSync(diggerJsonPath);
};

export const diggerJson = () => {
  const rawContent = fs.readFileSync(diggerJsonPath, "utf8");
  return JSON.parse(rawContent);
};

export const updateDiggerJson = (obj: unknown) => {
  fs.writeFileSync(diggerJsonPath, JSON.stringify(obj, null, 4));
};

export const diggerAPIKeyExists = () => {
  return fs.existsSync(diggerAPIKeyPath);
};

export const diggerAPIKey = () => {
  return fs.readFileSync(diggerAPIKeyPath, "utf8");
};

export const writeDiggerApiKey = (key: string) => {
  fs.writeFileSync(diggerAPIKeyPath, key);
};

const stubbedTerraformContent = (
  blockName: string,
  aws_app_identifier: string
) => {
  return `resource "aws_db_instance" "${blockName}" {
    identifier = "database"
    allocated_storage = 100
    instance_class = "db.t3.micro"
    engine = "postgres"
    username = "digger"
    password = "REPLACEME"
    db_name = "digger"
    backup_window = "03:42-04:12"
    backup_retention_period = 0
    availability_zone = "us-east-1b"
    maintenance_window = "fri:08:50-fri:09:20"
    multi_az = false
    engine_version = "12.11"
    auto_minor_version_upgrade = true
    license_model = "postgresql-license"
    publicly_accessible = false
    storage_type = "gp2"
    port = 5432
    storage_encrypted = false
    copy_tags_to_snapshot = false
    monitoring_interval = 0
    iam_database_authentication_enabled = false
    deletion_protection = false
    db_subnet_group_name = "database_rds_subnet_group20230103112856656500000010"
    vpc_security_group_ids = []
    tags = {
        "digger_id": "${aws_app_identifier}"
    }
}

resource "aws_db_subnet_group" "RDSDBSubnetGroup" {
    description = "Managed by Terraform"
    name = "database_rds_subnet_group20230103112856656500000010"
    subnet_ids = []
}

output "database_endpoint" {
    value = aws_db_instance.${blockName}.endpoint
}
`;
};

export const importBlock = (blockName: string, id: string) => {
  const currentDiggerJson = diggerJson();
  const awsIdentifier = `${blockName}-${crypto.randomBytes(4).toString("hex")}`;
  fs.mkdirSync(`${process.cwd()}/${blockName}`);
  const tfFileName = "terraform.tf";
  const tfFileLocation = `${process.cwd()}/${blockName}/${tfFileName}`;
  fs.writeFileSync(
    tfFileLocation,
    stubbedTerraformContent(blockName, awsIdentifier)
  );

  updateDiggerJson({
    ...currentDiggerJson,
    blocks: [
      ...(currentDiggerJson.blocks ?? []),
      {
        aws_app_identifier: awsIdentifier,
        name: blockName,
        // Better logic to determine type based on top-level type since for resources it differs
        type: "imported",
      },
    ],
  });
  fs.writeFileSync(
    `${process.cwd()}/${blockName}/config.json`,
    JSON.stringify(
      {
        imported_id: id,
        terraform_file: tfFileName,
      },
      null,
      4
    )
  );
};

export const createBlock = ({
  type,
  name,
  extraOptions,
  blockDefault,
}: {
  type: string;
  name: string;
  extraOptions?: any;
  blockDefault?: any;
}) => {
  const currentDiggerJson = diggerJson();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const defaults = blockDefault ?? blocks[type];

  const awsIdentifier = `${name}-${crypto.randomBytes(4).toString("hex")}`;

  updateDiggerJson({
    ...currentDiggerJson,
    blocks: [
      ...(currentDiggerJson.blocks ?? []),
      {
        aws_app_identifier: awsIdentifier,
        name: name,
        // Better logic to determine type based on top-level type since for resources it differs
        type: type === "container" || type === "vpc" ? type : "resource",
        ...extraOptions,
      },
    ],
  });

  fs.mkdirSync(`${process.cwd()}/${name}`);

  fs.writeFileSync(
    `${process.cwd()}/${name}/config.json`,
    JSON.stringify(defaults, null, 4)
  );
  fs.writeFileSync(`${process.cwd()}/${name}/dgctl.secrets.ini`, "");
  fs.writeFileSync(`${process.cwd()}/${name}/dgctl.variables.ini`, "");
  fs.writeFileSync(`${process.cwd()}/${name}/dgctl.overrides.tf`, "");
};

export const registerBlock = (blockType: string, blockName: string) => {
  const currentDiggerJson = diggerJson();
  const awsIdentifier = `${blockName}-${crypto.randomBytes(4).toString("hex")}`;

  updateDiggerJson({
    ...currentDiggerJson,
    blocks: [
      ...(currentDiggerJson.blocks ?? []),
      {
        aws_app_identifier: awsIdentifier,
        name: blockName,
        // Better logic to determine type based on top-level type since for resources it differs
        type:
          blockType === "container" || blockType === "vpc"
            ? blockType
            : "resource",
      },
    ],
  });
};

export const recreateBlockFromJson = (blockName: string) => {
  const currentDiggerJson = diggerJson();
  const currentBlock = currentDiggerJson.blocks.find(
    ({ name }: { name: string }) => blockName === name
  );

  const {
    type,
    custom_terraform,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    aws_app_identifier,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    name,
    environment_variables,
    secrets,
    ...rest
  } = currentBlock;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const defaults = blocks[type];
  fs.mkdirSync(`${process.cwd()}/${blockName}`);

  fs.writeFileSync(
    `${process.cwd()}/${blockName}/config.json`,
    JSON.stringify({ ...defaults, ...rest }, null, 4)
  );
  fs.writeFileSync(`${process.cwd()}/${blockName}/dgctl.secrets.ini`, "");
  fs.writeFileSync(`${process.cwd()}/${blockName}/dgctl.variables.ini`, "");

  if (environment_variables) {
    writeEnvVars(environment_variables, blockName);
  }

  if (secrets) {
    writeSecrets(secrets, blockName);
  }

  if (custom_terraform) {
    fs.writeFileSync(
      `${process.cwd()}/${blockName}/dgctl.overrides.tf`,
      custom_terraform,
      "base64"
    );
  } else {
    fs.writeFileSync(`${process.cwd()}/${blockName}/dgctl.overrides.tf`, "");
  }
};

const writeEnvVars = (envVars: [], blockName: string) => {
  const parser = new ConfigIniParser();
  const iniFile = fs.readFileSync(
    `${process.cwd()}/dgctl.variables.ini`,
    "utf8"
  );
  parser.parse(iniFile);

  if (blockName && !parser.isHaveSection(blockName)) {
    parser.addSection(blockName);
  }

  envVars.map(({ key, value }: any) => {
    return parser.set(blockName, key, value);
  });

  fs.writeFileSync(
    `${process.cwd()}/dgctl.variables.ini`,
    parser.stringify("\n")
  );
};

const writeSecrets = (secrets: object, blockName: string) => {
  const parser = new ConfigIniParser();
  const iniFile = fs.readFileSync(`${process.cwd()}/dgctl.secrets.ini`, "utf8");
  parser.parse(iniFile);

  if (blockName && !parser.isHaveSection(blockName)) {
    parser.addSection(blockName);
  }

  Object.entries(secrets).map(([key, value]: any) => {
    return parser.set(blockName, key, value);
  });

  fs.writeFileSync(
    `${process.cwd()}/dgctl.secrets.ini`,
    parser.stringify("\n")
  );
};

export const prepareBlockJson = (block: any) => {
  const configRaw = fs.readFileSync(
    `${process.cwd()}/${block.name}/config.json`,
    "utf8"
  );

  // read override.tf, base64 encode it and add as one item list in "custom_terraform" parameter to the block's json"

  const config = JSON.parse(configRaw);
  if (block.type === "imported") {
    const tfFileLocation = `${process.cwd()}/${block.name}/${
      config.terraform_file
    }`;
    config.custom_terraform = fs.readFileSync(`${tfFileLocation}`, "base64");
    delete config.terraform_files;
  }

  block.environment_variables = getVarsFromIniFile(
    "dgctl.variables.ini",
    block.name
  );
  block.secrets = getSecretsFromIniFile("dgctl.secrets.ini", block.name);

  const overridesPath = `${process.cwd()}/${block.name}/dgctl.overrides.tf`;
  if (fs.existsSync(overridesPath)) {
    const tfBase64 = fs.readFileSync(overridesPath, { encoding: "base64" });
    return {
      ...block,
      ...config,
      custom_terraform: tfBase64,
    };
  }

  return {
    ...block,
    ...config,
  };
};

export const gitIgnore = [
  ".archive",
  "generated/",
  "dgctl.generated.json",
  ".dgctl",
].join("\n");
