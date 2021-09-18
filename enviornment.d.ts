declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DB_USERNAME: string;
			DB_PASSWORD: string;
			DB_NAME: "development" | "production";
		}
	}
}

export {};
