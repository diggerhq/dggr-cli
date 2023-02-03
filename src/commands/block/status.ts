import { Args, Flags } from '@oclif/core'
import { lookpath } from 'lookpath'
import { BaseCommand } from '../../base'
import { trackEvent } from '../../utils/mixpanel'

export default class Status extends BaseCommand<typeof Status> {
  static description = 'Status of the block'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    profile: Flags.string({
      char: "p",
      description: "AWS profile to use",
      default: undefined,
    }),
    "no-input": Flags.boolean({
      char: "n",
      description: "Skip prompts",
      default: false,
    }),    
    region: Flags.string({
      char: "r",
      description: "AWS region to use"
    }),
  }

  static args = {name: Args.string()}

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Status)
  
    trackEvent("block status called", { flags, args });
    

  }
}
