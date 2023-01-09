
export const SENTRY_DSN = "https://caf828c78be346f9b48897d792380542@o1089681.ingest.sentry.io/4504391811137536"

export const MIXPANEL_TOKEN = "48099e85f3813b7b22eaa082f514d8ca"

export function getTrowelUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return "https://sggo2t6ck5bpznc64hpmwf2h7q0egvwr.lambda-url.us-east-1.on.aws/"
  }

  return "https://ctr3tfpzwdaivs56nbifwk6joq0qqjaj.lambda-url.us-east-1.on.aws/"
}