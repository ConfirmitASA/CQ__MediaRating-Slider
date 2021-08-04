import QuestionWithAnswersView from './question-with-answers-view';
import HorizontalSlider from './horizontal-slider';
import VerticalSlider from './vertical-slider';
import HorizontalRtlSlider from './horizontal-rtl-slider';
import FloatingLabels from './floating-labels';
import ValidationTypes from './validation-types';
import Utils from './utils';

const DEFAULT_SLIDER_SETTINGS = {
	isVertical: true,
	isCustomScale: true,
	customScale: {
		min: -10,
		max: 10,
		start: 0
	}
}
			
export default class SliderOpenQuestionView extends QuestionWithAnswersView {
	/**
	 * @param {OpenQuestion} question
	 * @param {QuestionViewSettings} settings
	 * @param {Object} customSettings
	 * @param {HTMLDivElement} sliderContainer
	 */
	constructor(question, settings, customSettings, sliderContainer) {
		super(question, settings);		
		this.sliderSettings = (customSettings && customSettings.sliderSettings) ? customSettings.sliderSettings 
												: DEFAULT_SLIDER_SETTINGS;
												
		this.container = sliderContainer ? sliderContainer : getDefaultContainer();
		
		this.init();
	}
	
	init() {
		this.sliderValues = this.getValues(this.sliderSettings.customScale.min, this.sliderSettings.customScale.max);
		this.sliderStartValue = this.sliderSettings.scaleStart;
		
		this.render();
		this.slider = this.createSlider();
		
		this.slider.changeEvent.on(this.onSliderChange.bind(this));

		this.sliderValues.forEach(answer => {
			this.getAnswerTextNode(answer.code).addEventListener('click', () => {
				this.setSliderValue(answer.code); 
			});
		});

		this.setSliderValue(this.sliderSettings.customScale.start.toString());
	}
		
	render() {
		let container = this.container;	
		let sliderContainer = this.createSliderContainer();

		let labels = '<ol class="cf-single-slider-question__labels">';
		this.sliderValues = this.question.isRtl ? this.sliderValues.slice().reverse() : this.sliderValues;
		this.sliderValues.forEach(value => {
			labels += '<li class="cf-single-slider-question__label" id="' + this.question.id + "_" + value.code + "_text" + '">' + value.text + '</li>';
		});
		labels += '</ol>';
		
		let questionDirection = this.sliderSettings.isVertical ? 'cf-single-slider-question--vertical'
								: (this.question.isRtl ? 'cf-single-slider-question--horizontal-rtl' : 'cf-single-slider-question--horizontal');
		let sliderDirection = this.sliderSettings.isVertical ? 'cf-slider--vertical' : 'cf-slider--horizontal';
		sliderDirection = this.question.isRtl ? sliderDirection + '-rtl' : sliderDirection;
																				
		sliderContainer.innerHTML = '<div class="cf-single-slider-question ' + questionDirection + '">' + labels +
																'<div class="cf-single-slider-question__slider cf-slider ' + sliderDirection + '" id="' + this.question.id + '_input">' +
																'<div class="cf-slider__track-area">' +
																'<div class="cf-slider__track">' +
																'<div class="cf-slider__no-value"></div>' +
																'<div class="cf-slider__handle cf-slider__handle--no-value" role="slider" aria-readonly="false" tabindex="0" aria-valuenow="-1" aria-valuetext="NO RESPONSE"></div>'+
																'</div></div></div></div></div>';
						
		container.append(sliderContainer);
	}
	
	createSliderContainer() {
		let sliderContainer = document.createElement('div');
		sliderContainer.setAttribute('id', this.question.id + '_content');		
		this.setDefaultStylesIfNeeded(sliderContainer);
		
		return sliderContainer;
	}
	
	setDefaultStylesIfNeeded(sliderContainer) {
		if(!sliderContainer) {
			return;
		}
		
		let pageMainDiv = document.querySelector('.cf-page__main');
		let styles = Utils.getStylesWithoutDefaults(pageMainDiv);
		if(pageMainDiv && Object.keys(styles).length > 0) {
			sliderContainer.setAttribute('class', 'cf-question__content');
		}	else {
			sliderContainer.setAttribute('class', 'cf-question__content default-styles_active');
		}
	}
	
	createSlider() {
		let sliderNode = this.getQuestionInputNodeId();
		let sliderValues = this.sliderValues.map(answer => answer.code);
		let sliderValue = this.sliderStartValue; 
		let readOnly = this.question.readOnly;
		let sliderTextValueHandler = (sliderValue) => {
			return sliderValue === null ? this.settings.messages.noResponse : sliderValue; 
		};

		if(this.sliderSettings.isVertical) {
			return new VerticalSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, readOnly);
		}
		if(this.question.isRtl) {
			return new HorizontalRtlSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, readOnly);
		}

		return new HorizontalSlider(sliderNode, sliderValues, sliderValue, sliderTextValueHandler, readOnly);
	}

	onModelValueChange() {
		this.slider.value = this.question.value;
	}

	onSliderChange() {
		let questionLabels = this.container.querySelectorAll('.cf-single-slider-question__label');
		if(questionLabels != null && questionLabels.length != 0) {		
			questionLabels.forEach(questionLabels => {
				questionLabels.classList.remove('cf-single-slider-question__label--selected');
			});
		}
		
		let answerTextNode = this.getAnswerTextNode(this.slider.value);
		if(answerTextNode != null) {
			answerTextNode.classList.add('cf-single-slider-question__label--selected');
		}
	}
	
	getDefaultContainer() {
		let defaultContainer = document.querySelector(`#${this.question.id}`);
		if(!defaultContainer) {
			throw 'Could not find the slider container';
		} 
		
		return defaultContainer;
	}
	
	/**
	 * @param {number} start
	 * @param {number} end
	 * @return {Array} returns an array of objects
	*/
	getValues(start, end) {
		let values = Array(end - start + 1).fill().map((_, idx) => (start + idx));	
		let valArr = [];
		let cur = 0;
		for(const key of values) {
			valArr[cur] = {	
								code: key.toString(), 
								text: key.toString()
							};
			cur++; 
		}
		return valArr;
	}	
	
	setSliderValue(value) {
		this.slider.value = value;
	}
	
	getSliderValue() {
		return this.slider.value;
	}
}