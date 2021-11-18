module.exports = {
	root: true,
	plugins: ["prettier", "@typescript-eslint"],
	env: {
		browser: true,
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 6,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	extends: ["prettier", "plugin:prettier/recommended", "plugin:@typescript-eslint/recommended"],
	overrides: [
		{
			files: ["*.ts", "*.tsx"],
			extends: ["plugin:@typescript-eslint/recommended-requiring-type-checking"],
			parserOptions: {
				project: ["./tsconfig.json"],
			},
			rules: {
				"@typescript-eslint/switch-exhaustiveness-check": "error",
				"@typescript-eslint/no-misused-promises": [
					"error",
					{
						checksVoidReturn: false,
					},
				],
			},
		},
	],
	// Do NOT use any eslint ruels that affect code formatting because prettier handles that.
	rules: {
		"prettier/prettier": [
			"error",
			{
				endOfLine: "auto",
			},
		],
		"no-debugger": "error",
		"no-var": "error",
		"eqeqeq": "error",
		"no-restricted-properties": [
			"error",
			{
				object: "document",
				property: "title",
			},
		],
		"prettier/prop-types": "off",
		"@typescript-eslint/no-var-requires": "error",
		"@typescript-eslint/adjacent-overload-signatures": "error",
		"@typescript-eslint/no-extra-semi": "off",
	},
};
