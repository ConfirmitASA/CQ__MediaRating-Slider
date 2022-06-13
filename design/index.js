const ISCUSTOMSCALE = true; // should be always true for Open Form, for SingleForm, GridForm it should be false
const ISQUESTIONVALUE = false;

const RANGES = {
	sliderMinimum: {
		min: -100,
		max: 100
	},
	sliderMaximum: {
		min: -100,
		max: 100
	},
	sliderStep: {
		min: 1
	},
	mediaWidth: {
		min: 300,
		max: 900
	},
	playButtonTextLength: {
		max: 35
	},
	countdown: {
		min: 1,
		max: 15
	},
	checks: {
		min: 0,
		max: 10
	},
	time: {
		min: 1
	}
}
let VALIDATION_TEXTS = {
	required: 'Required',
	sliderMinimumLess: `Can\'t be less <br/> than ${RANGES.sliderMinimum.min}`,
	sliderMinimumGreater: `Can\'t be greater <br/> than ${RANGES.sliderMinimum.max}`,
	sliderMaximumLess: `Can\'t be less <br/> than ${RANGES.sliderMaximum.min}`,
	sliderMaximumGreater: `Can\'t be greater <br/> than ${RANGES.sliderMaximum.max}`,
	sliderMaximumLessThanMinimum: 'Must be greater <br/> than minimum',
	sliderBadStep: 'Max value label <br/> won\'t be visible',
	sliderStepNonPositive: 'Must be greater than zero',
	mediaWidthLess: `Can\'t be less <br/> than ${RANGES.mediaWidth.min}`,
	mediaWidthGreater: `Can\'t be greater <br/> than ${RANGES.mediaWidth.max}`,
	playButtonTextTooLong: 'Your text is too long',
	countdownValueOutOfRange: `Value must be positive and no more than ${RANGES.countdown.max}`,
	checksValueOutOfRange: `Value must be<br/>positive and<br/>no more than ${RANGES.checks.max}`,
	timeNonPositive: 'Value must be positive',
	mustBeNumeric: 'Must be numeric'
}

// Hides scale settings panel if ISCUSTOMSCALE = false
let scaleSettingsDiv = document.getElementById('scaleSettings');
if(ISCUSTOMSCALE) {
	scaleSettingsDiv.style.display = 'flex';
} else {
  scaleSettingsDiv.style.display = 'none';
}   
		
/* settings behaviour */
let panelMediaOptions = document.getElementsByClassName('mediaOptions')[0];
let panelSliderOptions = document.getElementsByClassName('sliderOptions')[0];
let panelMoreOptions = document.getElementsByClassName('moreOptions')[0];

let inputMediaWidth = document.getElementById('mediaWidth');
let inputMediaSrc = document.getElementById('mediaSrc');
let inputMediaPoster = document.getElementById('mediaPoster');
let selectSliderPosition = document.getElementById('sliderPosition');
let inputScaleMax = document.getElementById('scaleMax');
let inputScaleMin = document.getElementById('scaleMin');
let inputScaleStart = document.getElementById('scaleStart');
let inputScaleStep = document.getElementById('scaleStep');
let inputPlayButtonText = document.getElementById('playButtonText');
let inputPlayButtonColor = document.getElementById('playButtonColor');
let inputPlayButtonTextColor = document.getElementById('playButtonTextColor');
let inputCountdown = document.getElementById('countdown');
let inputTimeCheck = document.getElementById('timeCheck');
let inputWarningsAmount = document.getElementById('warningsAmount');
let inputResetBtnText = document.getElementById('resetBtnText');
let inputWarningReset = document.getElementById('warningReset');
let inputWarningIOS = document.getElementById('warningIOS');
let projectLanguages = [];
let currentLanguage = '';
let playButtonTextObj = {};
let resetBtnTextObj = {};
let warningResetObj = {};
let warningIOSObj = {};

customQuestion.onInit = init;
    
function init(settings, uiSettings, questionSettings, projectSettings) {
	projectLanguages = projectSettings;

	// re-render validation messages on opening/closing collapsable areas
	const collapseBtns = document.getElementsByClassName('node-properties__header');
	Array.prototype.forEach.call(collapseBtns, el => {
		el.addEventListener('click', function() {
			clearValidationMessages();
			const validationResults = validate();
			el.nextElementSibling.addEventListener('transitionend', function() {
				renderValidationMessages(validationResults.errors, validationResults.warnings);
			},
	{once : true});
		});
	});
}

function ensureBackwardCompatibilityV1(settings) {
	//scaleStep option was added with v2
	if(!settings.hasOwnProperty('scaleStep')) {
		// scaleStart default option used to be = 0 in v1 (now it is 'no value' previously there was no 'no value' option)
		if(settings.hasOwnProperty('scaleStart') && settings.scaleStart === '') {
			settings.scaleStart = 0;
		}
		// in v1 only min and max labels were shown therefore need to calculate scaleStep value accordingly
		let minLabelValue = (settings.hasOwnProperty('scaleMin') && settings.scaleMin !== '') ? parseInt(settings.scaleMin) : -50;
		let maxLabelValue = (settings.hasOwnProperty('scaleMax') && settings.scaleMax !== '') ? parseInt(settings.scaleMax) : 50;
		settings.scaleStep = maxLabelValue - minLabelValue;
	}
}

function setInputValue(settings, uiSettings) {
	currentLanguage = String(uiSettings.currentLanguage);
	if(settings !== null) {
		ensureBackwardCompatibilityV1(settings);
		if(settings.hasOwnProperty('playButtonText')) {
				playButtonTextObj = settings.playButtonText;
		}
		if(settings.hasOwnProperty('resetBtnText')) {
				resetBtnTextObj = settings.resetBtnText;
		}
		if(settings.hasOwnProperty('warningReset')) {
				warningResetObj = settings.warningReset;
		}
		if(settings.hasOwnProperty('warningIOS')) {
				warningIOSObj = settings.warningIOS;
		}
		/* */
		inputScaleMin.value = settings.scaleMin;
		inputScaleMax.value = settings.scaleMax;
		inputScaleStart.value = settings.scaleStart;
		inputScaleStep.value = settings.scaleStep ?? '';
		/* */
		inputMediaWidth.value = settings.width;
		inputMediaSrc.value = settings.src;
		inputMediaPoster.value = settings.poster;
		selectSliderPosition.value = settings.sliderPosition;

		if(settings.hasOwnProperty('playButtonText') && settings.playButtonText[currentLanguage] !== undefined) {
				inputPlayButtonText.value = settings.playButtonText[currentLanguage];
		} else {
				inputPlayButtonText.value = '';
		}
		inputPlayButtonColor.value = settings.playButtonColor;
		if(settings.hasOwnProperty('playButtonTextColor')) {
			inputPlayButtonTextColor.value = settings.playButtonTextColor;
		}
		inputCountdown.value = settings.countdown;
		inputTimeCheck.value = settings.timecheck;
		inputWarningsAmount.value = settings.warningsAmount;
		if(settings.hasOwnProperty('resetBtnText') && settings.resetBtnText[currentLanguage] !== undefined) {
				inputResetBtnText.value = settings.resetBtnText[currentLanguage];
		} else {
				inputResetBtnText.value = '';
		}
		if(settings.hasOwnProperty('warningReset') && settings.warningReset[currentLanguage] !== undefined) {
				inputWarningReset.value = settings.warningReset[currentLanguage];
		} else {
				inputWarningReset.value = '';
		}
		if(settings.hasOwnProperty('warningIOS') && settings.warningIOS[currentLanguage] !== undefined) {
				inputWarningIOS.value = settings.warningIOS[currentLanguage];
		} else {
				inputWarningIOS.value = '';
		}
	}
	openPanelsWithErrors();
	updateErrorsAndWarnings();
}

function openPanelsWithErrors() {
	let errors = validateForErrors();
	if (errors) {
		errors.forEach(error => {
			error.panel.classList.remove('comd-panel--collapsed');
		})
	}
}

function updateErrorsAndWarnings() {
	let validationResult = validate();
	clearValidationMessages();
	renderValidationMessages(validationResult.errors, validationResult. warnings);

	return !!validationResult.errors;
}

function saveNewChanges() {
	let hasError = updateErrorsAndWarnings();

	let linkArr = inputMediaSrc.value.split('.');
	let mediaType = 'video';
	if (linkArr[linkArr.length - 1] === 'mp3') {
		mediaType = 'audio';
	}

	let settings = {
		type: mediaType,
		width: inputMediaWidth.value,
		src: inputMediaSrc.value,
		poster: inputMediaPoster.value,
		sliderPosition: selectSliderPosition.value,
		playButtonColor: inputPlayButtonColor.value,
		playButtonTextColor: inputPlayButtonTextColor.value,
		playButtonText: playButtonTextObj,
		countdown: inputCountdown.value,
		timecheck: inputTimeCheck.value,
		warningsAmount: inputWarningsAmount.value,
		resetBtnText: resetBtnTextObj,
		warningReset: warningResetObj,
		warningIOS: warningIOSObj,
		scaleMin: inputScaleMin.value,
		scaleMax: inputScaleMax.value,
		scaleStart: inputScaleStart.value,
		scaleStep: inputScaleStep.value,
	};
	settings.playButtonText[currentLanguage] = inputPlayButtonText.value;
	settings.resetBtnText[currentLanguage] = inputResetBtnText.value;
	settings.warningReset[currentLanguage] = inputWarningReset.value;
	settings.warningIOS[currentLanguage] = inputWarningIOS.value;

	customQuestion.saveChanges(settings, hasError);
}

function validate() {
	let errors = validateForErrors();
	let warnings = validateForWarnings();

	return {errors, warnings};
}

function clearValidationMessages() {
	removeErrors();
	removeWarnings();
}

function renderValidationMessages(errors, warnings) {
	let hasError;
	if (errors) {
		showErrors(errors);
		hasError = true;
	}
	if(warnings && !hasError) {
		showWarnings(warnings);
	}
}

function validateForErrors() {
	let errorsList = []
	//check required
	if(!inputMediaSrc.value) {
		let newItem = {
			'element': inputMediaSrc,
			'errorText': VALIDATION_TEXTS.required,
			'panel': panelMediaOptions
		};
		errorsList.push(newItem);
	}
	// check scale Min setting
	if(!!inputScaleMin.value) {
		if(parseInt(inputScaleMin.value) < RANGES.sliderMinimum.min || parseInt(inputScaleMin.value) > RANGES.sliderMinimum.max) {
			if(parseInt(inputScaleMin.value) < RANGES.sliderMinimum.min) {
				let newItem = {
					'element': inputScaleMin,
					'errorText': VALIDATION_TEXTS.sliderMinimumLess,
					'panel': panelSliderOptions
				};
				errorsList.push(newItem);
			} else {
				let newItem = {
					'element': inputScaleMin,
					'errorText': VALIDATION_TEXTS.sliderMinimumGreater,
					'panel': panelSliderOptions
				};
				errorsList.push(newItem);
			}
		}
	}

	// check scale Max setting
	if(!!inputScaleMax.value) {
		if (parseInt(inputScaleMax.value) < RANGES.sliderMaximum.min || parseInt(inputScaleMax.value) > RANGES.sliderMaximum.max) {
			if (parseInt(inputScaleMax.value) < RANGES.sliderMaximum.min) {
				let newItem = {
					'element': inputScaleMax,
					'errorText': VALIDATION_TEXTS.sliderMaximumLess,
					'panel': panelSliderOptions
				};
				errorsList.push(newItem);
			} else {
				let newItem = {
					'element': inputScaleMax,
					'errorText': VALIDATION_TEXTS.sliderMaximumGreater,
					'panel': panelSliderOptions
				};
				errorsList.push(newItem);
			}
		}
	}

	// compare Min and Max values
	if(!!inputScaleMax.value && !!inputScaleMin.value) {
		if(parseInt(inputScaleMax.value) <= parseInt(inputScaleMin.value)) {
			let newItem = {
				'element': inputScaleMax,
				'errorText': VALIDATION_TEXTS.sliderMaximumLessThanMinimum,
				'panel': panelSliderOptions
			};
			errorsList.push(newItem);
		}
	}

	// check the start point is inside the Min and Max range
	if(!!inputScaleStart.value) {
		if(!!inputScaleMax.value && !!inputScaleMin.value && (parseInt(inputScaleMax.value) > parseInt(inputScaleMin.value))) {
			let rangeStart = parseInt(inputScaleMin.value) ?? RANGES.sliderMinimum.min;
			let rangeEnd = parseInt(inputScaleMax.value) ?? RANGES.sliderMaximum.max;

			if (parseInt(inputScaleStart.value) < parseInt(rangeStart) || parseInt(inputScaleStart.value) > parseInt(rangeEnd)) {
				let newItem = {
					'element': inputScaleStart,
					'errorText': `Must be in range between ${rangeStart} and ${rangeEnd}`,
					'panel': panelSliderOptions
				};
				errorsList.push(newItem);
			}
		}
	}

	// check the step value is greater than 1
	if(!!inputScaleStep.value) {
		if(parseInt(inputScaleStep.value) < RANGES.sliderStep.min) {
			let newItem = {
				'element': inputScaleStep,
				'errorText': VALIDATION_TEXTS.sliderStepNonPositive,
				'panel': panelSliderOptions
			};
			errorsList.push(newItem);
		}
	}
		// check media width setting
	if(!!inputMediaWidth.value) {
		if(parseInt(inputMediaWidth.value) < RANGES.mediaWidth.min || parseInt(inputMediaWidth.value) > RANGES.mediaWidth.max) {
			if(parseInt(inputMediaWidth.value) < RANGES.mediaWidth.min) {
				let newItem = {
						'element': inputMediaWidth,
						'errorText': VALIDATION_TEXTS.mediaWidthLess,
						'panel': panelMediaOptions
				};
				errorsList.push(newItem);
			} else {
				let newItem = {
						'element': inputMediaWidth,
						'errorText': VALIDATION_TEXTS.mediaWidthGreater,
						'panel': panelMediaOptions
				};
				errorsList.push(newItem);
			}
		}
	}

	// check the length of a Play button text
	if(!!inputPlayButtonText.value) {
		if(String(inputPlayButtonText.value).length > RANGES.playButtonTextLength) {
			let newItem = {
					'element': inputPlayButtonText,
					'errorText': VALIDATION_TEXTS.playButtonTextTooLong,
					'panel': panelMoreOptions
			};
			errorsList.push(newItem);
		}
	}

	// check the Countdown value
	if(!!inputCountdown.value) {
		if(inputCountdown.value < RANGES.countdown.min || inputCountdown.value > RANGES.countdown.max) {
			let newItem = {
					'element': inputCountdown,
					'errorText': VALIDATION_TEXTS.countdownValueOutOfRange,
					'panel': panelMoreOptions
			};
			errorsList.push(newItem);
		}
	}

	// check the Checks value
	if(!!inputWarningsAmount.value) {
		if(inputWarningsAmount.value < RANGES.checks.min || inputWarningsAmount.value > RANGES.checks.max) {
			let newItem = {
					'element': inputWarningsAmount,
					'errorText': VALIDATION_TEXTS.checksValueOutOfRange,
					'panel': panelMoreOptions
			};
			errorsList.push(newItem);
		}
	}

	// check the Time value
	if(!!inputTimeCheck.value) {
		if(inputTimeCheck.value < RANGES.time.min) {
			let newItem = {
					'element': inputTimeCheck,
					'errorText': VALIDATION_TEXTS.timeNonPositive,
					'panel': panelMoreOptions
			};
			errorsList.push(newItem);
		}
	}

	const numericInputsPanelMediaOptions = [inputMediaWidth];
	const numericInputsPanelSliderOptions = [inputScaleMin, inputScaleMax, inputScaleStart, inputScaleStep];
	const numericInputsPanelMoreOptions = [inputCountdown, inputTimeCheck, inputWarningsAmount];

	numericInputsPanelMediaOptions.forEach((input) => {
		let newErrorItem = checkNumericValue(input, panelMediaOptions);
		if(newErrorItem) {
			errorsList.push(newErrorItem);
		}
	})
	numericInputsPanelSliderOptions.forEach((input) => {
		let newErrorItem = checkNumericValue(input, panelSliderOptions);
		if(newErrorItem) {
			errorsList.push(newErrorItem);
		}
	})
	numericInputsPanelMoreOptions.forEach((input) => {
		let newErrorItem = checkNumericValue(input, panelMoreOptions);
		if(newErrorItem) {
			errorsList.push(newErrorItem);
		}
	})

	if(errorsList.length > 0) {
			return errorsList;
	} else {
			return false;
	}
}

/* check numerics */
function checkNumericValue(input, panel) {
	let result = null;

	if(!!input.value) {
		let realVal = input.value;
		let parsedVal = parseInt(realVal);
		if(!isNaN(parsedVal) && realVal !== parsedVal) {
			input.value = parsedVal;
		}
		if(isNaN(input.value)) {
			result = {
				'element': input,
				'errorText': VALIDATION_TEXTS.mustBeNumeric,
				'panel': panel
			};
		}
	}

	return result;
}

function showErrors(errors) {
	for(let i = 0; i < errors.length; i++) {
		if(!errors[i].panel.classList.contains('comd-panel--collapsed')) {
			errorTooltipShow(errors[i].element, errors[i].errorText);
			errors[i].element.classList.add("form-input--error");
		}
	}
}

function removeErrors() {
	let elementsWithErrors = document.querySelectorAll('.form-input--error');
	if(elementsWithErrors.length > 0) {
		for(let i = 0; i < elementsWithErrors.length; i++) {
			let elementID = elementsWithErrors[i].id;
			if(document.querySelectorAll("#error--" + elementID).length > 0) {
					elementsWithErrors[i].classList.remove("form-input--error");
					document.getElementById("error--" + elementID).outerHTML = "";
			}
		}
	}
}

function validateForWarnings() {
	let warningsList = []
	//check bad step
	if(!!inputScaleStep.value) {
		const x = (inputScaleMax.value - inputScaleMin.value) / inputScaleStep.value;
		const isBadStep = !Number.isInteger(x);
		if(isBadStep) {
			const newItem = {
				'element': inputScaleStep,
				'message': VALIDATION_TEXTS.sliderBadStep,
				'panel': panelSliderOptions
			};
			warningsList.push(newItem);
		}
	}

	return warningsList;
}

function showWarnings(warnings) {
	for(let i = 0; i < warnings.length; i++) {
		if(!warnings[i].panel.classList.contains('comd-panel--collapsed')) {
			warningTooltipShow(warnings[i].element, warnings[i].message);
			warnings[i].element.classList.add("form-input--warning");
		}
	}
}

function removeWarnings() {
	let elementsWithWarnings = document.querySelectorAll('.form-input--warning');
	if(elementsWithWarnings.length > 0) {
		for(let i = 0; i < elementsWithWarnings.length; i++) {
			let elementID = elementsWithWarnings[i].id;
			if(document.querySelectorAll("#warning--" + elementID).length > 0) {
				elementsWithWarnings[i].classList.remove("form-input--warning");
				document.getElementById("warning--" + elementID).outerHTML = "";
			}
		}
	}
}

customQuestion.onSettingsReceived = setInputValue;
document.getElementById('customSettings').addEventListener('input', function () {
		saveNewChanges();
});