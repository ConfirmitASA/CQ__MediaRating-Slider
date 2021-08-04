const ISCUSTOMSCALE = true; // should be always true for Open Form, for SingleForm, GridForm it should be false
const ISQUESTIONVALUE = true;


//let scaleMin = document.getElementById('scaleMin');
//let scaleMax = document.getElementById('scaleMax');
//let scaleStart = document.getElementById('scaleStart'); 

// Hides scale settings panel if ISCUSTOMSCALE = false
let scaleSettingsDiv = document.getElementById('scaleSettings');
if(ISCUSTOMSCALE) {
	scaleSettingsDiv.style.display = 'flex';
} else {
  scaleSettingsDiv.style.display = 'none';
}   
		
/* settings behaviour */
let inputMediaWidth = document.getElementById('mediaWidth');
let inputMediaSrc = document.getElementById('mediaSrc');
let inputMediaPoster = document.getElementById('mediaPoster');
let selectSliderPosition = document.getElementById('sliderPosition');
let selectSliderDirection = document.getElementById('sliderDirection');
let inputSliderWidth = document.getElementById('sliderWidth');
let inputScaleMax = document.getElementById('scaleMax');
let inputScaleMin = document.getElementById('scaleMin');
let inputScaleStart = document.getElementById('scaleStart');
let inputPlayButtonText = document.getElementById('playButtonText');
let inputPlayButtonColor = document.getElementById('playButtonColor');
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

customQuestion.onInit = getInitSettings;
    
function getInitSettings(settings, uiSettings, questionSettings, projectSettings) {
		projectLanguages = projectSettings;
}

function setInputValue(settings, uiSettings) {
			currentLanguage = String(uiSettings.currentLanguage);
			if(settings !== null) {
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
					selectSliderDirection.value = settings.sliderSettings.isVertical ? 'vertical' :  'horizontal';
					inputSliderWidth.value = settings.sliderWidth;
					inputScaleMin.value = settings.sliderSettings.customScale.min;
					inputScaleMax.value = settings.sliderSettings.customScale.max;
					inputScaleStart.value = settings.sliderSettings.customScale.start;
					/* */
					inputMediaWidth.value = settings.videoWidth;
					inputMediaSrc.value = settings.src;
					inputMediaPoster.value = settings.poster;
					selectSliderPosition.value = settings.sliderPosition;
					//inputScaleMax.value = settings.scaleMax;
					//inputScaleMin.value = settings.scaleMin;
					//inputScaleStart.value = settings.scaleStart;
					if(settings.hasOwnProperty('playButtonText') && settings.playButtonText[currentLanguage] !== undefined) {
							inputPlayButtonText.value = settings.playButtonText[currentLanguage];
					} else {
							inputPlayButtonText.value = '';
					}
					inputPlayButtonColor.value = settings.playButtonColor;
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
}

function saveNewChanges() {
		let errors = checkValues();
		let elementsWithErrors = document.querySelectorAll('.form-input--error');
		removeErrors();
		if(elementsWithErrors.length > 0 || errors) {
				showErrors(errors);
		} else {
				let linkArr = inputMediaSrc.value.split('.');
				let mediaType = 'video';
				if(linkArr[linkArr.length - 1] === 'mp3') {
						mediaType = 'audio';
				}

				let isVerticalVal = selectSliderDirection.value == 'vertical' ? true : false;
				
				let settings = {
						type: mediaType,
						videoWidth: inputMediaWidth.value,
						src: inputMediaSrc.value,
						poster: inputMediaPoster.value,
						sliderPosition: selectSliderPosition.value,
						sliderWidth: inputSliderWidth.value,
						//sliderDirection: selectSliderDirection.value,
						//scaleMax: inputScaleMax.value,
						//scaleMin: inputScaleMin.value,
						//scaleStart: inputScaleStart.value,
						playButtonColor: inputPlayButtonColor.value,
						playButtonText: playButtonTextObj,
						countdown: inputCountdown.value,
						timecheck: inputTimeCheck.value,
						warningsAmount: inputWarningsAmount.value,
						resetBtnText: resetBtnTextObj,
						warningReset: warningResetObj,
						warningIOS: warningIOSObj,
						sliderSettings: {
							isVertical: isVerticalVal,
							isQuestionValue: ISQUESTIONVALUE,
							isCustomScale: ISCUSTOMSCALE,
							customScale: { 
								min: parseInt(inputScaleMin.value),
								max: parseInt(inputScaleMax.value),
								start: parseInt(inputScaleStart.value)
							}
						}
				};
				settings.playButtonText[currentLanguage] = inputPlayButtonText.value;
				settings.resetBtnText[currentLanguage] = inputResetBtnText.value;
				settings.warningReset[currentLanguage] = inputWarningReset.value;
				settings.warningIOS[currentLanguage] = inputWarningIOS.value;
				let hasError = inputMediaSrc.value === '';
				customQuestion.saveChanges(settings, hasError);
		}
}

function checkValues() {
		let errorsList = [];
		// check scale Min setting
		if(!!inputScaleMin.value) {
				if(parseInt(inputScaleMin.value) < -100 || parseInt(inputScaleMin.value) > 99) {
						if(parseInt(inputScaleMin.value) < -100) {
								let newItem = {
										'element': inputScaleMin,
										'errorText': "Can't be less <br/> than -100"
								};
								errorsList.push(newItem);
						} else {
								let newItem = {
										'element': inputScaleMin,
										'errorText': "Can't be more than 99"
								};
								errorsList.push(newItem);
						}
				}
		}

		// check scale Max setting
		if(!!inputScaleMax.value) {
				if (parseInt(inputScaleMax.value) < -99 || parseInt(inputScaleMax.value) > 100) {
						if (parseInt(inputScaleMax.value) < -99) {
								let newItem = {
										'element': inputScaleMax,
										'errorText': "Can't be less than -99"
								};
								errorsList.push(newItem);
						} else {
								let newItem = {
										'element': inputScaleMax,
										'errorText': "Can't be more than 100"
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
								'errorText': "Can't be less or equal than scale's Minimum"
						};
						errorsList.push(newItem);
				}
		}

		// check media width setting
		if(!!inputMediaWidth.value) {
				if(parseInt(inputMediaWidth.value) < 300 || parseInt(inputMediaWidth.value) > 900) {
						if(parseInt(inputMediaWidth.value) < 300) {
								let newItem = {
										'element': inputMediaWidth,
										'errorText': "Can't be less than 300px"
								};
								errorsList.push(newItem);
						} else {
								let newItem = {
										'element': inputMediaWidth,
										'errorText': "Can't be more than 900px"
								};
								errorsList.push(newItem);
						}
				}
		}
		
		// check slider width setting
		if(!!inputSliderWidth.value) {
				if(parseInt(inputSliderWidth.value) < 300 || parseInt(inputSliderWidth.value) > 900) {
						if(parseInt(inputSliderWidth.value) < 300) {
								let newItem = {
										'element': inputSliderWidth,
										'errorText': "Can't be less than 300px"
								};
								errorsList.push(newItem);
						} else {
								let newItem = {
										'element': inputSliderWidth,
										'errorText': "Can't be more than 900px"
								};
								errorsList.push(newItem);
						}
				}
		}

		// check if the start point is inside of the Min and Max range
		if(!!inputScaleStart.value) {
				let rangeStart = -50;
				let rangeEnd = 50;
				if(!!inputScaleMin.value) {
						rangeStart = inputScaleMin.value;
				}
				if(!!inputScaleMax.value) {
						rangeEnd = inputScaleMax.value;
				}
				if(parseInt(inputScaleStart.value) < parseInt(rangeStart) || parseInt(inputScaleStart.value) > parseInt(rangeEnd)) {
						let newItem = {
								'element': inputScaleStart,
								'errorText': "Must be in the range between " + parseInt(rangeStart) + " and " + parseInt(rangeEnd)
						};
						errorsList.push(newItem);
				}
		}

		// check the length of a Play button text
		if(!!inputPlayButtonText.value) {
				if(String(inputPlayButtonText.value).length > 35) {
						let newItem = {
								'element': inputPlayButtonText,
								'errorText': "Your text is too long"
						};
						errorsList.push(newItem);
				}
		}

		// check the Countdown value
		if(!!inputCountdown.value) {
				if(inputCountdown.value < 0 || inputCountdown.value > 15) {
						let newItem = {
								'element': inputCountdown,
								'errorText': "Value must be positive and no more than 15"
						};
						errorsList.push(newItem);
				}
		}

		// check the Checks value
		if(!!inputWarningsAmount.value) {
				if(inputWarningsAmount.value < 0 || inputWarningsAmount.value > 10) {
						let newItem = {
								'element': inputWarningsAmount,
								'errorText': "Value must be<br />positive and<br />no more than 10"
						};
						errorsList.push(newItem);
				}
		}

		// check the Time value
		if(!!inputTimeCheck.value) {
				if(inputTimeCheck.value < 0) {
						let newItem = {
								'element': inputTimeCheck,
								'errorText': "Value must be positive"
						};
						errorsList.push(newItem);
				}
		}

		if(errorsList.length > 0) {
				return errorsList;
		} else {
				return false;
		}
}

function showErrors(errors) {
	for(let i = 0; i < errors.length; i++) {
				errorTooltipShow(errors[i].element, errors[i].errorText);
				errors[i].element.classList.add("form-input--error");
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

customQuestion.onSettingsReceived = setInputValue;
document.getElementById('customSettings').addEventListener('input', function () {
		saveNewChanges();
});