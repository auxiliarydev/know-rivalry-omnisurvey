'use strict';

var Omnisurvey_TeamRivals = function ($, data, leagueId, teamId) {
    this.nextButtonHandler;
    this.Rival01TeamId = -1; this.Rival01TeamName = "";
    this.Rival02TeamId = -1; this.Rival02TeamName = "";
    this.Rival03TeamId = -1; this.Rival03TeamName = "";
    this.Rival04TeamId = -1; this.Rival04TeamName = "";
    this.Rival05TeamId = -1; this.Rival05TeamName = "";
    this.Rival06TeamId = -1; this.Rival06TeamName = "";
    this.Rival07TeamId = -1; this.Rival07TeamName = "";
    this.Rival08TeamId = -1; this.Rival08TeamName = "";
    this.Rival09TeamId = -1; this.Rival09TeamName = "";
    this.Rival10TeamId = -1; this.Rival10TeamName = "";


    const questionId = 'QID164';
    const $question = $('#' + questionId);
    const teamDropdownSelector = 'select:not(.league-select)';
    const $rivalryPointsInputs = $question.find('.ChoiceRow input[type="text"]');
    const $rivalryPointsTotal = $('.CSTotalInput'); // Danny had this as '.CSTotal input', but I think that was a typo
    const $rivalryPointsError = $('<div class="rivalry-points-error"></div>').appendTo($question);
    let isValidRivalsSelection = false;


    // Populate teams in second dropdown when user changes the league
    function changeLeague($select) {
        // get the selected group id
        const groupId = parseInt($select.val());
        const teamDropdown = $select.next('select');
        populateTeams(teamDropdown, groupId);
    }

    // Fill the teams within the dropdown
    function populateTeams($select, groupId) {
        // get the teams in the league
        const teams = data.getTeamsByGroup(groupId, 'name');

        let options = '<option value=""></option>';
        teams.forEach(function (team) {
            if (team.id != teamId) {
                options += '<option value="' + team.id + '">' + team.name + '</option>';
            }
        });

        $select.html(options) // set options
            .change(); // trigger change
    }


    // groups = the league object that has conf/div hierarchy
    function createGroupOptions(groups, $select, level) {
        // initialize level if needed
        level = typeof level !== 'undefined' ? level : 0;

        $.each(groups, function (index, childGroup) {
            // stop at team level, skip groups that shouldn't be displayed
            if (!childGroup.groups) { // || !childGroup.grpShowSurvSelRival) {
                return;
            }

            const disabled = false; //childGroup.groups && childGroup.groups[0] && childGroup.groups[0].groups,
            const selected = childGroup.id == leagueId;


            // Each subsequent child level is indented slightly more
            let spacer = '';
            const intIndent = 4;
            for (var i = 0; i < level * intIndent; i++) {
                spacer += '&nbsp;';
            }

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

    function validate() {
        let sum = 0;
        $rivalryPointsInputs.each(function () {
            sum += Number($(this).val());
        });
        $rivalryPointsTotal.val(sum);
        if (sum == 100) {
            $rivalryPointsTotal.addClass('valid-point-total');
            isValidRivalsSelection = true;

            // hide message
            $rivalryPointsError.html('');

        } else {
            $rivalryPointsTotal.removeClass('valid-point-total');
            isValidRivalsSelection = false;

            // display message
            $rivalryPointsError.html('Rivalry points should total 100');

        }
        self.nextButtonHandler(isValidRivalsSelection);
    }

	function selectRivalTeam(teamId, teamName) {
		// self.FavoriteTeamId = teamId; // This is the value that we'll eventually write to Qualtrics embedded data
		// self.FavoriteTeamName = teamName;

		// if (teamId > 0) {
		// 	const team = data.getGroupById(teamId);
		// 	const imgPath = strTeamLogoRootDir + 'logo_team'+team.id+'.svg';

		// 	// set the logo
		// 	$selectedTeamLogo.css('background-image', 'url(' + imgPath + ')');
		// 	$selectedTeamContainer.find('h3').html(self.FavoriteTeamName);

		// 	// enable next button
		// 	$nextButton.removeAttr('disabled');

		// 	$selectedTeamContainer.show();
		// 	$teamsContainer.hide();

		// } else {
		// 	$nextButton.attr('disabled', 'disabled');


		// 	// hide/show containers
		// 	$selectedTeamContainer.hide();
		// 	$teamsContainer.show();
		// }

		// if (typeof self.favoriteTeamSelectedHandler === 'function') {
		// 	self.favoriteTeamSelectedHandler();
		// }
	}


    function init() {
        let groups = null;

        if (leagueId > 0) {
            // get the league grouping
            groups = data.getGroupAndSiblings(leagueId);//data.getCompetitiveGroupingByTeamId(teamId);
            console.log(groups);
        } else {
            // TODO: INVALID DATA, DO SOMETHING
            return;
        }

        // populate teams on league change
        $question.on('change', 'select.league-select', function () {
            changeLeague($(this));
         });

        // determine if there are sibling leagues to choose rivals from
        if (groups != null) {
            const $select = $('<select class="league-select"></select>').prependTo($question.find('select').parent());
            createGroupOptions(groups, $select);
            $select.change(); // trigger change
        } else {
            $question.find(teamDropdownSelector).each(function () {
                populateTeams($(this), leagueId);
            });
        }

        // change the rivalry points inputs to range
        const $range = $('<input type="range" min="0" max="100" disabled="disabled" class="points-range" />');
        $range.on('input change', function () {
            const $this = $(this);
            $this.next('input').val($this.val());
            validate();
        });

        $rivalryPointsInputs
            .attr({ type: 'number', min: 0, max: 100, disabled: 'disabled' })
            .before($range)
            .on('input change', function () {
                const $this = $(this);
                $this.prev('input').val($this.val());
                validate();
            });

    }


    init();
};
