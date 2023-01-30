import { Flags } from "@oclif/core";
import { createAddon, diggerJson } from "../../utils/helpers";
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
      options: ["routing"],
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
      if (type === "routing") {
        const { domainName } = await inquirer.prompt([
          {
            type: "input",
            name: "domainName",
            message: "Enter the domain name for the routing",
          },
        ]);

        const currentDiggerJson = diggerJson();

        const blockRegions = currentDiggerJson.blocks
          .filter((block: any) => block.name === blockName)
          .map((block: any) => block.region);
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
      }
    } catch (error: any) {
      this.error(error);
    }
  }
}
