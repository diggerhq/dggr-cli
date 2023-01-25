import { Flags } from '@oclif/core'
import { diggerJson } from '../../utils/helpers'
import { trackEvent } from '../../utils/mixpanel'
import { tfOutput } from '../../utils/terraform'
import { BaseCommand } from '../../base'

export default class Genpipeline extends BaseCommand<typeof Genpipeline>  {
  static description = 'Generate pipeline for your block'

  static flags = {
    provider: Flags.string({
      char: "p",
      description: "The CI provider",
      options: ["github", "gitlab"],
    }),
  }

  static args = [{name: 'name'}]

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Genpipeline)

    trackEvent("block genpipeline called", { flags, args });
    // const terraform = (await lookpath("terraform")) ?? "terraform";


    if (!args.name) {
      this.log("No application name provided");
      return;
    }

    const diggerConfig = diggerJson();
    const infraDirectory = "generated";
    const region = diggerConfig.aws_region;
    const terraformOutputs = await tfOutput(infraDirectory);
    const ecrRepoUrl =
      terraformOutputs[args.name].value.docker_registry_url;
    const clusterName = terraformOutputs[args.name].value.ecs_cluster_name;
    const serviceName = terraformOutputs[args.name].value.ecs_service_name;
  
    if (flags.provider === "gitlab") {
        const pipeline = 
        `stages:\n`+
        `  - deploy\n\n`+
        `deploy:\n`+
        `  stage: deploy\n`+
        `  image: docker:latest\n`+
        `  before_script:\n`+
        `    - apk add --no-cache python3 py3-pip git aws-cli\n`+
        `  services:\n`+
        `    - "docker:dind"\n`+
        `  script:\n`+
        `    - export AWS_ACCESS_KEY_ID=$DIGGER_AWS_KEY_ID\n`+
        `    - export AWS_SECRET_ACCESS_KEY=$DIGGER_AWS_SECRET_ACCESS_KEY\n`+
        `    - export AWS_DEFAULT_REGION=${region}\n`+
        `    - aws sts get-caller-identity\n`+
        `    - export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query "Account" --output text)"\n`+
        `    - export AWS_REGION=${region}\n`+
        `    - export ECR_REPO=notifications-service\n`+
        `    - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com\n`+
        `    - docker build -t ${ecrRepoUrl} .\n`+
        `    - docker push ${ecrRepoUrl}:latest\n`+
        `    - aws ecs update-service --cluster ${clusterName} --service ${serviceName} --force-new-deployment\n`+
        `  only:\n`+
        `    - main`
        
            this.log(pipeline)
    } else {
        this.log("Only gitlab provider currently supported")
    }
    

    trackEvent("block genpipeline successful", { flags, args, diggerConfig });
  }
}
