// src/baseCommand.ts
import {Command, Flags, Interfaces} from '@oclif/core'
import { track_event } from '../utils/mixpanel';
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");



export type Flags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCommand['globalFlags'] & T['flags']>

export abstract class BaseCommand<T extends typeof Command> extends Command {

  protected flags!: Flags<T>
  protected sentryTransaction : any

  public async init(): Promise<void> {
    console.log("initializing sentry")
    Sentry.init({
        dsn: "https://caf828c78be346f9b48897d792380542@o1089681.ingest.sentry.io/4504391811137536",      
        tracesSampleRate: 1.0,
      });
  
      this.sentryTransaction = Sentry.startTransaction({
          op: "test",
          name: "My First Test Transaction",
    });
  }

  protected async catch(err: Error & {exitCode?: number}): Promise<any> {
    console.log("sending error to mixpanel")
      track_event("an error occured", {err})
      
    console.log("capturing exception")
    Sentry.captureException(err);
    this.sentryTransaction.finish();

    await new Promise(r => setTimeout(r, 200));
    return super.catch(err)
  }

  protected async finally(_: Error | undefined): Promise<any> {
    console.log("sentry transaction being sent")
    return super.finally(_)
  }
}