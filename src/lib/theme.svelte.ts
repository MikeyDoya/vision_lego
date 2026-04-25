let _dark = $state(false);

export const theme = {
	get dark() {
		return _dark;
	},
	init() {
		_dark = document.documentElement.classList.contains('dark');
	},
	toggle() {
		_dark = !_dark;
		document.documentElement.classList.toggle('dark', _dark);
		localStorage.setItem('theme', _dark ? 'dark' : 'light');
	}
};
