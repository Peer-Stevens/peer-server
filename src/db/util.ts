import { YesNoRating } from "types";

/**
 * Returns a random number between 0.5 and 5 in increments of 0.5, or null.
 * Each result is equally likely.
 */
export const randomNumericRating = (): number | null => {
	const numericRating = Math.floor(Math.random() * 11) / 2;
	return numericRating === 0 ? null : numericRating;
};

/**
 * Returns a random YesNoRating (0, 1, or null). Each result is equally likely.
 */
export const randomYesNoRating = (): YesNoRating => {
	const choice = Math.floor(Math.random() * 3);
	if (choice === 0) return 0;
	if (choice === 1) return 1;
	/* if choice === 2 */ return null;
};
