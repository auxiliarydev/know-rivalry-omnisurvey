'use strict';

var Omnisurvey = function($, data, leagueId) {
  
  var questionId = 'QID164',
      $question = $('#'+questionId),
      selectedLeague = null;
  
  function populateTeams($select) {
    var thisLeague = parseInt($select.val());
    var teams = data.getLeagues().filter(function(league) {
      return league.lgID === thisLeague;
    })[0].teams;
    console.log(teams);
    //TODO: POPULATE DROPDOWN VALUES
  }

  function validate() {
    // TODO: Make sure rivalry points add up, check on form submit
  }

	function init() {
    // set selected league (survey level)
    selectedLeague = data.getLeagues().filter(function(league) {
      return league.lgID === leagueId;
    })[0];

    // determine if there are sibling leagues to choose rivals from
    if (selectedLeague.leagueGroupId != null) {
      var $select = $('<select class="league-select"></select>').prependTo($question.find('select').parent());
      var $leagues = data.getLeagues().filter(function(league) {
        return league.leagueGroupId === selectedLeague.leagueGroupId;
      });

      $.each($leagues, function(index, league) {
        $select.append('<option value="'+league.lgID+'" '+(league.lgID === selectedLeague.lgID ? 'selected' : '')+'>'+league.lgFullName+'</option');
      });
    }

    $question.on('change', 'select.league-select', function() {
      populateTeams($(this));
    });

    // TODO: Hookup Rivalry Points stuff
	}

	init();
}



var Omnisurvey_Data = {
  tbljsLeagues: { 
		lgID_001: {lgID:1, leagueGroupId:null, lgSport:"American football", lgName:"NCAA DI-A", lgCurrentSurvID:13, lgSlug:"s_m_afb_ncaad1a", lgFullName:"NCAA Division I FBS football", lgTheFullName:"NCAA Division I FBS football", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_002: {lgID:2, leagueGroupId:null, lgSport:"Ice hockey", lgName:"NHL", lgCurrentSurvID:14, lgSlug:"s_m_hok_nhl", lgFullName:"National Hockey League", lgTheFullName:"the National Hockey League", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_003: {lgID:3, leagueGroupId:null, lgSport:"American football", lgName:"NFL", lgCurrentSurvID:15, lgSlug:"s_m_afb_nfl", lgFullName:"National Football League", lgTheFullName:"the National Football League", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_004: {lgID:4, leagueGroupId:null, lgSport:"Soccer", lgName:"MLS", lgCurrentSurvID:16, lgSlug:"s_m_soc_mls", lgFullName:"Major League Soccer", lgTheFullName:"Major League Soccer", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_005: {lgID:5, leagueGroupId:null, lgSport:"Baseball", lgName:"MLB", lgCurrentSurvID:17, lgSlug:"s_m_bas_mlb", lgFullName:"Major League Baseball", lgTheFullName:"Major League Baseball", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_006: {lgID:6, leagueGroupId:null, lgSport:"Basketball", lgName:"NBA", lgCurrentSurvID:18, lgSlug:"s_m_bkb_nba", lgFullName:"National Basketball Association", lgTheFullName:"the National Basketball Association", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_007: {lgID:7, leagueGroupId:null, lgSport:"Cricket", lgName:"BBL", lgCurrentSurvID:19, lgSlug:"s_m_t20_bbl", lgFullName:"Big Bash League", lgTheFullName:"the Big Bash League", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:0}, 
		lgID_008: {lgID:8, leagueGroupId:null, lgSport:"Cricket", lgName:"IPL", lgCurrentSurvID:20, lgSlug:"s_m_t20_ipl", lgFullName:"Indian Premier League", lgTheFullName:"the Indian Premier League", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:0}, 
		lgID_009: {lgID:9, leagueGroupId:null, lgSport:"Basketball", lgName:"NCAAM", lgCurrentSurvID:21, lgSlug:"s_m_bkb_ncaad1", lgFullName:"NCAA Division I men's basketball", lgTheFullName:"NCAA Division I men's basketball", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_010: {lgID:10, leagueGroupId:null, lgSport:"Basketball", lgName:"NCAAW", lgCurrentSurvID:22, lgSlug:"s_w_bkb_ncaad1", lgFullName:"NCAA Division I women's basketball", lgTheFullName:"NCAA Division I women's basketball", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_011: {lgID:11, leagueGroupId:null, lgSport:"American football", lgName:"NCAA DI-AA", lgCurrentSurvID:23, lgSlug:"s_m_afb_ncaad1aa", lgFullName:"NCAA Division I FCS football", lgTheFullName:"NCAA Division I FCS football", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
    lgID_012: {lgID:12, leagueGroupId:1, lgSport:"Soccer", lgName:"England men", lgCurrentSurvID:24, lgSlug:"s_m_soc_eng", lgFullName:"English men's football", lgTheFullName:"English men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1,
      teams: [
        { id: 1, name: 'test 1' }, { id: 2, name: 'test 2' }
      ]
    }, 
    lgID_013: {lgID:13, leagueGroupId:1, lgSport:"Soccer", lgName:"Spain men", lgCurrentSurvID:25, lgSlug:"s_m_soc_esp", lgFullName:"Spanish men's football", lgTheFullName:"Spanish men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1,
      teams: [
        { id: 3, name: 'test 3' }, { id: 4, name: 'test 4' }
      ]
    }, 
		lgID_014: {lgID:14, leagueGroupId:1, lgSport:"Soccer", lgName:"Germany men", lgCurrentSurvID:26, lgSlug:"s_m_soc_deu", lgFullName:"German men's football", lgTheFullName:"German men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_015: {lgID:15, leagueGroupId:null, lgSport:"Soccer", lgName:"International men", lgCurrentSurvID:27, lgSlug:"s_m_soc_intl", lgFullName:"International men's football", lgTheFullName:"International men's football", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_016: {lgID:16, leagueGroupId:null, lgSport:"Soccer", lgName:"International women", lgCurrentSurvID:28, lgSlug:"s_w_soc_intl", lgFullName:"International women's football", lgTheFullName:"International women's football", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
  },

  getLeagues: function() {
    var self = this;
    return Object.keys(self.tbljsLeagues).map(function(key) {
			return self.tbljsLeagues[key];
		});
  }
  
  /*leagueGroups: [
    { 
      key: 'men\'s club football', 
      leagues: [
        { id: 12, name: 'English men\'s football' },
        { id: 13, name: 'Spanish men\'s football' },
        { id: 14, name: 'German men\'s football' }
      ]
    },
    {
      key: 'International men\'s football',
      leagues: [
        { id: 15, name: 'International men\'s football' }
      ]
    }
  ]*/
};


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

	var omnisurvey = new Omnisurvey(jQuery, Omnisurvey_Data, leagueId); // this is what loads the Omnisurvey
})();
