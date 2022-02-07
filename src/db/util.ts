export const randomNumericRating = () => Math.floor(Math.random() * 12) / 2;
export const randomBooleanResponse = (): 0 | 1 => {
	if (Math.round(Math.random()) === 1.0) {
		return 1;
	}
	return 0;
};
