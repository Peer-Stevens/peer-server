declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DB_USERNAME: string;
			DB_PASSWORD: string;
			DB_NAME: "production" | "eleni-dev" | "andrew-dev" | "julio-dev" | "david-dev";
			DB_ENV: "atlas" | "local";
			PLACES_API_KEY: string;
		}
	}
}

export {};
