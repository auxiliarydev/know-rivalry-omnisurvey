'use strict';

var Omnisurvey_TeamRivals = function($, data, leagueId) {
  
  var questionId = 'QID164',
      $question = $('#'+questionId),
      selectedLeague = null,
      isValid = false,
      $rivalryPointsInputs = $question.find('.ChoiceRow input[type="text"]'),
      $rivalryPointsTotal = $('.CSTotal input'),
      $rivalryPointsError = $('<div class="rivalry-points-error"></div>').appendTo($question);
  
  function populateTeams($select) {
    // get the league id
    var thisLeague = parseInt($select.val());

    // get the teams in the league
    var teams = data.getLeagues().filter(function(league) {
      return league.lgID === thisLeague;
    })[0].teams;

    var options = '<option value=""></option>';
    $.each(teams, function(index, team) {
      options += '<option value="'+team.id+'">'+team.name+'</option>'
    });

    // trigger change
    $select.next('select').html(options).change();
  }

  function selectTeam($select) {
    var $rivalryPointsInput = $select.closest('.ChoiceRow').next().find('input');

    if ($select.val() === '') {
      $rivalryPointsInput.attr({disabled: 'disabled', min: '0'}).val(0);
    } else {
      $rivalryPointsInput.removeAttr('disabled').attr({min: '1'}).val(100);
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

	function init() {
    // set selected league (survey level)
    selectedLeague = data.getLeagues().filter(function(league) {
      return league.lgID === leagueId;
    })[0];

    // determine if there are sibling leagues to choose rivals from
    if (selectedLeague.leagueGroupId != null) {
      var $select = $('<select class="league-select"></select>').prependTo($question.find('select').parent());
      var leagues = data.getLeagues().filter(function(league) {
        return league.leagueGroupId === selectedLeague.leagueGroupId;
      });

      $.each(leagues, function(index, league) {
        $select.append('<option value="'+league.lgID+'" '+(league.lgID === selectedLeague.lgID ? 'selected' : '')+'>'+league.lgFullName+'</option');
      });
      populateTeams($select);
    }

    // change the rivalry points inputs to range
    $rivalryPointsInputs
      .val(0)
      .attr({type: 'range', min: '0', max: '100', disabled: 'disabled'})
      .after('<span class="points-display">0</span>')
      .on('input change', function() {
        var $this = $(this);
        $this.next('.points-display').html($this.val());
        validate();
      });

    $question.on('change', 'select.league-select', function() {
      populateTeams($(this));
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
			leagueId = -1;

	if (OMNISURVEY_TEST || !window.Qualtrics) {

		/*****************************************************
			TESTING
		*****************************************************/
		leagueId = 13;

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

	var omnisurvey_TeamRivals = new Omnisurvey_TeamRivals(jQuery, Omnisurvey_Data, leagueId); // this is what loads the Omnisurvey
})();
