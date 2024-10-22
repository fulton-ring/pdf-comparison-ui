import * as Celery from "celery-ts";
import { env } from "~/env";

// TODO: move to env
const tcp = new Celery.RedisTcpOptions({
  host: env.CELERY_BROKER_HOST,
  protocol: "redis",
  port: parseInt(env.CELERY_BROKER_PORT),
  db: parseInt(env.CELERY_BROKER_DB),
});

const broker = new Celery.RedisBroker(tcp);
const backend = new Celery.RedisBackend(tcp);

export const getCeleryClient = () => {
  return new Celery.Client({
    backend: backend,
    brokers: [broker],
    id: "pdf-comparison-ui",
  });
};

export const invokeCeleryTask = (taskName: string, args: any[]) => {
  const task = getCeleryClient().createTask(taskName);

  task.applyAsync({
    args: args,
    kwargs: {},
  });
};
