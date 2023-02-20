/* eslint-disable camelcase */
import * as fs from "node:fs";
import * as blockDefaults from "../utils/block-defaults" ;
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
  region,
  extraOptions,
  blockDefault,
  blockOnly,
}: {
  type: string;
  name: string;
  region: string;
  extraOptions?: any;
  blockDefault?: any;
  blockOnly?: boolean;
}) => {

  const defaults = blockDefault ?? blockDefaults[type as keyof typeof blockDefaults];

  const awsIdentifier = `${name}-${crypto.randomBytes(4).toString("hex")}`;

  if (!blockOnly) {
    const currentDiggerJson = diggerJson();

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
  }

  fs.mkdirSync(`${process.cwd()}/${name}`);

  fs.writeFileSync(
    `${process.cwd()}/${name}/config.json`,
    JSON.stringify(
      {
        ...defaults,
        type,
      },
      null,
      4
    )
  );
  fs.writeFileSync(
    `${process.cwd()}/${name}/regions.json`,
    JSON.stringify(
      {
        [region]: {
          config_overrides: {},
        }
      },
      null,
      4
    )
  )
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

  const { custom_terraform, environment_variables, secrets, aws_regions } = currentBlock;

  fs.mkdirSync(`${process.cwd()}/${blockName}`);

  fs.writeFileSync(
    `${process.cwd()}/${blockName}/config.json`,
    JSON.stringify(currentBlock, null, 4)
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

  if (aws_regions) {
    fs.writeFileSync(
      `${process.cwd()}/${blockName}/regions.tf`,
      aws_regions,
      "utf8"
    );
  }
};

export const recreateAddonFromJson = (blockName: string, addonType: string, options: any) => {
  fs.writeFileSync(
    `${process.cwd()}/${blockName}/${addonType}.json`,
    JSON.stringify(options, null, 4)
  );
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

export const combinedDiggerJson = () => {
  const currentDiggerJson = diggerJson();

  const mergedBlocks = currentDiggerJson.blocks.map((block: any) => {
    return prepareBlockJson(block);
  });

  const mergedAddons = currentDiggerJson.addons.map((addon: any) => {
    return prepareAddonJson(addon);
  })

  return {
    ...currentDiggerJson,
    environment_variables: getVarsFromIniFile("dgctl.variables.ini", null),
    secrets: getSecretsFromIniFile("dgctl.secrets.ini", null),
    blocks: mergedBlocks,
    addons: mergedAddons,
  };
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

  const awsRegionsRaw = fs.readFileSync(
    `${process.cwd()}/${block.name}/regions.json`,
    "utf8"
  );

  const awsRegions = JSON.parse(awsRegionsRaw);

  block.aws_regions = awsRegions

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

export const prepareAddonJson = (addon: any) => {
  const configRaw = fs.readFileSync(
    `${process.cwd()}/${addon.block_name}/${addon.type}.json`,
    "utf8"
  );
  const config = JSON.parse(configRaw);
  return {
    ...addon,
    ...config,
  };
};

export const createAddon = ({
  type,
  blockName,
  options
}: {
  type: string;
  blockName: string;
  options: any;
}) => {
  const currentDiggerJson = diggerJson();

  const addons = currentDiggerJson.addons ?? [];

  const existingAddon = addons.find((addon: any) => addon.block_name === blockName && addon.type === type);
  if (existingAddon) {
    addons.splice(addons.indexOf(existingAddon), 1);
  }


  updateDiggerJson({
    ...currentDiggerJson,
    addons: [
      ...(currentDiggerJson.addons ?? []),
      {
        block_name: blockName,
        type: type,
      },
    ],
  });
  fs.writeFileSync(
    `${process.cwd()}/${blockName}/${type}.json`,
    JSON.stringify(options, null, 4)
  );
};

export const createOrUpdateVpc = (region: string, existing_region_configs: any) => {
  const currentCombinedDiggerJson = combinedDiggerJson();
  const existingVpc = currentCombinedDiggerJson.blocks.find((block: any) => block.name === "default_network");
  if (!existingVpc) {
    createBlock({type: "vpc", name: "default_network", region: region});
  }

  const updatedDiggerJson = combinedDiggerJson();
  const updatedVpc = updatedDiggerJson.blocks.find((block: any) => block.name === "default_network");
  createAddon({
    type: "regions",
    blockName: "default_network",
    options: {...existing_region_configs, ...updatedVpc.aws_regions},
  })
};


export function requiresVpc(type: string) {
  return ["container", "redis", "postgres", "mysql", "docdb"].includes(type);
}

export const gitIgnore = [
  ".archive",
  "generated/",
  "dgctl.generated.json",
  ".dgctl",
].join("\n");
