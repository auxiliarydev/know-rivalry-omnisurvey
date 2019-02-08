'use strict';

var Omnisurvey_TeamRivals = function($, data, leagueId, teamId) {
  
  var questionId = 'QID164',
      $question = $('#'+questionId),
      isValid = false,
      $rivalryPointsInputs = $question.find('.ChoiceRow input[type="text"]'),
      $rivalryPointsTotal = $('.CSTotal input'),
      $rivalryPointsError = $('<div class="rivalry-points-error"></div>').appendTo($question),
      teamDropdownSelector = 'select:not(.league-select)';
  
  function changeLeague($select) {
    // get the selected group id
    var groupId = parseInt($select.val()),
        teamDropdown = $select.next('select');

    populateTeams(teamDropdown, groupId);
  }

  function populateTeams($select, groupId) {
    // get the teams in the league
    var teams = data.getTeamsByGroup(groupId, 'name');

    var options = '<option value=""></option>';
    teams.forEach(function(team) {
      if (team.id != teamId) {
        options += '<option value="'+team.id+'">'+team.name+'</option>';
      }
    });

    $select.html(options) // set options
           .change(); // trigger change
  }

  function selectTeam($select) {
    var $rivalryPointsInput = $select.closest('.ChoiceRow').next().find('input');

    if ($select.val() === '') {
      $rivalryPointsInput.attr({disabled: 'disabled', min: '0'}).val(0);
    } else {
      $rivalryPointsInput.removeAttr('disabled').attr({min: '1'}).val(1);
    }

    // trigger change
    $rivalryPointsInput.change();
  }

  function validate() {
    var sum = 0;
    $rivalryPointsInputs.each(function() {
        sum += Number($(this).val());
    });
    $rivalryPointsTotal.val(sum);
    if (sum == 100) {
      $rivalryPointsTotal.addClass('valid-point-total');
      isValid = true;

      // hide message
      $rivalryPointsError.html('');
      
      // TODO: This needs to move outside of this class.
      if (window.Qualtrics && Qualtrics.SurveyEngine) {
        Qualtrics.SurveyEngine.Page.pageButtons.enableNextButton();
      }
    } else {
      $rivalryPointsTotal.removeClass('valid-point-total');
      isValid = false;

      // display message
      $rivalryPointsError.html('Rivalry points should total 100');

      // TODO: This needs to move outside of this class.
      if (window.Qualtrics && Qualtrics.SurveyEngine) {
        Qualtrics.SurveyEngine.Page.pageButtons.disableNextButton();
      }
    }
  }

  function createGroupOptions(groups, $select, level) {
    // initialize level if needed
    level = typeof level !== 'undefined' ? level : 0;

    $.each(groups, function(index, childGroup) {
      // stop at team level, skip groups that shouldn't be displayed
      if (!childGroup.groups) { // || !childGroup.grpShowSurvSelRival) {
        return;
      }

      var disabled = false, //childGroup.groups && childGroup.groups[0] && childGroup.groups[0].groups,
          selected = childGroup.id == leagueId,
          space = '';

      for (var i=0; i<level*4; i++) {
        space += '&nbsp;';
      }

      var $optGroup = $('<option'+(disabled ? ' disabled="disabled"' : '')+' value="'+childGroup.id+'"'+(selected ? ' selected' : '')+'>'+space+childGroup.name+'</option>').appendTo($select);

      if (childGroup.groups) {
        createGroupOptions(childGroup.groups, $select, level+1);
      }
    });
  }

	function init() {
    var groups = null;

    if (leagueId > 0) {
      // get the league grouping
      groups = data.getGroupAndSiblings(leagueId);//data.getCompetitiveGroupingByTeamId(teamId);
      console.log(groups);
    } else {
      // TODO: INVALID DATA, DO SOMETHING
      return;
    }

    // populate teams on league change
    $question.on('change', 'select.league-select', function() {
      changeLeague($(this));
    });

    // determine if there are sibling leagues to choose rivals from
    if (groups != null) {
      var $select = $('<select class="league-select"></select>').prependTo($question.find('select').parent());
      createGroupOptions(groups, $select);
      $select.change(); // trigger change
    } else {
      $question.find(teamDropdownSelector).each(function() {
        populateTeams($(this), leagueId);
      });
    }

    // change the rivalry points inputs to range
    var $range = $('<input type="range" min="0" max="100" disabled="disabled" class="points-range" />');
    $range.on('input change', function() {
      var $this = $(this);
      $this.next('input').val($this.val());
      validate();
    });
    
    $rivalryPointsInputs
      .attr({type: 'number', min: 0, max: 100, disabled: 'disabled'})
      .before($range)
      .on('input change', function() {
        var $this = $(this);
        $this.prev('input').val($this.val());
        validate();
      });

    // best way to determine team selection dropdown currently
    $question.on('change', teamDropdownSelector, function() {
      selectTeam($(this));
    });

    // TODO: Hookup Rivalry Points stuff
	}

	init();
};
