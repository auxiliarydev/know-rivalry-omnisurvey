'use strict';

var Omnisurvey_FavoriteTeams = function($, data, leagueId) {

	// Eventually, these are what will be passed to the Qualtrics embedded data
	this.favoriteTeamSelectedHandler;
	//this.FavoriteTeamName = '';
	this.FavoriteTeamId = -1;
	
	var self = this,
			strTeamLogoRootDir = 'https://knowrivalry.com/images/teamlogos/', // This is the folder that holds the logos (PNG files) for each team
			selectedLeague = null,
			$filters = $('#filters'),
			$favTeamLogo = $('#DivFavTeamLogo'),
			$favTeamList = $('#DivFavTeamList'),
			$favTeamBtns = null,
			$nextButton = $('#NextButton');
	
	function createFilters() {
		var terms = data.getGroupTerms(leagueId);

		terms.forEach(function(term) {
			// create container for league level filter
			$filters.append('<h3>'+term+'</h3>');
			var $filterLevel = $('<div class="league-level-filter clearfix"></div>').appendTo($filters); //data-level="'+i+'"

			var groups = data.filterGroups(selectedLeague, 'grpTypeTerm', term);

			// create filters
			groups.forEach(function(group) {
				$filterLevel.append('<div class="ClassFilter ClassFilterLevel'+(terms.indexOf(term)+1)+'" data-group-id="'+group.id+'">'+group.name+'</div>');
			});
		});

		// add click handler for all filters
		$('.ClassFilter').on('click', filterClicked);
	}
	
	function createFavTeamButtons(){
		//var teams = data.getTeamsByGroup(leagueId);
		var teams = data.getTeamsByGroup(leagueId);

		teams.forEach(function(team) {
			var strTeamImgFilename = strTeamLogoRootDir + 'logo_team'+team.id+'.svg';
			$favTeamList.append('<div style="background-image: url('+strTeamImgFilename+')" id="btnTeamID'+('0' + team.id).slice(-4)+'" class="ClassFavTeam" data-id="'+team.id+'">'+team.name+'</div>');
		});

		$favTeamBtns = $('.ClassFavTeam');
		$favTeamBtns.on('click', favTeamClicked);
	}

	function filterClicked() {
		var filterValue = this.innerHTML;

		// get the level from the parent container
		//var filterLevel = $(this).closest('.league-level-filter').data('level');
		var groupId = $(this).data('group-id');

		if (groupId === undefined) {
			// show all
			showAllFavTeamButtons(true);
		} else {
			// hide all
			showAllFavTeamButtons(false);

			// show filtered teams
			var teams = data.getTeamsByGroup(groupId);
			$.each(teams, function(index, team) {
				//if (team.divisionLevels[filterLevel-1] == filterValue) {
					$favTeamBtns.filter('[data-id='+team.id+']').show();
				//}
			});
		}
	}

	function selectTeam(teamId) {
		//self.FavoriteTeamName = $this.html(); // This is the value that we'll eventually write to Qualtrics embedded data
		self.FavoriteTeamId = teamId; // This is the value that we'll eventually write to Qualtrics embedded data

		if (typeof self.favoriteTeamSelectedHandler === 'function') {
			self.favoriteTeamSelectedHandler();
		}

		if (teamId > 0) {
			var team = data.getGroupById(teamId),
					imgPath = strTeamLogoRootDir + 'logo_team'+team.id+'.svg';;

			// set the logo
			$favTeamLogo.css('background-image', 'url(' + imgPath + ')').show();

			// enable next button
			$nextButton.removeAttr('disabled');

			// hide other filters
			showAllFilters(false);
			showAllFavTeamButtons(false);
			//Qualtrics.SurveyEngine.Page.pageButtons.enableNextButton();
		} else {
			$nextButton.attr('disabled', 'disabled');
			showAllFilters(true);
			showAllFavTeamButtons(true);
			$favTeamLogo.hide();
			//Qualtrics.SurveyEngine.Page.pageButtons.disableNextButton();
		}
	}
	
	function favTeamClicked() {
		var $this = $(this);

		selectTeam($this.data('id'));
	}
	
	function resetAll() {
		selectTeam(-1);
	}
	
	function showAllFilters(blnShowAll){
		if (blnShowAll) {
			$filters.show();
		} else {
			$filters.hide();
		}
	}
	
	function showAllFavTeamButtons(blnShowAll){
		if (blnShowAll == true) {
			$favTeamLogo.hide();
			$favTeamBtns.show();
		} else {
			$favTeamBtns.hide();
		}
	}
	
	function init() {
		// get the league data
		selectedLeague = data.getGroupById(leagueId);
		//console.log(selectedLeague);
		
		if (selectedLeague === null) {
			// TODO: INVALID DATA, NOW WHAT?
			return;
		}

		// Create buttons with code (to be the filters)
		createFilters();
		// Create FavTeam buttons
		createFavTeamButtons();

		resetAll();
		
		$('#DivFilterReset').on('click', resetAll);
	}

	init();
};
