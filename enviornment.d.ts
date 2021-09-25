declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DB_USERNAME: string;
			DB_PASSWORD: string;
			DB_NAME: "production" | "eleni-dev" | "andrew-dev" | "julio-dev" | "david-dev";
			MAPS_API: string;
		}
	}
}

export {};
