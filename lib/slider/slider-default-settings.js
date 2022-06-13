import {SLIDER_DIRECTION} from "./constants";

const DEFAULT_SLIDER_SETTINGS = {
    direction: SLIDER_DIRECTION.horizontal,
    isQuestionValue: false,
    isCustomScale: true,
    containerSize: '',
    customScale: {
        min: -50,
        max: 50,
        start: '',
        step: 10
    }
}

export {
    DEFAULT_SLIDER_SETTINGS
}