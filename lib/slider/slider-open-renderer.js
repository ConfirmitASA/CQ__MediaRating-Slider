import Utils from "./utils";
import {SLIDER_DIRECTION} from "./constants";

export default class SliderOpenRenderer {
    constructor(sliderId, sliderContainer, sliderValues, sliderSettings) {
        this.id = sliderId;
        this.container = sliderContainer;
        this.values = (sliderSettings.isRtl && sliderSettings.direction === SLIDER_DIRECTION.horizontal)
            ? sliderValues.slice().reverse() : sliderValues;
        this.valuesWithStep = this.getValuesWithStep(sliderSettings.customScale.min,
            sliderSettings.customScale.max, sliderSettings.customScale.step);
        this.settings = sliderSettings;
    }

    render() {
        let sliderContainer = document.createElement('div');
        let directionModifiers = this.getDirectionModifiers();
        sliderContainer.setAttribute('class',
            'cf-single-slider-question cf-single-slider-question--custom ' + directionModifiers.question);
        this.setContainerSize(sliderContainer, this.settings.containerSize);
        sliderContainer.setAttribute('id', this.id);

        let slider = document.createElement('div');

        slider.setAttribute('class',
            'cf-single-slider-question__slider cf-slider ' + directionModifiers.slider);

        let labels = this.createLabels();
        slider.appendChild(labels);
        let trackArea = this.createTrackArea();
        slider.appendChild(trackArea);

        sliderContainer.appendChild(slider);

        this.container.appendChild(sliderContainer);
        this.setDefaultStylesIfNeeded(this.container);
        if(this.settings.direction === SLIDER_DIRECTION.horizontal) {
            this.setHorizontalSliderLabelMargins(labels.querySelectorAll('li'));
        }
    }

    getDirectionModifiers() {
        let directionModifiers = {};
        if (this.settings.direction === SLIDER_DIRECTION.horizontal) {
            directionModifiers.question = this.settings.isRtl ? 'cf-single-slider-question--horizontal-rtl' : 'cf-single-slider-question--horizontal';
            directionModifiers.slider = 'cf-slider--horizontal';
        } else if (this.settings.direction === SLIDER_DIRECTION.vertical) {
            directionModifiers.question = 'cf-single-slider-question--vertical';
            directionModifiers.slider = 'cf-slider--vertical';
        } else if (this.settings.direction === SLIDER_DIRECTION.verticalBtt) {
            directionModifiers.question  = this.settings.isRtl ? 'cf-single-slider-question--vertical-rtl' : 'cf-single-slider-question--vertical';
            directionModifiers.question  += this.settings.isRtl ? ' cf-single-slider-question--vertical-btt-rtl' : ' cf-single-slider-question--vertical-btt';

            directionModifiers.slider = this.settings.isRtl ? 'cf-slider--vertical-rtl' : 'cf-slider--vertical';
            directionModifiers.slider += ' cf-slider--vertical-btt';
        }
        directionModifiers.slider += this.settings.isRtl ? '-rtl' : '';

        return directionModifiers;
    }

    createTrackArea() {
        let trackArea = document.createElement('div');
        trackArea.setAttribute('class', 'cf-slider__track-area');

        let track = document.createElement('div');
        track.setAttribute('class', 'cf-slider__track');

        let noValue = document.createElement('div');
        noValue.setAttribute('class', 'cf-slider__no-value');

        let handle = this.createHandle();

        track.appendChild(noValue);
        track.appendChild(handle);
        trackArea.appendChild(track);

        return trackArea;
    }

    createHandle() {
        let handle = document.createElement('div');
        handle.setAttribute('class', 'cf-slider__handle cf-slider__handle--no-value');
        handle.setAttribute('role', 'slider');
        handle.setAttribute('aria-readonly', 'false');
        handle.setAttribute('tabindex', '0');
        handle.setAttribute('aria-valuenow', '-1');
        handle.setAttribute('aria-valuetext', 'NO RESPONSE');

        return handle;
    }

    createLabels() {
        let labelsContainer = document.createElement('ol');
        labelsContainer.className = 'cf-single-slider-question__labels';

        let intervalSize = 100 / this.values.length;
        for (let i = 0; i < this.values.length; i++) {
            let startInterval = Utils.round(i * intervalSize, 2);
            let endInterval = Utils.round((i + 1) * intervalSize, 2);
            let labelOffset = Utils.floor((startInterval + endInterval) / 2, 2);

            let value = this.values[i];
            let label = this.createLabel(value.code, value.text);

            this.setLabelOffset(label, value.text, labelOffset);
            this.setLabelVisibility(label, value.text);

            labelsContainer.insertAdjacentElement('beforeend', label);
        }

        return labelsContainer;
    }

    createLabel(valueCode, valueText) {
        let label = document.createElement('li');
        label.setAttribute('class', 'cf-single-slider-question__label');
        label.setAttribute('id', this.id + '_' + valueCode + '_label');

        let answerText = document.createElement('div');
        answerText.setAttribute('class', 'cf-single-slider-question__answer-text');
        answerText.setAttribute('id', this.id + '_' + valueCode + '_text');
        answerText.innerHTML = valueText;

        label.insertAdjacentElement('beforeend', answerText);

        return label;
    }

    setContainerSize(containerElement, size) {
        if(this.settings.direction === SLIDER_DIRECTION.vertical ||
            this.settings.direction === SLIDER_DIRECTION.verticalBtt) {
            if(!size) {
                size = this.valuesWithStep.length * 3 * 16; //1em = 16px, 3 - magic number
            }
            containerElement.style.height = size + 'px';
        } else {
            containerElement.style.width = size + 'px';
        }
    }

    setLabelOffset(label, labelText, labelOffset) {
        if(this.settings.direction === SLIDER_DIRECTION.vertical ||
            this.settings.direction === SLIDER_DIRECTION.verticalBtt) {
            label.style.top = labelOffset.toString() + '%';
        } else {
            label.style.left = labelOffset.toString() + '%';
            //label.style.marginLeft = (-0.25 + labelText.length * -0.25).toString() + 'em';
        }
    }

    setHorizontalSliderLabelMargins(labels) {
        let fontSizeInPixels = window.getComputedStyle(labels[0]).fontSize;
        let fontSize = fontSizeInPixels.substring(0, fontSizeInPixels.length - 2);
        Array.prototype.forEach.call(labels, function(label) {
            let labelWidth = label.clientWidth;
            label.style.marginLeft = - (labelWidth / 2) / fontSize + 'em';
        });
    }

    setLabelVisibility(label, labelText) {
        if (!this.valuesWithStep.includes(labelText)) {
            label.classList.add('hidden');
        }
    }

    /**
     * @param {number} start
     * @param {number} end
     * @param {number} step
     * @return {Array} returns an array of numbers
     */
    getValuesWithStep(start, end, step) {
        let values = [];

        let currentValue = start;

        while (currentValue <= end) {
            values.push(currentValue.toString());

            currentValue += step;
        }

        return values;
    }

    setDefaultStylesIfNeeded(sliderContainer) {
        if(!sliderContainer) {
            return;
        }
        let sliderTrackArea = document.querySelector('#' + this.id + ' .cf-slider__track-area');
        let stylesToCursorApplied =  window.getComputedStyle(sliderTrackArea).cursor === "pointer";

        if(!(stylesToCursorApplied)) {
            sliderContainer.classList.add('default-styles_active');
        }
    }
}