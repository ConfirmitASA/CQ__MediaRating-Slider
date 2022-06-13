import {DEFAULT_SLIDER_SETTINGS} from "./slider-default-settings";
import {SLIDER_DIRECTION} from "./constants";
import SliderOpenRenderer from "./slider-open-renderer.js";
import VerticalBttSlider from "./vertical-btt-slider";
import VerticalSlider from "./vertical-slider";
import HorizontalRtlSlider from "./horizontal-rtl-slider";
import HorizontalSlider from "./horizontal-slider";
import Event from "./event";

export default class SliderOpenComponent {
    /**
     * @param {Question} question - base question to which the slider will be attached
     * @param {QuestionViewSettings} settings - base question settings
     * @param {Object} sliderSettings - slider settings object
     * @param {HTMLDivElement} [sliderContainer] - the slider will be appended to this container
     * @param {string} [sliderId] - id for this slider
     */
    constructor(question, settings, sliderSettings, sliderContainer, sliderId) {
        this.question = question;
        this.settings = settings;
        this.sliderSettings = this.getValidSliderSettings(sliderSettings);
        this.addQuestionSettingsToSliderSettings();
        this.container = sliderContainer ?? this.getDefaultContainer();
        this.sliderId = sliderId ? sliderId : this.getDefaultSliderId();

        this._changeEvent = new Event('slider:change');

        this.init();
    }

    get changeEvent() {
        return this._changeEvent;
    }

    /**
     * @param sliderSettings
     * @returns {object} - slider settings object with every needed property set.
     */
    getValidSliderSettings(sliderSettings) {
        if(sliderSettings === null) {
            return DEFAULT_SLIDER_SETTINGS;
        }
        this.setDefaultSettingsIfNeeded(sliderSettings, DEFAULT_SLIDER_SETTINGS);
        return sliderSettings;
    }

    /**
     * Recursively checks every property of settings object and replaces its value with the default one if needed.
     * @param settings - slider settings
     * @param defaultSettings - default settings
     */
    setDefaultSettingsIfNeeded(settings, defaultSettings) {
        for (const property in defaultSettings) {
            if (typeof(defaultSettings[property]) === 'object') {
                this.setDefaultSettingsIfNeeded(settings[property], defaultSettings[property]);
            } else if(!settings.hasOwnProperty(property) ||
                settings[property] === null ||
                settings[property] === undefined ||
                Number.isNaN(settings[property]))
            {
                settings[property] = defaultSettings[property];
            }
        }
    }

    /**
     * Extends sliderSettings object with some settings like 'isRtl' from base question.
     */
    addQuestionSettingsToSliderSettings() {
        this.sliderSettings['isRtl'] = this.question.isRtl;
        this.sliderSettings['readOnly'] = this.question.readOnly;
    }

    getDefaultContainer() {
        try {
            return document.querySelector(`#${this.question.id}`);
        }
        catch (e) {
            throw 'Could not find the slider default container';
        }
    }

    /**
     * @returns {string} - id of this slider node.
     */
    getSliderId() {
        return this.sliderId;
    }

    /**
     * Creates default slider node id in form <question.id>_slider_<slider number>. Slider number reflects the order this slider is added to the page.
     * @returns {string} - default slider id.
     */
    getDefaultSliderId() {
        let slidersInThisQuestion = document.querySelectorAll(`#${this.question.id} .cf-single-slider-question--custom`);
        let slidersCount = slidersInThisQuestion.length;

        return `${this.question.id}_slider_${slidersCount + 1}`;
    }

    init() {
        let areCodesReversed = this.sliderSettings.direction === SLIDER_DIRECTION.verticalBtt;
        this.sliderValues = this.getValues(this.sliderSettings.customScale.min,
            this.sliderSettings.customScale.max, areCodesReversed);

        let sliderRenderer = new SliderOpenRenderer(this.sliderId, this.container,
            this.sliderValues, this.sliderSettings);
        sliderRenderer.render();

        this.slider = this.createSlider();
        this._changeEvent = this.slider.changeEvent;
        this.slider.changeEvent.on(this.onSliderChange.bind(this));
        this.sliderValues.forEach(answer => {
            this.getAnswerTextNode(answer.code).addEventListener('click', () => {
                this.setSliderValue(answer.text);
            });
        });
        this.onSliderChange();
    }

    /**
     * @param {number} start
     * @param {number} end
     * @return {Array} returns an array of objects
     */
    getValues(start, end, areCodesReversed = false) {
        let values = Array(end - start + 1).fill().map((_, idx) => (start + idx));
        values = areCodesReversed ? values.reverse() : values;
        return values.map((value, index) => {
            return {
                code: index.toString(),
                text: value.toString()
            };
        });
    }

    createSlider() {
        let sliderNodeId = this.getSliderId();
        let sliderValues = this.sliderValues.map(answer => answer.text);
        let sliderValue = this.sliderSettings.customScale.start.toString();
        if(this.sliderSettings.isQuestionValue && this.question.value) {
            sliderValue = this.question.value;
        }
        let readOnly = this.sliderSettings.readOnly;
        let sliderTextValueHandler = (sliderValue) => {
            return sliderValue === null ? this.settings.messages.noResponse : sliderValue;
        };

        switch (this.sliderSettings.direction) {
            case SLIDER_DIRECTION.horizontal:
                if(this.sliderSettings.isRtl) {
                    return new HorizontalRtlSlider(sliderNodeId, sliderValues, sliderValue, sliderTextValueHandler, readOnly);
                }
                return new HorizontalSlider(sliderNodeId, sliderValues, sliderValue, sliderTextValueHandler, readOnly);
            case SLIDER_DIRECTION.vertical:
                return new VerticalSlider(sliderNodeId, sliderValues, sliderValue, sliderTextValueHandler, readOnly);
            case SLIDER_DIRECTION.verticalBtt:
                return new VerticalBttSlider(sliderNodeId, sliderValues.reverse(), sliderValue, sliderTextValueHandler, readOnly);
            default:
                return new HorizontalSlider(sliderNodeId, sliderValues, sliderValue, sliderTextValueHandler, readOnly);
        }
    }

    setSliderValue(value) {
        value = value == null ? null : value.toString();
        if(this.sliderSettings.isQuestionValue) {
            this.question.setValue(value);
            this.slider.value = this.question.value;
            return;
        }

        this.slider.value = value;
    }

    getSliderValue() {
        return this.slider.value;
    }

    onSliderChange() {
        if(this.sliderSettings.isQuestionValue) {
            this.question.setValue(this.slider.value);
        }
        let questionAnswerTextNodes = this.container.querySelectorAll('#' + this.sliderId + ' .cf-single-slider-question__answer-text');
        if(questionAnswerTextNodes != null && questionAnswerTextNodes.length !== 0) {
            Array.prototype.forEach.call(questionAnswerTextNodes, function(answerTextNode) {
                answerTextNode.classList.remove('cf-single-slider-question__answer-text--selected');
            });
        }

        let selectedAnswer = this.sliderValues.find(x => x.text === this.slider.value);
        let answerTextNode = null;
        if(selectedAnswer) {
            answerTextNode = this.getAnswerTextNode(selectedAnswer.code);
        }
        if(answerTextNode != null) {
            answerTextNode.classList.add('cf-single-slider-question__answer-text--selected');
        }
    }

    getAnswerTextNode(answerCode) {
        return document.querySelector('#' + this.getAnswerTextNodeId(answerCode));
    }

    getAnswerTextNodeId(answerCode) {
        return `${this.getSliderId()}_${answerCode}_text`;
    }
}

if(window && !window.customQuestionsLibrary) {
    window.customQuestionsLibrary = {};
}
window.customQuestionsLibrary.SliderOpenComponent = SliderOpenComponent;