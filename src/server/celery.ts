import * as Celery from "celery-ts";
import { env } from "~/env";

// TODO: move to env
const tcp = new Celery.RedisTcpOptions({
	host: env.CELERY_BROKER_HOST,
	protocol: "redis",
	port: env.CELERY_BROKER_PORT,
	db: env.CELERY_BROKER_DB,
});

const broker = new Celery.RedisBroker(tcp);

const celeryClient: Celery.Client = new Celery.Client({
	brokers: [broker],
	id: "pdf-comparison-ui",
});

export const invokeCeleryTask = (taskName: string, args: any[]) => {
	const task = celeryClient.createTask(taskName);

	task.applyAsync({
		args: args,
		kwargs: {},
	});
};