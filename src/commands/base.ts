// src/baseCommand.ts
import { Command, Flags, Interfaces } from "@oclif/core";
import { trackEvent } from "../utils/mixpanel";
import * as Sentry from "@sentry/node";
import { SENTRY_DSN } from "../config";

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  typeof BaseCommand["globalFlags"] & T["flags"]
>;

export abstract class BaseCommand<T extends typeof Command> extends Command {
  protected flags!: Flags<T>;

  public async init(): Promise<void> {
    if (process.env.NODE_ENV === "production") {
      Sentry.init({ dsn: SENTRY_DSN });
    }

    return super.init();
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    if (process.env.NODE_ENV === "production") {
      trackEvent("an error occured", { err });
      Sentry.captureException(err);
    }

    return super.catch(err);
  }

  protected async finally(err: Error | undefined): Promise<any> {
    if (process.env.NODE_ENV === "production") {
      Sentry.close(10_000);
    }

    return super.finally(err);
  }
}
