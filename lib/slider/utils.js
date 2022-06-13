export default class Utils {

	static floor(value, precision) {
		const multiplier = Math.pow(10, precision);
		return Math.floor(value * multiplier) / multiplier;
	}

	static round(value, precision) {
		const multiplier = Math.pow(10, precision);
		return Math.round(value * multiplier) / multiplier;
	}

	static getElementOffset(element) {
		if(!element) {
			return;
		}

		let rect = element.getBoundingClientRect();
		let offset = {
			// for cross-browser compatibility, use window.page(X/Y)Offset instead of window.scroll(X/Y)
			top: rect.top + window.pageYOffset,
			left: rect.left + window.pageXOffset,
		};
		return offset;
	}

	static outerWidth(element) {
		if(!element) {
			return;
		}

		let width = element.offsetWidth;
		let style = window.getComputedStyle(element);

		width += parseInt(style.marginLeft) + parseInt(style.marginRight);
		return width;
	}

	static outerHeight(element) {
		if(!element) {
			return;
		}

		let height = element.offsetHeight;
		let style = window.getComputedStyle(element);

		height += parseInt(style.marginTop) + parseInt(style.marginBottom);
		return height;
	}

	/**
	 * @param {Element} element
	 * @return {object} get computed style for an element, excluding any default styles
	 */
	static getStylesWithoutDefaults(element) {
		if(!element) {
			return;
		}
		// creating an empty dummy object to compare with
		let dummy = document.createElement('div');
		element.parentNode.appendChild(dummy);

		// getting computed styles for both elements
		let defaultStyles = window.getComputedStyle(dummy);
		let elementStyles = window.getComputedStyle(element);

		// calculating the difference
		let diff = {};
		for(let key of elementStyles) {
			if(defaultStyles.hasOwnProperty(key) && defaultStyles[key] !== elementStyles[key]) {
				diff[key] = elementStyles[key];
			}
		}

		// clear dom
		dummy.parentNode.removeChild(dummy);

		return diff;
	}
}