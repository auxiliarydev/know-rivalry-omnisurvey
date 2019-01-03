'use strict';

var Omnisurvey_FavoriteTeams = function($, leagueData) {

	// Eventually, these are what will be passed to the Qualtrics embedded data
	this.FavoriteTeamName = '';
	this.FavoriteTeamId = -1;
	this.SelectedLeague = null;
	
	var strTeamLogoRootDir = 'https://knowrivalry.com/images/logos/', // This is the folder that holds the logos (PNG files) for each team
			$filters = $('#filters'),
			$favTeamLogo = $('#DivFavTeamLogo'),
			$favTeamList = $('#DivFavTeamList'),
			$favTeamBtns = null;
	
	function createFilters() {
		for (var i=1; i<=leagueData.divisionLevelTerms.length; i++) {
			// create container for league level filter
			$filters.append('<h3>'+leagueData.divisionLevelTerms[i-1]+'</h3>');
			var $filterLevel = $('<div class="league-level-filter clearfix" id="DivFiltersLevel'+i+'" data-level="'+i+'"></div>').appendTo($filters);

			// create filters
			$.each(leagueData.divisionLevels[i-1], function(index, value) {
				$filterLevel.append('<div class="ClassFilter ClassFilterLevel'+i+'">'+value+'</div>');
			});
		}

		// add click handler for all filters
		$('.ClassFilter').on('click', filterClicked);
	}
	
	function createFavTeamButtons(){
		$.each(leagueData.teams, function(index, team) {
			var strTeamImgFilename = strTeamLogoRootDir + team.slug + '-logo-sm.png';
			$favTeamList.append('<div style="background-image: url('+strTeamImgFilename+')" id="btnTeamID'+('0' + team.id).slice(-4)+'" class="ClassFavTeam" data-id="'+team.id+'">'+team.name+'</div>');
		});

		$favTeamBtns = $('.ClassFavTeam');
		$favTeamBtns.on('click', favTeamClicked);
	}

	function filterClicked() {
		var filterValue = this.innerHTML;

		// get the level from the parent container
		var filterLevel = $(this).closest('.league-level-filter').data('level');

		if (filterLevel === undefined) {
			// show all
			showAllFavTeamButtons(true);
		} else {
			// hide all
			showAllFavTeamButtons(false);

			// show filtered teams
			$.each(leagueData.teams, function(index, team) {
				if (team.divisionLevels[filterLevel-1] == filterValue) {
					$favTeamBtns.filter('[data-id='+team.id+']').show();
				}
			});
		}
	}
	
	function favTeamClicked() {
		var $this = $(this);

		this.FavoriteTeamName = $this.html(); // This is the value that we'll eventually write to Qualtrics embedded data
		this.FavoriteTeamId = $this.data('id'); // This is the value that we'll eventually write to Qualtrics embedded data

		// Show the logo for the team
		changeTeamImage(this.FavoriteTeamId);

		// TODO: This needs to move outside of this class.
		if (window.Qualtrics && Qualtrics.SurveyEngine) {
			Qualtrics.SurveyEngine.Page.pageButtons.enableNextButton();
		}
	}

	// Change the team image shown
	function changeTeamImage(teamId) {
		// This function will dynamically change the image to show the correct image for the Favorite Team.
		var teamNameSlug = leagueData.teams.filter(function(team) {
					return team.id == teamId;
				})[0].slug, 
				imgPath = strTeamLogoRootDir + teamNameSlug + '-logo.png';

		$favTeamLogo.css('background-image', 'url(' + imgPath + ')')
								.show();
		
		// Hide everything else except the Reset All Button
		showAllFilters(false);
		showAllFavTeamButtons(false);
	}
	
	function resetAll() {
		showAllFilters(true);
		showAllFavTeamButtons(true);
		$favTeamLogo.hide();

		// TODO: This needs to move outside of this class.
		if (window.Qualtrics && Qualtrics.SurveyEngine) {
			Qualtrics.SurveyEngine.Page.pageButtons.disableNextButton();
		}
	}
	
	function showAllFilters(blnShowAll){
		if (blnShowAll) {
			$filters.show();
		} else {
			$filters.hide();
		}
	}
	
	function showAllFavTeamButtons(blnShowAll){
		if (blnShowAll==true) {
			$favTeamLogo.hide();
			$favTeamBtns.show();
		} else {
			$favTeamBtns.hide();
		}
	}
	
	function init() {
		// TODO: This needs to move outside of this class.
		if (window.Qualtrics && Qualtrics.SurveyEngine) {
			Qualtrics.SurveyEngine.Page.pageButtons.disableNextButton();
		}

		// Create buttons with code (to be the filters)
		createFilters();
		// Create FavTeam buttons
		createFavTeamButtons();
		
		$('#DivFilterReset').on('click', resetAll);
	}

	init();
};


/****************************************************************************************/


(function () {
	var OMNISURVEY_TEST = false,
			leagueId = -1,
			leagueLevelTerms = [];

	if (OMNISURVEY_TEST || !window.Qualtrics) {

		/*****************************************************
			TESTING
		*****************************************************/
		leagueId = 2;
		leagueLevelTerms = ['Conferences', 'Divisions'];

		jQuery('body').prepend('<div id="testing">The survey is in test mode.</div>');

	} else {
		
		Qualtrics.SurveyEngine.addOnload(function() {
			leagueId = parseInt(Qualtrics.SurveyEngine.getEmbeddedData('lgID'));
			
			// If any more levels are added just modify the for length here
			for (var i=1; i<=3; i++) {
				var leagueLevelTerm = Qualtrics.SurveyEngine.getEmbeddedData('lgLevel'+i+'Term');
				if (leagueLevelTerm != null && leagueLevelTerm.trim() !== '') {
					leagueLevelTerms.push(leagueLevelTerm);
				}
			}
		});

		Qualtrics.SurveyEngine.addOnReady(function() {
			//Place your JavaScript here to run when the page is fully displayed
		});

		Qualtrics.SurveyEngine.addOnUnload(function() {
			//Place your JavaScript here to run when the page is unloaded
		});

	}

	var leagueData = Omnisurvey_Data.getAllLeagueData().filter(function(league) {
		return league.id == leagueId;
	})[0];
	
	leagueData.divisionLevelTerms = leagueLevelTerms;

	var omnisurvey_FavoriteTeams = new Omnisurvey_FavoriteTeams(jQuery, leagueData); // this is what loads the Omnisurvey
})();
