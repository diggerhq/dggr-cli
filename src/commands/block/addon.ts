/* eslint-disable max-depth */
import { Flags } from "@oclif/core";
import {
  combinedDiggerJson,
  createAddon,
  createBlock,
  createOrUpdateVpc,
  diggerJson,
} from "../../utils/helpers";
import { trackEvent } from "../../utils/mixpanel";
import { BaseCommand } from "../../base";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as inquirer from "inquirer-shortcuts";

export default class Addon extends BaseCommand<typeof Addon> {
  static description = "Addon to a block";

  static flags = {
    type: Flags.string({
      char: "t",
      description: "type of addon",
      options: ["routing", "regions"],
    }),
    block: Flags.string({
      char: "b",
      description: "block to add the addon to",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Addon);
    trackEvent("block addon called", { flags, args });
    if (!flags.type) {
      this.log(
        "No type provided for the addon. Example: dgctl block addon -t=routing -b=<block name>"
      );
      return;
    }

    const existingAddonForBlock =
      diggerJson().addons?.filter(
        (addon: any) =>
          addon.block_name === flags.block && addon.type === flags.type
      ) ?? [];

    if (existingAddonForBlock.length > 0) {
      const { confirmation } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmation",
          message: `Do you want to overwrite existing addon setting of type ${flags.type} for block ${flags.blockName} ?`,
        },
      ]);
      if (!confirmation) {
        return;
      }
    }

    const type = flags.type;
    const blockName = flags.block;
    try {

      const currentDiggerJson = combinedDiggerJson();
      if (type === "routing") {
        const { domainName } = await inquirer.prompt([
          {
            type: "input",
            name: "domainName",
            message: "Enter the domain name for the routing",
          },
        ]);

        const blockRegions = Object.keys(
          currentDiggerJson.blocks.find(
            (block: any) => block.name === blockName
          ).aws_regions
        );
        const answers = [];
        for (const region of blockRegions) {
          // eslint-disable-next-line no-await-in-loop
          const answer = await inquirer.prompt([
            {
              type: "list",
              name: "routingType",
              message: `What routing policy do you want to add for the block in region ${region}?`,
              choices: ["simple", "latency"],
            },
            {
              type: "input",
              name: "subdomain",
              message:
                "Enter the subdomain for the routing. Press enter if subdomain is not required",
            },
          ]);
          answers.push({
            region: region,
            // eslint-disable-next-line camelcase
            routing_type: answer.routingType,
            subdomain: answer.subdomain,
          });
        }

        createAddon({
          type: type,
          blockName: blockName,
          // eslint-disable-next-line camelcase
          options: { domain_name: domainName, routings: answers },
        });
      } else if (type === "regions") {
        const answers = await inquirer.prompt([
          {
            type: "checkbox",
            name: "regions",
            message: `Which regions you want to deploy to?`,
            choices: [
              { name: "US East (Ohio)", value: "us-east-2" },
              { name: "US East (N. Virginia)", value: "us-east-1" },
              { name: "US West (N. California)", value: "us-west-1" },
              { name: "US West (Oregon)", value: "us-west-2" },
              { name: "Asia Pacific (Mumbai)", value: "ap-south-1" },
              { name: "Asia Pacific (Seoul)", value: "ap-northeast-2" },
              { name: "Asia Pacific (Singapore)", value: "ap-southeast-1" },
              { name: "Asia Pacific (Sydney)", value: "ap-southeast-2" },
              { name: "Asia Pacific (Tokyo)", value: "ap-northeast-1" },
              { name: "Canada (Central)", value: "ca-central-1" },
              { name: "Europe (Frankfurt)", value: "eu-central-1" },
              { name: "Europe (Ireland)", value: "eu-west-1" },
              { name: "Europe (London)", value: "eu-west-2" },
              { name: "Europe (Paris)", value: "eu-west-3" },
              { name: "Europe (Stockholm)", value: "eu-north-1" },
              { name: "South America (São Paulo)", value: "sa-east-1" }
            ],
          }
        ]);
        
        const regionConfigs: { [key: string] : any } = {};

        for (const region of answers.regions) {
          regionConfigs[region] = {
            // eslint-disable-next-line camelcase
            config_overrides: {}
          };
        }

         
        const currentDiggerJson = combinedDiggerJson(); 
        const block = currentDiggerJson.blocks.find((block: any) => block.name === blockName);
        if (block?.type === "container" || ["redis", "postgres", "mysql", "docdb"].includes(block?.type)) {
          createOrUpdateVpc(answers.regions[0], regionConfigs)
        }
      

        createAddon({
          type: type,
          blockName: blockName,
          options: regionConfigs,
        });
      }
    } catch (error: any) {
      this.error(error);
    }
  }
}
