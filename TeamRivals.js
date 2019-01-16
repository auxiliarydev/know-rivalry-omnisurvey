'use strict';

var Omnisurvey_TeamRivals = function($, data, leagueId, teamId) {
  
  var questionId = 'QID164',
      $question = $('#'+questionId),
      isValid = false,
      $rivalryPointsInputs = $question.find('.ChoiceRow input[type="text"]'),
      $rivalryPointsTotal = $('.CSTotal input'),
      $rivalryPointsError = $('<div class="rivalry-points-error"></div>').appendTo($question);
  
  function changeLeague($select) {
    // get the selected group id
    var groupId = parseInt($select.val()),
        teamDropdown = $select.next('select');

    populateTeams(teamDropdown, groupId);
  }

  function populateTeams($select, groupId) {
    // get the teams in the league
    var teams = data.getTeamsByGroup(groupId);

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

  function createGroupOptions(group, $select, level) {
    // initialize level if needed
    level = typeof level !== 'undefined' ? level : 0;

    $.each(group.groups, function(index, childGroup) {
      // stop at team level / ignore current team
      if (!childGroup.groups) {
        return;
      }

      var disabled = false, //childGroup.groups && childGroup.groups[0] && childGroup.groups[0].groups,
          selected = childGroup.id == leagueId,
          space = '';

      for (var i=0; i<level*4; i++) {
        space += '&nbsp;';
      }

      var $optGroup = $('<option'+(disabled ? ' disabled="disabled"' : '')+' value="'+childGroup.id+'"'+(selected ? ' selected' : '')+'>'+space+childGroup.name+'</option>').appendTo($select);
      createGroupOptions(childGroup, $select, level+1);
    });
  }

	function init() {
    var group = null;

    if (leagueId > 0) {
      // get the league grouping
      group = data.getCompetitiveGroupingByTeamId(teamId);
      console.log(group);
    } else {
      // TODO: INVALID DATA, DO SOMETHING
    }

    // populate teams on league change
    $question.on('change', 'select.league-select', function() {
      changeLeague($(this));
    });

    // determine if there are sibling leagues to choose rivals from
    if (group != null) {
      var $select = $('<select class="league-select"></select>').prependTo($question.find('select').parent());
      createGroupOptions(group, $select);

      //$select.change(); // trigger change
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
    $question.on('change', 'select:not(.league-select)', function() {
      selectTeam($(this));
    });

    // TODO: Hookup Rivalry Points stuff
	}

	init();
};


/****************************************************************************************/


(function () {
	var OMNISURVEY_TEST = false,
      leagueId = -1,
      teamId = -1;

	if (OMNISURVEY_TEST || !window.Qualtrics) {

		/*****************************************************
			TESTING
		*****************************************************/
    leagueId = 10;
    teamId = 244;

		jQuery('body').prepend('<div id="testing">The survey is in test mode.</div>');

	} else {
		
		Qualtrics.SurveyEngine.addOnload(function() {
			leagueId = parseInt(Qualtrics.SurveyEngine.getEmbeddedData('lgID'));
		});

		Qualtrics.SurveyEngine.addOnReady(function() {
			//Place your JavaScript here to run when the page is fully displayed
		});

		Qualtrics.SurveyEngine.addOnUnload(function() {
			//Place your JavaScript here to run when the page is unloaded
		});

	}

	var omnisurvey_TeamRivals = new Omnisurvey_TeamRivals(jQuery, Omnisurvey_Data, leagueId, teamId); // this is what loads the Omnisurvey
})();
