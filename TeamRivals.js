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
	}

	init();
};


/*
  HANGING ON TO THIS FOR NOW. NOT SURE IF IT IS NEEDED
*/
/*
Qualtrics.SurveyEngine.addOnload(function()
{
  // DECLARE VARIABLES MANUALLY
	var intTotalNumberOfRivals = 7;
	var strQuestionIDinQualtrics = 'QID164';

	
  // DECLARE ARRAYS
  // Declare array of rival team names and set the size. Do the same with Points.
  // I'm making it such that Position 0 will always be null, just because it's easier
	var aryRivalNames = new Array(intTotalNumberOfRivals);
	var aryRivalPts = new Array(intTotalNumberOfRivals);	
	var aryRivalPointElements = $$('#' + strQuestionIDinQualtrics + ' .ChoiceStructure input');
	
// FUNCTIONS

	// Format rival number as 00
	function fRivalNum(intRivalNum){
		return ("0" + intRivalNum).slice(-2);
	};
	
	// Each dropdown for the rival team selection is manually assigned an id
	// This function returns the name of that element.	
	function fDropdownID(intRivalNum){
		return 'select#cboRival' + fRivalNum(intRivalNum) + '.QWatchTimer';
	};
	
// LOAD EMBEDDED DATA
//	If a user hits "Back" after filling out this form, or Data Validation kicks errors,  the Team Name  selections will be gone.
//	Thus, when this page loads, it checks the Embedded Data.
//  If the data are not null, it puts those values into the dropdowns by default.

	 for (var intRivalryCounter = 1; intRivalryCounter <=intTotalNumberOfRivals; intRivalryCounter++){
		var strEmbeddedRivalName = Qualtrics.SurveyEngine.getEmbeddedData('Rival' + fRivalNum(intRivalryCounter) + 'Name');
		if (strEmbeddedRivalName !== null) {
			 jQuery(fDropdownID(intRivalryCounter)).val(strEmbeddedRivalName);
		 };
	 };
	
	
// STORE THE  RIVAL DATA IN AN ARRAY AND WRITE IT TO THE EMBEDDED DATA
// The important thing is that this runs all at once, which allows the numbers to iterate.
// There is probaby a better way than focusout, but this'll do.
	
	jQuery('div#'+strQuestionIDinQualtrics).focusout(function(){
		for (var intRivalryCounter = 1; intRivalryCounter <=intTotalNumberOfRivals; intRivalryCounter++) {
			var strRivalName = jQuery(fDropdownID(intRivalryCounter)).val();
			
			aryRivalNames[intRivalryCounter] = strRivalName;
			aryRivalPts[intRivalryCounter]=aryRivalPointElements[intRivalryCounter-1].value;			
			
			Qualtrics.SurveyEngine.setEmbeddedData( 'Rival' + fRivalNum(intRivalryCounter) + 'Name', aryRivalNames[intRivalryCounter] );
			Qualtrics.SurveyEngine.setEmbeddedData( 'Rival' + fRivalNum(intRivalryCounter) + 'Points', aryRivalPts[intRivalryCounter] );
			
		};
	});

	
});
*/