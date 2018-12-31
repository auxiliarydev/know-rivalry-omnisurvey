'use strict';

var Omnisurvey = function($, data, leagueId, surveyId) {

	var surveySelectionQuestionId = 'QID182',
			$surveySelectionQuestion = $('#'+surveySelectionQuestionId),
			$nextButton = $('#SplashMyNextButton'),
			$SplashChangeLeagueBtnDiv = $('#SplashChangeLeagueBtnDiv'),
			$SplashChangeLeagueBtn = $SplashChangeLeagueBtnDiv.find('button'),
			strLeagueImageRootDir = 'https://knowrivalry.com/images/logos/';

	//var strSurvqSelectLgID = "QID182"; // Manually set the name of the Qualtrics QuestionID for the question where the user selects the league
	// Additional note: I need to put something like console.log(this.getQuestionInfo().QuestionID) on the SelectLgID question's JS or else the JS in here won't work
	
	// Toward the end of this JS code, the "objDataTableRows" is defined. This is used to create the Embedded Data within Qualtrics.
	// If you add more data tables, you need to also add entries to that variable definition.
	// We can declare objDataTableRows here, but we can't define the variable because we need to wait until lgID is finalized.
	// We declare this as an object by using {}. While technically its data type could change later on, this at least tells JS (and you, future reader) what the data type is supposed to be.
	var objDataTableRows = {};
		
	function toggleLeagueSelect() {
		$surveySelectionQuestion.slideToggle();
		$SplashChangeLeagueBtnDiv.toggle();
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

	// TODO: Talk to David about what this is trying to accomplish
	function fSubmitPageData(){
		// TASKS BEFORE ADVANCING IN SURVEY
		// The main thing this function does is to write the values into the embedded data variables within Qualtrics.
		// In some cases we want to write new embedded data, in other cases we don't, thus we need to write it with code rather than within the Qualtrics Survey Flow.
		// Also, something like the survID can only be set using the JavaScript.
		
		// This function is mostly about doing stuff (i.e., reading and writing data). But, it also provides information about whether it was successful in its reading/writing.
		// It will return true/false so that other parts of the code will know if it completed successfully or not; specifically, the blnPageSubmitSuccess uses this information.

		
		// DETERMINE THE OFFICIAL ID NUMBERS
		// For every data table we have, we need to know the ID number for the important lookup data within that table.
		// If we add more data tables in the future, we'll need to also add more "official ___" sections of code here in order to pull the correct data row from the tables.
		
		// DETERMINE THE OFFICIAL lgID
		// If the lgID is null/empty/NaN/0, check to see if the user has made a selection
		if (Boolean(leagueId) === false) {
			// Read lgID value as selected by the user. Note that this is the RE-CODED VALUE that I set within Qualtrics to match the lgID within our database.
			var theReturnedSelectedChoice = fMCQuesSelectedChoice(surveySelectionQuestionId);
			
			// ERROR HANDLING
			// Because I created my own next button (among all the other JS code), I need to do my own custom validation to not let the user advance if ldID is null.
			if (Boolean(theReturnedSelectedChoice) === false) {
				// The user STILL hasn't selected a league. Don't let them move on.
				fErrorText("SplashErrorSelectLeague", true); // Put error text above the league selector question
				fScrollToSelectLgID(); // Scroll user back to the league selector question
				return false; // fSubmitPageData() returns false because it was unsuccessful in its mission to write valid data to Qualtrics
			}
		}
		
		// DETERMINE THE OFFICIAL survID
		// If the function has moved down this far, it means we have a valid lgID. We'll use that to assign the survID, if that hasn't been assigned already through the URL.
		// If the survID is null/empty/NaN/0, assign the survID based on the lgID				
		if (Boolean(surveyId) === false) {
			surveyId = data.tbljsLeagues[fLeagueJSName(leagueId)].lgCurrentSurvID;
		}

		// These values are set now, so I'm writing them to function-level variables so I don't need to repeatedly call the fLeagueJSName/fSurveyJSName functions. The code is cleaner and faster this way.
		var strLgObjName = fLeagueJSName(leagueId); // e.g., "lgID_001"
		var strSurvObjName = fSurveyJSName(surveyId); // e.g., "survID_001"

		
		// WRITE THE EMBEDDED DATA TO QUALTRICS
		// This will write EVERY property within the data table variables (e.g., tbljsLeagues, tbljsSurveys) as an embedded data variable within Qualtrics (whether we end up using it or not).
		// If the embedded data element doesn't exist in the survey flow yet, Qualtrics will create that variable.
		// You won't see it in the Qualtrics survey flow, but it exists [at least, I think that's what's happening].
	
		// First, declare an object variable that holds the data we're going to put into the Qualtrics embedded data.
		var objDataToEmbed = {};

		
		// This is an array of only the relevant rows within each data table that we use. Each "row" is the object named something like "lgID_001" or "survID_001".
		// If you add a new data table, you need to add a new value to this array. We cannot define this earlier because we need to wait to know the correct lgID and survID to use
		objDataTableRows = [data.tbljsLeagues[strLgObjName], data.tbljsSurveys[strSurvObjName]];
		var objTableRow = {};

		// ITERATION #1: EACH DATA TABLE ROW
			// The first iteration is through the data tables; right now (July 2018) there are only two: tbljsLeagues, tbljsSurveys.
			// Remmber that it's not pulling the whole table object. Because of how we defined objDataTableRows, it's saving us a step by only pulling the object that defines the specific row.
			// Each paramTableRow is the equivalent of the tbljsLeagues["lgID_008"] object, then the tbljsSurveys["survID_008"] object, etc.
			$.each(objDataTableRows, function(paramTableRow) {

				// We define a new object variable here each time through the iteration (e.g., if there are two tables, this will be defined twice).
				// Each iteration creates an object of all the key:value pairs for the specific row within that data table. i.e., the actual data we want want to write to Qualtrics.
				objTableRow = objDataTableRows[paramTableRow];
				
			// ITERATION #2: EACH PROPERTY ENTRY
				// In this second iteration, we loop through each property (key:value) within the table row.
				// The paramTblProperty variable is the property name, which is also the name of the field within RivalryDB and the Qualtrics Embedded Data (e.g., lgID, lgSlug, survLaunchDate, BLOCKIntro, BLOCKFavTeam)
				$.each(objTableRow, function (paramTblProperty) {
					
					// The objTableRow[paramTblProperty] statement dynamically creates the key:value pair and writes a new line into the objDataToEmbed object
					// e.g., the first iteration would write "lgID: 2", the second iteration would write "lgSport: Ice hockey", etc. 
					
					objDataToEmbed[paramTblProperty] = objTableRow[paramTblProperty];
					
					// We could put at third iteration in here to write the data directly into Qualtrics. If we did that, we wouldn't bother with the objDataToEmbed variable. 
					// But, my preference is to write to the variable first so I can see what's happening and to give me a little more control over the data values, should I need it.
					// Having the ^Writing to Qualtrics^ step broken out is a little cleaner, too. This code is already complicated enough for a rookie like me.
					
				}); // close off the key:value iteration
			}); // close off the data table itereation

		// This actually writes the data to Qualtrics by iterating through the objDataToEmbed object.
		// It reads each property key:value pair (which I called propKeyED:propValueED) and stores it as embedded data within Qualtrics
		$.each(objDataToEmbed, function(propKeyED, propValueED) {
			// The Qualtrics setEmbeddedData('name',value) method takes two parameters. The first is the name of the embedded data variable (string), the second is the value we want stored.
			Qualtrics.SurveyEngine.setEmbeddedData(propKeyED, propValueED);
		});

		// The fSubmitPageData() function returns true because it was successful in its mission (e.g., writing valid data to Qualtrics)
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
		$surveySelectionQuestion.hide();
		$nextButton.show();

		if (leagueId > 0) {
			selectLeague(leagueId);
			//DisplayHideElementsIfLeaguePicked(leagueId);	
		} else {
			toggleLeagueSelect();
			//NoLeaguePickedShowHideElements();
		}

		$SplashChangeLeagueBtn.on('click', changeLeagueButtonHandler);

		// RUN CODE ON PAGE SUBMIT
		$nextButton.on('click', function() {
			var blnPageSubmitSuccess = fSubmitPageData(); // If the code runs smoothly, it will return true. If not, it will return false (or worse).
			if (blnPageSubmitSuccess === true) { // only advance in the survey if the validation checks out, the data were successfully read and written to Qualtrics, etc.
				//TheJSThis.clickNextButton();
				// TODO: This needs to move outside of this class
				Qualtrics.SurveyEngine.Page.pageButtons.clickNextButton();
			}
		});

		// TODO: This needs to move outside of this class. The functionality should stay, but getting the league ID can happen when the next button is clicked.
		if (window.Qualtrics && Qualtrics.SurveyEngine) {
			Qualtrics.SurveyEngine.getInstance(surveySelectionQuestionId).questionclick = function(event, element) {
				if (element.type == 'radio') {  //for a single answer multiple choice question, the element type will be radio
					var leagueQuestion = Qualtrics.SurveyEngine.getInstance(questionID);
					var selectedChoice = leagueQuestion.getSelectedChoices()[0];
					var leagues = leagueQuestion.getQuestionInfo().Choices;
					var selectedLeagueId = parseInt(leagues[selectedChoice].RecodeValue);

					leagueId = selectedLeagueId;
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

var Omnisurvey_Data = {
	// The data tables below are copy/pasted from data outputted by Access (RivDB_BuildSurvey)
	tbljsLeagues: { 
		lgID_001: {lgID:1, lgSport:"American football", lgName:"NCAA DI-A", lgCurrentSurvID:13, lgSlug:"s_m_afb_ncaad1a", lgFullName:"NCAA Division I FBS football", lgTheFullName:"NCAA Division I FBS football", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_002: {lgID:2, lgSport:"Ice hockey", lgName:"NHL", lgCurrentSurvID:14, lgSlug:"s_m_hok_nhl", lgFullName:"National Hockey League", lgTheFullName:"the National Hockey League", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_003: {lgID:3, lgSport:"American football", lgName:"NFL", lgCurrentSurvID:15, lgSlug:"s_m_afb_nfl", lgFullName:"National Football League", lgTheFullName:"the National Football League", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_004: {lgID:4, lgSport:"Soccer", lgName:"MLS", lgCurrentSurvID:16, lgSlug:"s_m_soc_mls", lgFullName:"Major League Soccer", lgTheFullName:"Major League Soccer", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_005: {lgID:5, lgSport:"Baseball", lgName:"MLB", lgCurrentSurvID:17, lgSlug:"s_m_bas_mlb", lgFullName:"Major League Baseball", lgTheFullName:"Major League Baseball", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_006: {lgID:6, lgSport:"Basketball", lgName:"NBA", lgCurrentSurvID:18, lgSlug:"s_m_bkb_nba", lgFullName:"National Basketball Association", lgTheFullName:"the National Basketball Association", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_007: {lgID:7, lgSport:"Cricket", lgName:"BBL", lgCurrentSurvID:19, lgSlug:"s_m_t20_bbl", lgFullName:"Big Bash League", lgTheFullName:"the Big Bash League", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:0}, 
		lgID_008: {lgID:8, lgSport:"Cricket", lgName:"IPL", lgCurrentSurvID:20, lgSlug:"s_m_t20_ipl", lgFullName:"Indian Premier League", lgTheFullName:"the Indian Premier League", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:0}, 
		lgID_009: {lgID:9, lgSport:"Basketball", lgName:"NCAAM", lgCurrentSurvID:21, lgSlug:"s_m_bkb_ncaad1", lgFullName:"NCAA Division I men's basketball", lgTheFullName:"NCAA Division I men's basketball", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_010: {lgID:10, lgSport:"Basketball", lgName:"NCAAW", lgCurrentSurvID:22, lgSlug:"s_w_bkb_ncaad1", lgFullName:"NCAA Division I women's basketball", lgTheFullName:"NCAA Division I women's basketball", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_011: {lgID:11, lgSport:"American football", lgName:"NCAA DI-AA", lgCurrentSurvID:23, lgSlug:"s_m_afb_ncaad1aa", lgFullName:"NCAA Division I FCS football", lgTheFullName:"NCAA Division I FCS football", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_012: {lgID:12, lgSport:"Soccer", lgName:"England men", lgCurrentSurvID:24, lgSlug:"s_m_soc_eng", lgFullName:"English men's football", lgTheFullName:"English men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_013: {lgID:13, lgSport:"Soccer", lgName:"Spain men", lgCurrentSurvID:25, lgSlug:"s_m_soc_esp", lgFullName:"Spanish men's football", lgTheFullName:"Spanish men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_014: {lgID:14, lgSport:"Soccer", lgName:"Germany men", lgCurrentSurvID:26, lgSlug:"s_m_soc_deu", lgFullName:"German men's football", lgTheFullName:"German men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_015: {lgID:15, lgSport:"Soccer", lgName:"International men", lgCurrentSurvID:27, lgSlug:"s_m_soc_intl", lgFullName:"International men's football", lgTheFullName:"International men's football", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_016: {lgID:16, lgSport:"Soccer", lgName:"International women", lgCurrentSurvID:28, lgSlug:"s_w_soc_intl", lgFullName:"International women's football", lgTheFullName:"International women's football", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
	},

	tbljsSurveys: {
		survID_001: { survID:1, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_002: { survID:2, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_003: { survID:3, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_004: { survID:4, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_005: { survID:5, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_006: { survID:6, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_007: { survID:7, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_008: { survID:8, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_009: { survID:9, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_010: { survID:10, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_011: { survID:11, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_012: { survID:12, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_013: { survID:13, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_014: { survID:14, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_015: { survID:15, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_016: { survID:16, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_017: { survID:17, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_018: { survID:18, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_019: { survID:19, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_020: { survID:20, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:true},
		survID_021: { survID:21, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_022: { survID:22, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_023: { survID:23, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_024: { survID:24, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_025: { survID:25, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_026: { survID:26, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_027: { survID:27, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_028: { survID:28, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
	},

	testChoices: {
		1: {RecodeValue: "5", VariableName: "s_m_bas_mlb", Text: "MLB (Major League Baseball)", Exclusive: false},
		2: {RecodeValue: "4", VariableName: "s_m_soc_mls", Text: "MLS (Major League Soccer)", Exclusive: false},
		3: {RecodeValue: "6", VariableName: "s_m_bkb_nba", Text: "NBA (National Basketball Association)", Exclusive: false},
		4: {RecodeValue: "3", VariableName: "s_m_afb_nfl", Text: "NFL (National Football League)", Exclusive: false},
		5: {RecodeValue: "2", VariableName: "s_m_hok_nhl", Text: "NHL (National Hockey League)", Exclusive: false},
		6: {RecodeValue: "8", VariableName: "s_m_t20_ipl", Text: "IPL (Indian Premier League cricket, men)", Exclusive: false},
		7: {RecodeValue: "4", VariableName: "s_m_soc_mls", Text: "Canada/USA (MLS)", Exclusive: false},
		8: {RecodeValue: "1", VariableName: "s_m_afb_ncaad1a", Text: "FBS football (DI-A)", Exclusive: false},
		9: {RecodeValue: "11", VariableName: "s_m_afb_ncaad1aa", Text: "FCS football (DI-AA)", Exclusive: false},
		10: {RecodeValue: "9", VariableName: "s_m_bkb_ncaad1", Text: "Men's basketball (DI)", Exclusive: false},
		11: {RecodeValue: "10", VariableName: "s_w_bkb_ncaad1", Text: "Women's basketball (DI)", Exclusive: false},
		12: {RecodeValue: "12", VariableName: "s_m_soc_eng", Text: "English (and UK teams in Football League & EPL), men", Exclusive: false},
		13: {RecodeValue: "14", VariableName: "s_m_soc_deu", Text: "Germany, men", Exclusive: false},
		14: {RecodeValue: "13", VariableName: "s_m_soc_esp", Text: "Spain, men", Exclusive: false},
		15: {RecodeValue: "15", VariableName: "s_m_soc_intl", Text: "National teams, men", Exclusive: false},
		16: {RecodeValue: "16", VariableName: "s_w_soc_intl", Text: "National teams, women", Exclusive: false}
	}
};

(function () {
	var OMNISURVEY_TEST = true,
			leagueId = -1,
			surveyId = -1;

	if (OMNISURVEY_TEST || !window.Qualtrics) {

		/*****************************************************
			TESTING
		*****************************************************/
		leagueId = 2; //7
		//surveyId = 2;

		jQuery('body').prepend('<div id="testing">The survey is in test mode.</div>');

	} else {
		
		Qualtrics.SurveyEngine.addOnload(function() {
			leagueId = parseInt(Qualtrics.SurveyEngine.getEmbeddedData('lgID'));
			
			if (!isNaN(Qualtrics.SurveyEngine.getEmbeddedData('survID'))) {
				surveyId = parseInt(Qualtrics.SurveyEngine.getEmbeddedData('survID'));
			}

			this.hideNextButton();
		});

		Qualtrics.SurveyEngine.addOnReady(function() {
			//Place your JavaScript here to run when the page is fully displayed
		});

		Qualtrics.SurveyEngine.addOnUnload(function() {
			//Place your JavaScript here to run when the page is unloaded
		});

	}

	var omnisurvey = new Omnisurvey(jQuery, Omnisurvey_Data, leagueId, surveyId); // this is what loads the Omnisurvey
})();





	/*Place your JavaScript here to run when the page loads*/

	// Using strict mode syntax forces me to write better code. Since I'm new to heavier JS, I WANT the code to throw errors  rather than letting me get away with bad practices that will bite me in the ass later on.
	// For testing purposes (e.g., JSBin) I need to put a reference to jQuery at the top
	// <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>	
	
	// DECLARE/DEFINE VARIABLES AND VARIABLE OBJECTS (i.e., lookup tables)
	// This has to be done first, before they can be referenced elsewhere in the code. (actually, I can declare them anywhere and they'll be hoisted up, but values stored in them don't get hoisted.)

	// Several of these variables are set manually. I doubt these will ever change, but I put them up front just in case to make it easier on the developer (i.e., future me).
	// I know, convention says I should put them in all caps because they're constants, but I can't bring myself to do it; they're just not that important.
	// These should be set with const instead of var, but since const still doesn't work with all browsers (IE8), I'm sticking with var.
	


	/* UNUSED CODE	
		
	/*
	Originally I was going to completely reload the page when the user clicked the change the league, but then I realized it was easier to just show/hide the important elements.
		function ResetLgIDOnSplashPage() {
			var ExistingSurvID = Qualtrics.SurveyEngine.getEmbeddedData('survID');
			var strOmniSurveyURL = 'https://wcu.az1.qualtrics.com/jfe/form/SV_b8bo2ct7HLrqGUZ?lgID=0';
			if (Boolean(ExistingSurvID)===true) {
				var strOmniSurveyURL = strOmniSurveyURL + '&survID=' + ExistingSurvID;
			}
			location.assign(strOmniSurveyURL);
		}
		
		
	/*
	At first I was defining each embedded data variable. While this was easier to read & understand than the iteration approach I used above,
	it was a lot of maintenance (when adding/removing variables) and created plenty of opportunity for human error.
	So, I changed it to the jQuery that just rewrote the corrects rows within the jsTables to new Embedded Data variables within Qualtrics
	A big downside of my initial approach was that I had to define each ED variable within the Qualtrics survey flow to use the setEmbeddedData function. (later I learned that isn't actually true. Probably was at one time.)
	A downside of the new approach (jQuery.each iterations) is that the embedded data fields have to have the same name as the fields within the RivalryDB, but that's probably a good thing anyway.

	// The Properties (first column) are the names of the embedded data variables within Qualtrics; the Values (second column) are what we're actually writing.
	// I broke them out by tbljsLeagues & tbljsSurveys, but only for visual purposes (just like tabbing the columns). There's no programmatic reason for it.
	// The first two properties are necessary. The others... well, I don't know what we'll use yet, but the harm in writing them is minmimal.			

	var objDataToEmbed = {
		lgID: 					intLgID,
		survID: 				intSurvID,

		// Pulled from tbljsLeagues
		lgSlug: 				tbljsLeagues[strLgObjName].lgSlug,
		lgFullName: 			tbljsLeagues[strLgObjName].lgFullName,
		lgSport: 				tbljsLeagues[strLgObjName].lgSport,
		lgTheFullName: 			tbljsLeagues[strLgObjName].lgTheFullName,
		lgBritishSpelling:		tbljsLeagues[strLgObjName].lgBritishSpelling,

		// Pulled from tbljsSurveys	
		survLaunchDate: 		tbljsSurveys[strSurvObjName].survLaunchDate,
		survInfConsTLDR:		tbljsSurveys[strSurvObjName].survInfConsTLDR,
		survInfConsFullText:	tbljsSurveys[strSurvObjName].survInfConsFullText
	}; // Make sure that the last value in the list above does NOT have a comma at the end of it. That's a classic JavaScript error.

	// CHOOSE WHICH SURVEY BLOCKS TO SHOW AS PART OF THE SURVEY
	// This determines how many characters in the survey block prefix for the Embedded Data variables. Right now it's 5 (B-L-O-C-K), but since that could change, I made this dynamic.
	var strBlockPrefix = "BLOCK"; // This is the prefix that will start every embedded data variable for the survey blocks [<-- I'd set this at the very top originally]
	var intBlockPrefixLen = strBlockPrefix.length;
	// Iterate through tbljsSurveys to write true/false to the embedded data variable for each survey block
	jQuery.each(tbljsSurveys[fSurveyJSName(intSurvID)], function (propName, propValue) {
		if (propName.substr(0,intBlockPrefixLen) === strBlockPrefix) { // Does the property name start with the designated prefix? (BLOCK)
			Qualtrics.SurveyEngine.setEmbeddedData(propName,propValue);
		};
	});
	*/
