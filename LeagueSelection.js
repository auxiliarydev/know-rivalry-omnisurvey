'use strict';

var Omnisurvey_LeagueSelection = function($, data, leagueId, surveyId) {

	this.nextButtonHandler = function() { return true; };
	this.dataToEmbed = {}; // this object holds the data to embed in the survey

	var self = this,
			surveySelectionQuestionId = 'QID182',
			$surveySelectionQuestion = $('#'+surveySelectionQuestionId),
			$nextButton = $('#SplashMyNextButton'),
			$splashChangeLeagueBtn = $('#SplashChangeLeagueBtn'),
			strLeagueImageRootDir = 'https://knowrivalry.com/images/logos/';

	function toggleLeagueSelect() {
		$surveySelectionQuestion.slideToggle();

		if ($splashChangeLeagueBtn.css('visibility') === 'hidden') {
			$splashChangeLeagueBtn.css('visibility', 'visible');
		} else {
			$splashChangeLeagueBtn.css('visibility', 'hidden');
		}
		//$splashChangeLeagueBtn.toggle();
	}
		
	// Return user to the Select lgID question
	function fScrollToSelectLgID() {
		$('html, body').animate({
			scrollTop: ($("#SplashTitleText").offset().top)
		},500);
	}
		
	function fLeagueJSName(paramLgID) {
		// This converts a lgID into the JavaScript object name within tbljsLeagues (e.g,. 14 --> "lgID_014")
		return "lgID_"+("00" + paramLgID).slice(-3);
	}

	function fSurveyJSName(paramSurvID) {
		// This converts a survID into the JavaScript object name within tbljsSurveys (e.g,. 14 --> "survID_014")
		return "survID_"+("00" + paramSurvID).slice(-3);
	}

	//DISPLAY ERROR TEXT
	function fErrorText(paramElementID, paramIsError){
		// I made this more flexible than it needed to be, but I figured it was better to do it this way for the future (and because I wanted to try a switch-case).
		var strErrorText = "";

		if (paramIsError === true) {		// There is an error!
			switch (paramElementID) {		// Which element has the error?
				case "SplashErrorSelectLeague":
					strErrorText = "Please select a league before trying to continue.";
					break;
				default:
					strErrorText = "";
			}
		} else {
			strErrorText = "";
		}
		document.getElementById(paramElementID).innerHTML = strErrorText; // Set the text within the HTML element
	}

	function submitPageData() {
		// TASKS BEFORE ADVANCING IN SURVEY
		// The main thing this function does is to write the values into the embedded data variables within Qualtrics.
		// In some cases we want to write new embedded data, in other cases we don't, thus we need to write it with code rather than within the Qualtrics Survey Flow.
		// Also, something like the survID can only be set using the JavaScript.
		
		
		// DETERMINE THE OFFICIAL ID NUMBERS
		// For every data table we have, we need to know the ID number for the important lookup data within that table.
		// If we add more data tables in the future, we'll need to also add more "official ___" sections of code here in order to pull the correct data row from the tables.
		
		// DETERMINE THE OFFICIAL lgID
		// If the lgID is null/empty/NaN/0, check to see if the user has made a selection
		if (leagueId <= 0) {
			// Read lgID value as selected by the user. Note that this is the RE-CODED VALUE that I set within Qualtrics to match the lgID within our database.
			//var theReturnedSelectedChoice = fMCQuesSelectedChoice(surveySelectionQuestionId);
			
			// ERROR HANDLING
			fErrorText("SplashErrorSelectLeague", true); // Put error text above the league selector question
			fScrollToSelectLgID(); // Scroll user back to the league selector question
			return false;
		}
				
		// WRITE THE EMBEDDED DATA TO QUALTRICS
		// This will write EVERY property within the data table variables (e.g., tbljsLeagues, tbljsSurveys) as an embedded data variable within Qualtrics (whether we end up using it or not).
		// If the embedded data element doesn't exist in the survey flow yet, Qualtrics will create that variable.
		// You won't see it in the Qualtrics survey flow, but it exists [at least, I think that's what's happening].
	
		self.dataToEmbed = {};
		
		// write all properties of tbljsLeagues for selected league to embedded data
		var selectedLeague = data.tbljsLeagues[fLeagueJSName(leagueId)];
		$.each(selectedLeague, function(key) {
			self.dataToEmbed[key] = selectedLeague[key];
		});

		// write all properties of tbljsSurveys for selected survey to embedded data
		var surveyId = selectedLeague.lgCurrentSurvID;
		var selectedSurvey = data.tbljsSurveys[fSurveyJSName(surveyId)];
		$.each(selectedSurvey, function(key) {
			self.dataToEmbed[key] = selectedSurvey[key];
		});

		console.log('Submitting data:');
		console.log(self.dataToEmbed);

		return true;
	}

	function changeLeagueButtonHandler() {
		toggleLeagueSelect();
	}

	function selectLeague(id) {
		console.log('Selected League: '+id);
		leagueId = id;

		// change league image
		var leagueSlug = data.tbljsLeagues[fLeagueJSName(leagueId)].lgSlug;
		var leagueImgFilename = strLeagueImageRootDir + 'league_' + leagueSlug + '-md.png';
		$('#SplashWelcomeLeagueLogoDiv').css('background-image', 'url(' + leagueImgFilename + ')');
	}

	function init() {
		// CREATE MY OWN NEXT BUTTON
		// There was a problem with the real [Qualtrics] next button. If user clicks Next, it works. But if user clicks PREV on the InfCons page, then clicks Next again here, it doesn't fire.
		// I couldn't figure out the problem, so I just created my own next button.
		//TheJSThis.hideNextButton(); // hide the real [qualtrics] next button	
		
		// If there is a lgID assigned, hide/show the appropriate elements
		if (leagueId > 0) {
			$surveySelectionQuestion.hide();
			//$nextButton.show();

			selectLeague(leagueId);
		} else {
			toggleLeagueSelect();
		}

		$splashChangeLeagueBtn.on('click', changeLeagueButtonHandler);

		// RUN CODE ON PAGE SUBMIT
		$nextButton.on('click', function() {
			return submitPageData() && self.nextButtonHandler();
		});

		// TODO: This needs to move outside of this class. The functionality should stay, but getting the league ID can happen when the next button is clicked.
		if (window.Qualtrics && Qualtrics.SurveyEngine) {
			Qualtrics.SurveyEngine.getInstance(surveySelectionQuestionId).questionclick = function(event, element) {
				if (element.type == 'radio') {  //for a single answer multiple choice question, the element type will be radio
					var leagueQuestion = Qualtrics.SurveyEngine.getInstance(questionID);
					var selectedChoice = leagueQuestion.getSelectedChoices()[0];
					var leagues = leagueQuestion.getQuestionInfo().Choices;
					var selectedLeagueId = parseInt(leagues[selectedChoice].RecodeValue);

					selectLeague(selectedLeagueId);
					toggleLeagueSelect();
				}
			};
		} else {
			$surveySelectionQuestion.find('li.Selection input[type="radio"]').on('click', function() {
				var selectedValue = $(this).val();
				var selectedLeagueId = data.testChoices[''+selectedValue].RecodeValue;
				if (!isNaN(selectedLeagueId)) {
					selectLeague(selectedLeagueId);
					toggleLeagueSelect();
				}
			});
		}
	}

	init();	
};


/****************************************************************************************/


(function () {
	var OMNISURVEY_TEST = true,
			leagueId = -1,
			surveyId = -1,
			nextButtonHandler = function() {};

	if (OMNISURVEY_TEST || !window.Qualtrics) {

		/*****************************************************
			TESTING
		*****************************************************/
		// TODO: POLYFILL THIS FOR IE
		var searchParams = new URLSearchParams(window.location.search);
		if (searchParams.has('lgID')) {
			leagueId = searchParams.get('lgID'); //7
		}
		//surveyId = 2;

		jQuery('body').prepend('<div id="testing">The survey is in test mode.</div>');

		nextButtonHandler = function() {
			console.log('data would be submitted here');
			console.log(this.dataToEmbed);

			return true;
		};

	} else {
		
		Qualtrics.SurveyEngine.addOnload(function() {
			leagueId = parseInt(Qualtrics.SurveyEngine.getEmbeddedData('lgID'));
			
			if (!isNaN(Qualtrics.SurveyEngine.getEmbeddedData('survID'))) {
				surveyId = parseInt(Qualtrics.SurveyEngine.getEmbeddedData('survID'));
			}

			this.hideNextButton();

			nextButtonHandler = function() {
				$.each(this.dataToEmbed, function(key, value) {
					// The Qualtrics setEmbeddedData('name',value) method takes two parameters. The first is the name of the embedded data variable (string), the second is the value we want stored.
					Qualtrics.SurveyEngine.setEmbeddedData(key, value);
				});

				Qualtrics.SurveyEngine.Page.pageButtons.clickNextButton();

				return true;
			};
		});

		Qualtrics.SurveyEngine.addOnReady(function() {
			//Place your JavaScript here to run when the page is fully displayed
		});

		Qualtrics.SurveyEngine.addOnUnload(function() {
			//Place your JavaScript here to run when the page is unloaded
		});

	}

	var omnisurvey_LeagueSelection = new Omnisurvey_LeagueSelection(jQuery, Omnisurvey_Data, leagueId, surveyId); // this is what loads the Omnisurvey
	omnisurvey_LeagueSelection.nextButtonHandler = nextButtonHandler;
})();
