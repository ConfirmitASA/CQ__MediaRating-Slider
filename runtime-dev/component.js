import SliderOpenComponent from "../lib/slider/slider-open-component.js";
import {SLIDER_DIRECTION} from "../lib/slider/constants";
import videojs from "video.js";
import {DEFAULT_SLIDER_SETTINGS} from "../lib/slider/slider-default-settings";

class MediaRatingQuestion {
	constructor(currentQuestion, mediaOptions, questionSettings) {
		this.question = currentQuestion;
		this.options = mediaOptions ?? {};
		this.questionSettings = questionSettings;
		this.checks = 0;
		this.sliderMoved = false;
		// not in use yet; for future adaptation of the question depending on the screen orientation
		//this.screenOrientation = this.getOrientation();
		this.primaryBackground = getComputedStyle(document.querySelector(".cf-navigation-next")).getPropertyValue("background-color");
		this.questionElement = document.querySelector('#' + this.question.id);
		this.videoDuration = 0;
		this.currentLanguage = String(Confirmit.page.surveyInfo.language);
		this.devErrors = [];
		this.handleNoValueOffset = 48;
		this.init();
	}

	get videoSliderContainerNode() {
		return document.querySelector('#' + this.question.id + ' .video-slider-container');
	}

	get sliderContainerNode() {
		return document.querySelector('#' + this.question.id + ' .slider-container');
	}

	get videoContainerNode() {
		return document.querySelector('#' + this.question.id + ' .video-container');
	}

	get buttonStartVideoContainerNode() {
		return document.querySelector('#' + this.question.id + ' .button-container');
	}

	get videoNode() {
		return document.querySelector('#' + this.question.id + '-rate-video');
	}

	get timingContainerNode() {
		return  document.querySelector('#' + this.question.id + ' .videoTiming');
	}

	get timingContainerHeight() {
		return  !!this.timingContainerNode ? this.timingContainerNode.clientHeight : 24;
	}

	init() {
		this.devErrors = this.checkRequiredOptions();
		if (this.devErrors.length > 0) {
			document.getElementById(this.question.id).innerHTML = '<div style="color: red;">' + this.devErrors.join('<br />') + '</div>';
		} else {
			//document.getElementById(this.question.id).querySelectorAll('.cf-open-answer')[0].style.display = 'none';
			this.ensureBackwardCompatibilityV1();
			this.setDefaultOptions();
			this.options.sliderSettings = this.getSliderSettings();
			document.querySelector('body').insertAdjacentHTML('afterbegin', '<div id="popup" class="hide"><div id="popup-content"></div></div>');
			this.renderVideoRatingQuestion();
		}
	}

	checkRequiredOptions() {
		if (!this.options.hasOwnProperty("src") || (this.options.hasOwnProperty("src") && this.options.src == "")) {
			this.devErrors.push("Option \"src\" is required");
		}
		return this.devErrors;
	}

	ensureBackwardCompatibilityV1() {
		//scaleStep option was added with v2
		if(!this.options.hasOwnProperty('scaleStep')) {
			// scaleStart default option used to be = 0 in v1 (now it is 'no value' previously there was no 'no value' option)
			if(this.options.hasOwnProperty('scaleStart') && this.options.scaleStart === '') {
				this.options.scaleStart = 0;
			}
			// in v1 only min and max labels were shown therefore need to calculate scaleStep value accordingly
			let minLabelValue = (this.options.hasOwnProperty('scaleMin') && this.options.scaleMin !== '') ? parseInt(this.options.scaleMin) : -50;
			let maxLabelValue = (this.options.hasOwnProperty('scaleMax') && this.options.scaleMax !== '') ? parseInt(this.options.scaleMax) : 50;
			this.options.scaleStep = maxLabelValue - minLabelValue;
		}
	}

	setDefaultOptions() {
		if (!this.options.hasOwnProperty("type") || (this.options.hasOwnProperty("type") && this.options.type == "")) {
			this.options.type = "video";
		}
		if (!this.options.hasOwnProperty("width") || (this.options.hasOwnProperty("width") && this.options.width == "")) {
			this.options.width = 640;
		}
		if (!this.options.hasOwnProperty("poster") || (this.options.hasOwnProperty("poster") && this.options.poster == "")) {
			this.options.poster = "";
		}
		if (!this.options.hasOwnProperty("sliderPosition") || (this.options.hasOwnProperty("sliderPosition") && this.options.sliderPosition == "")) {
			this.options.sliderPosition = "bottom";
		}
		if (!this.options.playButtonText.hasOwnProperty(this.currentLanguage) || (this.options.playButtonText.hasOwnProperty(this.currentLanguage) && this.options.playButtonText[this.currentLanguage] == "")) {
			this.options.playButtonText[this.currentLanguage] = "Play";
		}
		if (!this.options.hasOwnProperty("playButtonColor") || (this.options.hasOwnProperty("playButtonColor") && this.options.playButtonColor == "")) {
			this.options.playButtonColor = this.primaryBackground;
		}
		if (!this.options.hasOwnProperty("playButtonTextColor") || (this.options.hasOwnProperty("playButtonTextColor") && this.options.playButtonTextColor == "")) {
			this.options.playButtonTextColor = "#ffffff";
		}
		if (!this.options.hasOwnProperty("countdown") || (this.options.hasOwnProperty("countdown") && this.options.countdown == "")) {
			this.options.countdown = 3;
		}
		if (!this.options.hasOwnProperty("timecheck") || (this.options.hasOwnProperty("timecheck") && this.options.timecheck == "")) {
			this.options.timecheck = 5;
		}
		if (!this.options.hasOwnProperty("warningsAmount") || (this.options.hasOwnProperty("warningsAmount") && this.options.warningsAmount == "")) {
			this.options.warningsAmount = 1;
		}
		if (!this.options.resetBtnText.hasOwnProperty(this.currentLanguage) || (this.options.resetBtnText.hasOwnProperty(this.currentLanguage) && this.options.resetBtnText[this.currentLanguage] == "")) {
			this.options.resetBtnText[this.currentLanguage] = "Reset";
		}
		if (!this.options.warningReset.hasOwnProperty(this.currentLanguage) || (this.options.warningReset.hasOwnProperty(this.currentLanguage) && this.options.warningReset[this.currentLanguage] == "")) {
			this.options.warningReset[this.currentLanguage] = "You don't seem to have moved your slider. Please click ‘Reset‘ to restart.";
		}
		if (!this.options.warningIOS.hasOwnProperty(this.currentLanguage) || (this.options.warningIOS.hasOwnProperty(this.currentLanguage) && this.options.warningIOS[this.currentLanguage] == "")) {
			this.options.warningIOS[this.currentLanguage] = "Media is loading and will start shortly.";
		}
		if (!this.options.hasOwnProperty("scaleMin") || (this.options.hasOwnProperty("scaleMin") && this.options.scaleMin === "")) {
			this.options.scaleMin = DEFAULT_SLIDER_SETTINGS.customScale.min;
		}
		if (!this.options.hasOwnProperty("scaleMax") || (this.options.hasOwnProperty("scaleMax") && this.options.scaleMax === "")) {
			this.options.scaleMax = DEFAULT_SLIDER_SETTINGS.customScale.max;
		}
		if (!this.options.hasOwnProperty("scaleStart") || (this.options.hasOwnProperty("scaleStart") && this.options.scaleStart === "")) {
			this.options.scaleStart = DEFAULT_SLIDER_SETTINGS.customScale.start;
		}
		if (!this.options.hasOwnProperty("scaleStep") || (this.options.hasOwnProperty("scaleStep") && this.options.scaleStep === "")) {
			this.options.scaleStep = DEFAULT_SLIDER_SETTINGS.customScale.step;
		}
	}

	getSliderSettings() {
		return {
			direction: '',
			isQuestionValue: false,
			isCustomScale: true,
			customScale: {
				min: parseInt(this.options.scaleMin),
				max: parseInt(this.options.scaleMax),
				start: parseInt(this.options.scaleStart),
				step: parseInt(this.options.scaleStep)
			}
		}
	}

	renderVideoRatingQuestion() {
		let object = this;
		// add standard question markup
		document.getElementById(this.question.id).innerHTML = '<div class="cf-question__text" id="' + this.question.id + '_text">' + this.question.text + '</div>' +
			'<div class="cf-question__instruction" id="' + this.question.id + '_instruction">' + this.question.instruction + '</div>' +
			'<div class="cf-question__error cf-error-block cf-error-block--bottom cf-error-block--hidden" id="' + this.question.id + '_error" role="alert" aria-labelledby="' + this.question.id + '_error_list">' +
			'<ul class="cf-error-list" id="' + this.question.id + '_error_list"></ul></div>' +
			'<div class="cf-question__content cf-question__content--no-padding"></div>';
		// add specific question markup
		const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		if (this.options.sliderPosition == 'left' || this.options.sliderPosition == 'right') {
			document.querySelector('#' + this.question.id + ' .cf-question__content').classList.add('slider-' + this.options.sliderPosition);
		}
		let notificationIos = '';
		if (iOS) {
			//<span style="text-transform:capitalize;">' + this.options.mediaType + '</span>
			notificationIos = '<div id="apple-warning">' + this.options.warningIOS[this.currentLanguage] + '</div>';
		}

		let minValAdditionalStyle, maxValAdditionalStyle;
		switch (this.options.sliderPosition) {
			case 'bottom':
				minValAdditionalStyle = 'top: 15px;';
				maxValAdditionalStyle = 'top: 15px; right: 0;';
				break;
			case 'left':
				minValAdditionalStyle = 'bottom: -10px; right: -30px;';
				maxValAdditionalStyle = 'top: -10px; right: -30px;';
				break;
			case 'right':
				minValAdditionalStyle = 'bottom: -10px; left: -30px;';
				maxValAdditionalStyle = 'top: -10px; left: -30px;';
				break;
			default:
				console.log('default');
		}

		document.querySelector('#' + this.question.id + ' .cf-question__content').insertAdjacentHTML('afterbegin', '' +
			notificationIos +
			'<div class="video-slider-container"><div class="video-container" style="width: ' + this.options.width + 'px; max-width: 82%;">' +
			'<div class="button-container"><button style="color: ' + this.options.playButtonTextColor + '; background: ' + this.options.playButtonColor + ';" type="button" id="startVideo_' + this.question.id + '" data-start="0">' + this.options.playButtonText[this.currentLanguage] + '</button></div>' +
			'</div>' +
			'<div class="slider-container">' +
			'</div></div></div>');

		//add video
		let video = document.createElement('video');
		video.setAttribute('id', this.question.id + '-rate-video');
		video.setAttribute('class', 'video-js');
		video.innerHTML = '<source src="' + this.options.src + '" type = "video/mp4" /><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href = "https://videojs.com/html5-video-support/" target = "_blank"> supports HTML5 video </a></p>';
		document.getElementById(this.question.id).querySelectorAll('.video-container')[0].appendChild(video);

		//video settings
		let controlsVal = false;
		if (iOS) {
			controlsVal = false;
		}

		let myPlayer = videojs(this.question.id + '-rate-video', {
			controls: controlsVal,
			autoplay: false,
			playsinline: true,
			preload: 'auto',
			responsive: true,
			poster: this.options.poster,
			fill: true
		});

		myPlayer.one("loadedmetadata", function(){ changeCounterDisplay(object) });

		//Changing duration to use a Math.round function
		function changeCounterDisplay(obj) {
			let counterMinutes = obj.setCounterMinutesDisplay(Math.floor(myPlayer.duration()));
			document.querySelector('#' + obj.question.id + ' .video-container').insertAdjacentHTML('beforeend', '<div class="videoTiming clearfix" style="background: ' + obj.primaryBackground + ';"><span class="videoTimingTitle"><span id="timeRemain">00:00</span>&nbsp;/&nbsp;<span id="videoLength">' + counterMinutes + ' </span></span></div>');
			obj.videoDuration = Math.floor(myPlayer.duration());
			obj.generateSparklines(Math.floor(myPlayer.duration()));
		};

		const nextBtn = document.querySelector('.cf-navigation-next');
		let nextButtonDisabled = false;
		let addResetBtn = false;

		if(object.question.required && (object.question.value === null || object.question.value.split("|")[1].split(",").length < Math.floor(myPlayer.duration()))) {
			nextButtonDisabled = true;
			if(object.question.value !== null) {
					addResetBtn = true;
			}
		}
		// if(addResetBtn) {
		//     document.querySelector('#startVideo').setAttribute('data-start', questionObj.question.value.split("|")[1].split(",").length.toString());
		//     document.querySelector('#' + questionObj.question.id + ' .button-container').insertAdjacentHTML('beforeend', '<button type="button" id="restartVideo" style="background: #000000; margin-left: 15px;">Reset</button>');
		// }
		if(nextButtonDisabled) {
			nextBtn.setAttribute('disabled', nextButtonDisabled.toString());
		} else {
			nextBtn.removeAttribute('disabled');
		}
		//}

		//countdown
		document.querySelector('#startVideo_' + this.question.id).addEventListener('click', function () { startVideo(object); })

		function startVideo(obj) {
			//myPlayer.currentTime(parseInt(document.querySelector('#startVideo').setAttribute('data-start'), '10'))
			myPlayer.play();
			myPlayer.pause();
			mySlider.container.classList.add("disabled");
			obj.playerCycle(myPlayer, mySlider);
			document.querySelector('#startVideo_' + obj.question.id).setAttribute('disabled', 'true');
		}

		function setVideoContainerPadding() {
			const buttonContainer = this.buttonStartVideoContainerNode;
			let paddingValue = buttonContainer.offsetHeight + parseFloat(window.getComputedStyle(buttonContainer)['marginBottom']);
			paddingValue += this.timingContainerHeight;

			this.videoContainerNode.style.paddingBottom = paddingValue + 'px';
		}

		window.addEventListener('load', setVideoContainerPadding.bind(this));

		let mySlider = this.addSlider();
	}

	addSlider() {
		let sliderContainer = this.sliderContainerNode;

		if (this.options.sliderPosition === 'left' || this.options.sliderPosition === 'right') {
			this.options.sliderSettings.direction = this.options.revertSliderMarksOrder ?  SLIDER_DIRECTION.verticalBtt : SLIDER_DIRECTION.vertical;
			const videoTop = this.videoNode.getBoundingClientRect().top;
			const videoSliderContainerTop = this.videoSliderContainerNode.getBoundingClientRect().top;
			sliderContainer.style.marginTop = videoTop - videoSliderContainerTop - this.handleNoValueOffset + 'px';
			window.addEventListener('resize', updateSliderHeight.bind(this));
			window.addEventListener('load', updateSliderHeight.bind(this));
		}
		if (this.options.sliderPosition === 'bottom') {
			this.options.sliderSettings.direction = SLIDER_DIRECTION.horizontal;
			if(this.question.isRtl) {
				sliderContainer.style.marginRight = '-' + this.handleNoValueOffset + 'px';
			} else {
				sliderContainer.style.marginLeft = '-' + this.handleNoValueOffset + 'px';
			}

			window.addEventListener('resize', updateSliderWidth.bind(this));
			window.addEventListener('load', updateSliderWidth.bind(this));
		}

		function updateSliderHeight() {
			const sliderElement = document.querySelector('#' + this.question.id + '_slider');
			const videoHeight = parseFloat(getComputedStyle(this.videoNode).height.replace('px', ''));

			sliderElement.style.height = (videoHeight + this.handleNoValueOffset + this.timingContainerHeight).toString() + 'px';
		}

		function updateSliderWidth() {
			const videoSliderContainerWidth = this.videoSliderContainerNode.clientWidth;
			const sliderElement = document.querySelector('#' + this.question.id + '_slider');
			const sliderContainer = document.querySelector('#' + this.question.id + ' .slider-container');
			const videoWidth = parseFloat(getComputedStyle(this.videoNode).width.replace('px', ''));

			let newSliderWidth = videoWidth + this.handleNoValueOffset;
			if(newSliderWidth + this.handleNoValueOffset > videoSliderContainerWidth) {
				newSliderWidth = videoSliderContainerWidth;
				if(this.question.isRtl) {
					sliderContainer.style.marginRight = '-8px';
				} else {
					sliderContainer.style.marginLeft = '-8px';
				}
			} else {
				if(this.question.isRtl) {
					sliderContainer.style.marginRight = '-' + this.handleNoValueOffset + 'px';
				} else {
					sliderContainer.style.marginLeft = '-' + this.handleNoValueOffset + 'px';
				}
			}
			sliderElement.style.width = newSliderWidth.toString() + 'px';
		}

		let mySlider = new SliderOpenComponent(this.question, this.questionSettings, this.options.sliderSettings, sliderContainer, this.question.id + '_slider');

		let handleInner = document.createElement('span');
		let handle = document.querySelector('#' + mySlider.sliderId + ' .cf-slider__handle');
		handle.insertAdjacentElement('afterbegin', handleInner);
		if(getComputedStyle(handle).getPropertyValue('border-top-width') !== '0px') {
			handleInner.style.lineHeight = '1.6em';
		}
		let handleAfterElementBgColor = getHEXColor(getComputedStyle(handle, ':after').backgroundColor);
		let handleBgColor = handleAfterElementBgColor.includes('#000000') ? getHEXColor(getComputedStyle(handle).backgroundColor) : handleAfterElementBgColor;
		handleInner.style.color = handleBgColor.includes('#ffffff') ? '#000000' : '#ffffff';

		function getHEXColor(color) {
			if(!color.includes('rgb')) return '#00000000'; //IE returns 'transparent' for default value
			const rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`
			return  rgba2hex(color);
		}
		updateHandleValue(mySlider, handleInner);

		mySlider.changeEvent.on(() => updateHandleValue(mySlider, handleInner));

		function updateHandleValue(slider, handleInner) {
			handleInner.innerHTML = slider.getSliderValue() ? slider.getSliderValue() : '';
		}

		return mySlider;
	}

	adjustHexOpacity(color, opacity) {
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
	}

	setCounterMinutesDisplay(seconds) {
		let minutes = 0;
		let remainingSeconds = 0;
		if (seconds >= 60) {
			minutes = seconds / 60;
		}
		minutes = Math.floor(minutes);
		remainingSeconds = seconds % 60;
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (remainingSeconds < 10) {
			remainingSeconds = "0" + remainingSeconds;
		}
		return minutes + ":" + remainingSeconds;
	}

	generateSparklines(seconds) {
		if (this.options.showSparkline == true) {
			let lines = "";
			const width = parseFloat(getComputedStyle(this.questionElement.querySelector('#spark')).width.replace("px", ""));
			const widthPerSecond = width / seconds;
			const pcWidth = (widthPerSecond / width) * 100;
			for (let i = 0; i < seconds; i++) {
				lines += '<span style="width:' + pcWidth + '%;" class="spark-line" id="spark-' + i + '"></span>';
			}
			this.questionElement.querySelector("#spark").innerHTML = lines;
		}
	}

	playerCycle(player, sliderObj) {
		let object = this;
		let timeleft = parseInt(object.options.countdown);
		let startTimer = setInterval(function () {
			if (timeleft <= 0) {
				clearInterval(startTimer);
				document.querySelector('#startVideo_' + object.question.id).innerHTML = object.options.playButtonText[object.currentLanguage];
				sliderObj.container.classList.remove("disabled");
				sliderObj.setSliderValue(object.options.sliderSettings.customScale.start); //'null'
				player.play();
				var videoLength = Math.round(player.duration());
				object.collectData(player, videoLength, sliderObj);
				if (object.checks <= object.options.warningsAmount) {
					object.checkActivity(player, sliderObj);
				}
			}
			if (timeleft === 0) {
				document.querySelector('#startVideo_' + object.question.id).innerHTML = object.options.playButtonText[object.currentLanguage];
			} else {
				document.querySelector('#startVideo_' + object.question.id).innerText = timeleft;
			}
			timeleft -= 1;
		}, 1000);
	}

	checkActivity(player, sliderObj) {
		let object = this;
		//TO DO: why not used?
		const timecheck = object.options.timecheck - 1;
		if (object.checks <= object.options.warningsAmount) {
			player.on('timeupdate', function () {
				const second = Math.floor(player.currentTime());
				const currentValue = sliderObj.getSliderValue() === null ? '' : sliderObj.getSliderValue();
				if (currentValue !== object.options.sliderSettings.customScale.start.toString()) {
					object.sliderMoved = true;
				}
				if (object.checks <= object.options.warningsAmount && second === parseInt(object.options.timecheck) && !object.sliderMoved) {
					//restart video
					player.pause();
					sliderObj.container.classList.add("disabled");
					document.querySelector('#startVideo_' + object.question.id).innerHTML = object.options.playButtonText[object.currentLanguage];
					document.querySelector('#popup-content').innerHTML = '' +
						'<p>' + object.options.warningReset[object.currentLanguage] + '</p>' +
						'<button type="button" id="restartVideo_' + object.question.id + '" style="background: ' + object.options.playButtonColor + ';">' + object.options.resetBtnText[object.currentLanguage] + '</button>';
					document.querySelector('#popup').classList.remove('hide');
					document.querySelector('body').style.overflow = 'hidden';
				}
			});
			if (!object.sliderMoved) {
				object.checks++;
			}
		}

		document.querySelector('body').addEventListener('click', function (e) {
			let restartButton = document.querySelector('#restartVideo_' + object.question.id);
			if(e.target !== restartButton) {
				return;
			}
			object.closePopup();
			document.querySelector('#startVideo_' + object.question.id).innerHTML = object.options.playButtonText[object.currentLanguage];
			object.generateSparklines(object.videoDuration);
			object.restartVideo(player, sliderObj);
		});
	}

	closePopup() {
		document.querySelector('#popup').classList.add('hide');
		document.querySelector('body').style.overflow = 'auto';
	}

	//restart video
	restartVideo(player, sliderObj) {
		player.currentTime(0);
		this.playerCycle(player, sliderObj)
	}

	//get evaluation values every second of the media
	collectData(player, videoLength, sliderObj) {
		let videoAnswers = [];
		if(this.question.value) {
			videoAnswers = this.question.value.split("|")[1].split(",");
		}
		let object = this;
		player.on('timeupdate', function () {
			const second = Math.floor(player.currentTime());
			if (second >= 1) {
				videoAnswers[second - 1] = sliderObj.getSliderValue() ?? '-';
				const val = sliderObj.getSliderValue();
				let spark = document.querySelector("#spark-" + (second - 1));
				if(!!spark) {
					if(val > 0) {
						const pc = (val / object.options.sliderSettings.customScale.max) * 10;
						spark.style.height = pc+"px";
						spark.style.marginBottom = "10px";
						spark.style.backgroundColor = "green";
					} else if (val < 0){
						const pc = (val / object.options.sliderSettings.customScale.min) * 10;
						spark.style.height = pc + "px";
						spark.style.marginBottom = (10 - pc) + "px";
						spark.style.backgroundColor = "red";
					} else {
						spark.style.height = "2px";
						spark.style.marginBottom = "9px";
						spark.style.backgroundColor = "grey";
					}
				}
			}
			document.querySelector('#timeRemain').innerHTML = object.setCounterMinutesDisplay(second);
		});

		player.on('ended', () => {
			document.querySelector('.cf-navigation-next').removeAttribute('disabled');
			const data = object.checks + "|" + videoAnswers;
			object.setQuestionValue(data, object);
		});

		object.question.validationCompleteEvent.on(
			() => {
				const data = object.checks + "|" + videoAnswers;
				object.setQuestionValue(data, object);
			}
		);
	}

	//screen orientation
	getOrientation() {
		const orientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
		return orientation;
	}

	setQuestionValue(value, obj) {
		obj.question.setValue(value);
		// to be sure that it won't be changed manually in dev tools somehow
		obj.question.validationCompleteEvent.on(
			() => {
					obj.question.setValue(value);
			}
		);
	}
}

/* global register */
(function () {
    Confirmit.pageView.registerCustomQuestion(
			"2658c838-ae18-451b-a328-7e41d6190e49",
			function (question, customQuestionSettings, questionViewSettings) {
				new MediaRatingQuestion(question, customQuestionSettings, questionViewSettings);
			}
    );
})();