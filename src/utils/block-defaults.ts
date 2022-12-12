const sharedDefaults = {
  provider: "AWS",
  region: "us-west-1",
  mem: 512,
  cpu: 256,
  loadbalancer: true,
  internal: false,
  // eslint-disable-next-line camelcase
  health_check: "/",
};

export const container = { ...sharedDefaults };

export const mysql = { ...sharedDefaults };

export const postgres = { ...sharedDefaults };

export const docdb = { ...sharedDefaults };

export const redis = { ...sharedDefaults };
