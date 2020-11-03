'use strict';

var Omnisurvey_LeagueSelection = function($, data, leagueId, surveyId) {

	this.nextButtonHandler;
	this.surveySelectionHandler;
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
		var selectedLeague = data.getLeague(leagueId);
		$.each(selectedLeague, function(key) {
			self.dataToEmbed[key] = selectedLeague[key];
		});

		// write all properties of tbljsSurveys for selected survey to embedded data
		var surveyId = selectedLeague.lgCurrentSurvID;
		var selectedSurvey = data.getSurvey(surveyId);
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
		var leagueSlug = data.getLeague(leagueId).lgSlug;
		var leagueImgFilename = strLeagueImageRootDir + 'league_' + leagueSlug + '-md.png';
		$('#SplashWelcomeLeagueLogoDiv').css('background-image', 'url(' + leagueImgFilename + ')');
	}

	this.leagueSelectionHandler = function(selectedLeagueId) {
		if (!isNaN(selectedLeagueId)) {
			selectLeague(selectedLeagueId);
			toggleLeagueSelect();
		}
	};

	function init() {
		// CREATE MY OWN NEXT BUTTON
		// There was a problem with the real [Qualtrics] next button. If user clicks Next, it works. But if user clicks PREV on the InfCons page, then clicks Next again here, it doesn't fire.
		// I couldn't figure out the problem, so I just created my own next button.
		//TheJSThis.hideNextButton(); // hide the real [qualtrics] next button	
		
		var league = null,
				survey = null;

		if (leagueId > 0) {
			league = data.getLeague(leagueId);
		}

		if (surveyId > 0) {
			// get the survey data
			survey = data.getSurvey(surveyId);

			if (survey != null) {
				// get the leagues associated with this survey
				var leagues = data.getLeaguesBySurvey(surveyId);

				if (leagues != null) {
					// TODO: ONLY DISPLAY THESE LEAGUES

				}
			}
		}

		// If there is a lgID assigned, hide/show the appropriate elements
		if (league != null) {
			// if survey isn't specified or
			// the survey is specified and the league is associated with the survey
			if (survey == null || league.lgCurrentSurvID === survey.survID) {
				$surveySelectionQuestion.hide();	
				selectLeague(leagueId);
			} else {
				toggleLeagueSelect();
			}
		} else {
			toggleLeagueSelect();
		}

		$splashChangeLeagueBtn.on('click', changeLeagueButtonHandler);

		// RUN CODE ON PAGE SUBMIT
		$nextButton.on('click', function() {
			return submitPageData() && (typeof self.nextButtonHandler === 'function' && self.nextButtonHandler());
		});

		// TODO: NEED TO FIGURE OUT A SOLUTION FOR THIS, FOR NOW JUST UNCOMMENT FOR TESTING
		/*$surveySelectionQuestion.find('li.Selection input[type="radio"]').on('click', function() {
			var selectedLeagueId = '';

			if (typeof self.surveySelectionHandler === 'function') {
				selectedLeagueId = self.surveySelectionHandler();
			} else {
				var selectedValue = $(this).val();
				var selectedLeagueId = parseInt(data.testChoices[''+selectedValue].RecodeValue);
			}

			if (!isNaN(selectedLeagueId)) {
				selectLeague(selectedLeagueId);
				toggleLeagueSelect();
			}
		});*/
	}

	init();	
};
