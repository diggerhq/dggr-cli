import { CliUx, Flags } from '@oclif/core'
import chalk = require('chalk')
import { execSync } from 'node:child_process'
import { lookpath } from 'lookpath'
import { getAwsCreds } from '../../utils/aws'
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
    const url = terraformOutputs[args.name].value.lb_dns;
    const ecrRepoUrl =
      terraformOutputs[args.name].value.docker_registry_url;
    const ecsClusterName =
      terraformOutputs[args.name].value.ecs_cluster_name;
    const awsProfile = "default";

    if (flags.displayOnly) {
      this.log(
        `To build this application, in the folder containing the Dockerfile run:`
      );
      this.log(
        chalk.green(`aws ecr get-login-password --region ${region} --profile ${awsProfile} | 
      docker login --username AWS --password-stdin ${ecrRepoUrl}`)
      );
      this.log(chalk.green(`docker build -t ${ecrRepoUrl} .`));
      this.log(chalk.green(`docker push ${ecrRepoUrl}:latest`));
      this.log(
        chalk.green(
          `aws ecs update-service --cluster ${ecsClusterName} --service ${ecsClusterName} --profile ${awsProfile} --force-new-deployment`
        )
      );

      this.log(`The block is accessible in this url: ${url}`);
    } else {
      const { awsProfile } = await getAwsCreds(flags.profile);
      this.log(
        `[INFO] Using profile from aws credentials file: ${awsProfile}`
      );

      this.log(
        chalk.blueBright(`[INFO] Logging to ECR registry ${ecrRepoUrl}`)
      );
      execSync(
        `aws ecr get-login-password --region ${region} --profile ${awsProfile} | 
                  docker login --username AWS --password-stdin ${ecrRepoUrl}`,
        {
          stdio: [process.stdin, process.stdout, process.stderr],
          cwd: codeDirectory,
        }
      );
      this.log(
        chalk.blueBright(`[INFO] Building docker image at ${codeDirectory}`)
      );
      execSync(`docker build -t ${ecrRepoUrl} .`, {
        stdio: [process.stdin, process.stdout, process.stderr],
        cwd: codeDirectory,
      });
      this.log(chalk.blueBright(`[INFO] Pushing docker image`));
      execSync(`docker push ${ecrRepoUrl}:latest`, {
        stdio: [process.stdin, process.stdout, process.stderr],
        cwd: codeDirectory,
      });
      this.log(chalk.blueBright(`[INFO] Triggering ECS deployment`));
      execSync(
        `aws ecs update-service \
                  --cluster ${ecsClusterName} \
                  --service ${ecsClusterName}\
                  --profile ${awsProfile} \
                  --region ${region} \
                  --force-new-deployment`,
        {
          cwd: codeDirectory,
        }
      );

      this.log(
        chalk.greenBright(`Success! Your app is deployed at ${url}`)
      );
    }
    var pipeline = `build_docker_image:
  stage: build_docker_image
  image: docker:latest
  before_script:
    - apk add --no-cache python3 py3-pip git aws-cli
  services:
    - "docker:dind"
  script:
    - export AWS_ACCESS_KEY_ID=$DIGGER_AWS_KEY_ID
    - export AWS_SECRET_ACCESS_KEY=$DIGGER_AWS_SECRET_ACCESS_KEY
    - export AWS_DEFAULT_REGION=us-east-1
    - aws sts get-caller-identity
    - export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query "Account" --output text)"
    - export AWS_REGION=us-east-1
    - export ECR_REPO=notifications-service
    - aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    - docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO .
    - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
  only:
    - feature/dockerize-app
    ``

    this.log(pipeilne)

    trackEvent("block genpipeline successful", { flags, args, diggerConfig });
  }
}
