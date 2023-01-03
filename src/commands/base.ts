// src/baseCommand.ts
import { Command, Flags, Interfaces } from "@oclif/core";
import { trackEvent } from "../utils/mixpanel";
import * as Sentry from "@sentry/node";

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  typeof BaseCommand["globalFlags"] & T["flags"]
>;

export abstract class BaseCommand<T extends typeof Command> extends Command {
  protected flags!: Flags<T>;
  protected sentryTransaction: any;

  public async init(): Promise<void> {
    Sentry.init({
      dsn: "https://caf828c78be346f9b48897d792380542@o1089681.ingest.sentry.io/4504391811137536",
      tracesSampleRate: 1,
    });

    this.sentryTransaction = Sentry.startTransaction({
      op: "test",
      name: "My First Test Transaction",
    });
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    trackEvent("an error occured", { err });
    Sentry.captureException(err);
    this.sentryTransaction.finish();
    // need to wait here otheriwse process gets killed before errors sent
    // TODO: Find cleaner solution
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((r) => setTimeout(r, 200));

    return super.catch(err);
  }

  protected async finally(_: Error | undefined): Promise<any> {
    return super.finally(_);
  }
}
