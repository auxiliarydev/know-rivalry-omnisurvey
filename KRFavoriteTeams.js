'use strict';

var Omnisurvey_FavoriteTeams = function ($, data, leagueId) {

    const self = this;

    // Eventually, these are what will be passed to the Qualtrics embedded data
	this.favoriteTeamSelectedHandler;
	this.FavoriteTeamId = -1;
	this.FavoriteTeamName = "";

    let selectedLeague = null;
    let $leagueFilter = $('#league-filter');
    let $favTeamBtns = null;
    let $teams = $('#teams');
    let $selectedTeamLogo = $('#selected-team-logo');
    let $selectedTeamContainer = $('#selected-team');

    const $teamsContainer = $('#teams-container');
    const $nextButton = $('#NextButton');

    const strTeamLogoRootDir = 'https://knowrivalry.com/images/teamlogos/'; // This is the folder that holds the logos (SVGs) for each team

    function createGroupOptions(groups, $select, level) {
        // initialize level if needed
        level = typeof level !== 'undefined' ? level : 0;

        $.each(groups, function (index, childGroup) {
            // stop at team level, skip groups that shouldn't be displayed
            if (!childGroup.groups) { // || !childGroup.grpShowSurvSelRival) {
                return;
            }

            var disabled = false, //childGroup.groups && childGroup.groups[0] && childGroup.groups[0].groups,
                selected = childGroup.id == leagueId,
                space = '';

            for (var i = 0; i < level * 4; i++) {
                space += '&nbsp;';
            }

            var $optGroup = $('<option' + (disabled ? ' disabled="disabled"' : '') + ' value="' + childGroup.id + '"' + (selected ? ' selected' : '') + '>' + space + childGroup.name + '</option>').appendTo($select);

            if (childGroup.groups) {
                createGroupOptions(childGroup.groups, $select, level + 1);
            }
        });
    }

    function selectTeam(teamId, teamName) {
		//self.FavoriteTeamName = $this.html(); // This is the value that we'll eventually write to Qualtrics embedded data
		self.FavoriteTeamId = teamId; // This is the value that we'll eventually write to Qualtrics embedded data
		self.FavoriteTeamName = teamName;

		if (teamId > 0) {
			var team = data.getGroupById(teamId),
					imgPath = strTeamLogoRootDir + 'logo_team'+team.id+'.svg';;

			// set the logo
			$selectedTeamLogo.css('background-image', 'url(' + imgPath + ')');
			$selectedTeamContainer.find('h3').html(self.FavoriteTeamName);

			// enable next button
			$nextButton.removeAttr('disabled');

			// hide/show containers
			$selectedTeamContainer.show();
			$teamsContainer.hide();
			// hide other filters
			//showAllFilters(false);
			//showAllFavTeamButtons(false);
		} else {
			$nextButton.attr('disabled', 'disabled');
			//showAllFilters(true);
			//showAllFavTeamButtons(true);

			// hide/show containers
			$selectedTeamContainer.hide();
			$teamsContainer.show();
		}

		if (typeof self.favoriteTeamSelectedHandler === 'function') {
			self.favoriteTeamSelectedHandler();
		}
    }
    
    function favTeamClicked() {
		var $this = $(this);

		selectTeam($this.data('id'), $this.text());
    }
    
    function showAllFavTeamButtons(blnShowAll){
		if (blnShowAll == true) {
			$favTeamBtns.show();
		} else {
			$favTeamBtns.hide();
		}
	}
	function createFavTeamButtons(){
		//var teams = data.getTeamsByGroup(leagueId);
		var teams = data.getTeamsByGroup(leagueId, 'name');

		teams.forEach(function(team) {
			var strTeamImgFilename = strTeamLogoRootDir + 'logo_team'+team.id+'.svg';
			$teams.append('<div style="background-image: url('+strTeamImgFilename+')" id="btnTeamID'+('0' + team.id).slice(-4)+'" class="ClassFavTeam" data-id="'+team.id+'">'+team.name+'</div>');
		});

		$favTeamBtns = $('.ClassFavTeam');
		$favTeamBtns.on('click', favTeamClicked);
    }
    
    function filterChanged() {
		const groupId = $(this).val();

		filterTeams(groupId);
    }

    function filterTeams(groupId) {
		if (groupId === undefined || groupId === '') {
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
    
    function init() {
        // get the league data
        selectedLeague = data.getGroupById(leagueId);
        //console.log(selectedLeague);

        if (selectedLeague === null) {
            // TODO: INVALID DATA, NOW WHAT?
            return;
        }

        createGroupOptions([selectedLeague], $leagueFilter);
        $leagueFilter.on('change', filterChanged);

        // Create buttons with code (to be the filters)
        //createFilters();

        // Create FavTeam buttons
        createFavTeamButtons();

        resetAll();

        $('.reset-filters').on('click', function (e) {
            e.preventDefault();
            resetAll();
        });
        //$('#DivFilterReset').on('click', resetAll);
    }

    init();
};
