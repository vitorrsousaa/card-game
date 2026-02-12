import { LoggerInstrumentor, LogLevel } from "@repo/logger";

const instrumentor = new LoggerInstrumentor({
	logger: {
		prettyPrint: true,
		minLevel: LogLevel.DEBUG,
	},
});

export const createLogger = instrumentor.createLogger.bind(instrumentor);
export const getLogger = instrumentor.getLogger.bind(instrumentor);
