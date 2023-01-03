/* eslint-disable camelcase */
const sharedDefaults = {};

export const vpc = {
  ...sharedDefaults,
  target: "diggerhq/target-network-module@main",
  enable_vpc_endpoints: false,
  enable_dns_hostnames: false,
  enable_dns_support: false,
  one_nat_gateway_per_az: false,
  enable_nat_gateway: false,
};

export const container = {
  ...sharedDefaults,
  target: "diggerhq/target-ecs-module@dev",
  task_memory: 512,
  task_cpu: 256,
  container_port: 8000,
  load_balancer: true,
  internal: false,
  health_check: "/",
  health_check_matcher: "200-499",
  launch_type: "FARGATE",
  monitoring_enabled: false,
  lb_monitoring_enabled: false,
};

export const mysql = {
  ...sharedDefaults,
  target: "diggerhq/target-rds-module@dev",
  resource_type: "database",
  connection_schema: "mysql",
  rds_engine: "mysql",
  rds_engine_version: "8.0.30",
  rds_instance_class: "db.t3.micro",
};

export const postgres = {
  ...sharedDefaults,
  target: "diggerhq/target-rds-module@dev",
  resource_type: "database",
  connection_schema: "postgres",
  rds_engine: "postgres",
  rds_engine_version: "14.4",
  rds_instance_class: "db.t3.micro",
};

export const docdb = {
  ...sharedDefaults,
  target: "diggerhq/target-docdb-module@dev",
  resource_type: "docdb",
};

export const redis = {
  ...sharedDefaults,
  target: "diggerhq/target-redis-module@dev",
  resource_type: "redis",
};
