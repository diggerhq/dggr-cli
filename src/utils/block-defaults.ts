const sharedDefaults = {
};

export const vpc = {
  ...sharedDefaults,
  target: "diggerhq/target-network-module@main",
  // eslint-disable-next-line camelcase
  enable_vpc_endpoints: true,
  // eslint-disable-next-line camelcase
  enable_dns_hostnames: false,
  // eslint-disable-next-line camelcase
  enable_dns_support: true,
  // eslint-disable-next-line camelcase
  one_nat_gateway_per_az: true,
  // eslint-disable-next-line camelcase
  enable_nat_gateway: true
};

export const container = {
  ...sharedDefaults,
  target: 'diggerhq/target-ecs-module@dev',
  // eslint-disable-next-line camelcase
  task_memory: 512,
  // eslint-disable-next-line camelcase
  task_cpu: 256,
  // eslint-disable-next-line camelcase
  container_port: 8000,
  // eslint-disable-next-line camelcase
  load_balancer: true,
  internal: false,
  // eslint-disable-next-line camelcase
  health_check: "/",
  // eslint-disable-next-line camelcase
  health_check_matcher: '200-499',
  // eslint-disable-next-line camelcase
  launch_type: 'FARGATE',
  // eslint-disable-next-line camelcase
  monitoring_enabled: false,
  // eslint-disable-next-line camelcase
  lb_monitoring_enabled: false
};

export const mysql = { ...sharedDefaults };

export const postgres = { ...sharedDefaults };

export const docdb = { ...sharedDefaults };

export const redis = { ...sharedDefaults };
