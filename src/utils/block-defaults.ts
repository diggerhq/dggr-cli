const sharedDefaults = {
};

export const vpc = {
  ...sharedDefaults,
  target: "diggerhq/target-network-module@main",
  // eslint-disable-next-line camelcase
  enable_vpc_endpoints: false,
  // eslint-disable-next-line camelcase
  enable_dns_hostnames: false,
  // eslint-disable-next-line camelcase
  enable_dns_support: false,
  // eslint-disable-next-line camelcase
  one_nat_gateway_per_az: false,
  // eslint-disable-next-line camelcase
  enable_nat_gateway: false
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

export const mysql = {
  ...sharedDefaults,
  target: "diggerhq/target-rds-module@dev",
  resource_type: "database",
  connection_schema: "mysql",
  rds_engine: "mysql",
  rds_engine_version: "8.0.30",
  rds_instance_class: "db.t3.micro"  
  
};

export const postgres = { 
  ...sharedDefaults,
  target: "diggerhq/target-rds-module@dev",
  resource_type: "database",
  connection_schema: "postgres",
  rds_engine: "postgres",
  rds_engine_version: "14.4",
  rds_instance_class: "db.t3.micro"
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
