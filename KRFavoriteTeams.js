'use strict';

var Omnisurvey_FavoriteTeams = function ($, data, leagueId) {

	const self = this;

	// Eventually, these are what will be passed to the Qualtrics embedded data
	this.favoriteTeamSelectedHandler;
	this.FavoriteTeamId = -1;
	this.FavoriteTeamName = "";

	let selectedLeague = null;
	let $leagueFilter = $('#leagueFilter');
	let $favTeamBtns = null;
	let $teams = $('#teams');
	let $selectedTeamLogo = $('#selected-team-logo');
	let $selectedTeamContainer = $('#selected-team');

	const $teamsContainer = $('#teams-container');
	const $nextButton = $('#NextButton');

	const strTeamLogoRootDir = 'https://knowrivalry.com/images/teamlogos/'; // This is the folder that holds the logos (SVGs) for each team

	// groups = the league object that has conf/div hierarchy
	function createGroupOptions(groups, $select, level) {
		// initialize level if needed
		level = typeof level !== 'undefined' ? level : 0;

		$.each(groups, function (index, childGroup) {
			// stop at team level, skip groups that shouldn't be displayed
			if (!childGroup.groups) { // || !childGroup.grpShowSurvSelRival) {
				return;
			}

			// Each subsequent child level is indented slightly more
			let spacer = '';
			const intIndent = 4;
			for (var i = 0; i < level * intIndent; i++) {
				spacer += '&nbsp;';
			}

			const disabled = false; //childGroup.groups && childGroup.groups[0] && childGroup.groups[0].groups,
			const selected = childGroup.id == leagueId;

			const strOptionGroup = [
				'<option',
				(disabled ? ' disabled="disabled"' : ''),
				' value="' + childGroup.id + '"',
				(selected ? ' selected' : ''),
				'>' + spacer + childGroup.name,
				'</option>'].join('');
			const $optGroup = $(strOptionGroup).appendTo($select);

			// Iterate on itself. Use the level argument to avoid infinite looping
			if (childGroup.groups) {
				createGroupOptions(childGroup.groups, $select, level + 1);
			}
		});
	}

	function selectTeam(teamId, teamName) {
		self.FavoriteTeamId = teamId; // This is the value that we'll eventually write to Qualtrics embedded data
		self.FavoriteTeamName = teamName;

		if (teamId > 0) {
			const team = data.getGroupById(teamId);
			const imgPath = strTeamLogoRootDir + 'logo_team'+team.id+'.svg';

			// set the logo
			$selectedTeamLogo.css('background-image', 'url(' + imgPath + ')');
			$selectedTeamContainer.find('h3').html(self.FavoriteTeamName);

			// enable next button
			$nextButton.removeAttr('disabled');

			$selectedTeamContainer.show();
			$teamsContainer.hide();

		} else {
			$nextButton.attr('disabled', 'disabled');


			// hide/show containers
			$selectedTeamContainer.hide();
			$teamsContainer.show();
		}

		if (typeof self.favoriteTeamSelectedHandler === 'function') {
			self.favoriteTeamSelectedHandler();
		}
	}


	function showAllFavTeamButtons(blnShowAll) {
		if (blnShowAll == true) {
			$favTeamBtns.show();
		} else {
			$favTeamBtns.hide();
		}
	}
	function createFavTeamButtons() {
		const teams = data.getTeamsByGroup(leagueId, 'name');

		teams.forEach(function (team) {
			const strTeamImgFilename = strTeamLogoRootDir + 'logo_team' + team.id + '.svg';
			$teams.append('<div style="background-image: url(' + strTeamImgFilename + ')" id="btnTeamID' + ('0' + team.id).slice(-4) + '" class="ClassFavTeam" data-id="' + team.id + '">' + team.name + '</div>');
		});

		$favTeamBtns = $('.ClassFavTeam');
		$favTeamBtns.on('click', favTeamClicked);
	}

	function favTeamClicked() {
		var $this = $(this);

		selectTeam($this.data('id'), $this.text());
	}


	// This is used as an argument in a function. I think 'this' refers to the caller,
	// and .val is the text of that element.
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
			const teams = data.getTeamsByGroup(groupId);
			$.each(teams, function (index, team) {
				//if (team.divisionLevels[filterLevel-1] == filterValue) {
				$favTeamBtns.filter('[data-id=' + team.id + ']').show();
				//}
			});
		}
	}

	function resetAll() {
		selectTeam(-1, "");
	}
	

	function init() {
		// get an object of the league data
		selectedLeague = data.getGroupById(leagueId);

		if (selectedLeague === null) {
			// TODO: INVALID DATA, NOW WHAT?
			return;
		}

		createGroupOptions([selectedLeague], $leagueFilter);
		$leagueFilter.on('change', filterChanged);


		// Create FavTeam buttons
		createFavTeamButtons();

		resetAll();

		$('.reset-filters').on('click', function (e) {
			e.preventDefault();
			resetAll();
		});
	}

	init();
};
