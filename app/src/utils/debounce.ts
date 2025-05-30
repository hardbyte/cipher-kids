export function debounce<F extends (...args: unknown[]) => void>(fn: F, wait: number) {
	let timer: ReturnType<typeof setTimeout>;
	const debounced = (...args: unknown[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...(args as Parameters<F>)), wait);
	};
	debounced.cancel = () => {
		// Method to cancel the debounced call
		clearTimeout(timer);
	};
	return debounced;
}
