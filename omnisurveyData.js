var Omnisurvey_Data = function($) {
  var self = this;
  /* These groupings show how teams can compete across leagues */
  var LeagueHierarchy = [];
  // The data tables below are copy/pasted from data outputted by Access (RivDB_BuildSurvey)
  var tbljsLeagues = {};
  var tbljsSurveys = {};

  this.Surveys = {};
  this.Leagues = {};
  //this.Teams = {};

  this.getLeague = function(leagueId) {
    var leagues = self.Leagues.filter(function(league) {
      return league.lgID === leagueId;
    });

    if (leagues.length > 0) {
      return leagues[0];
    }

    return null;
  };

  this.getLeaguesBySurvey = function(surveyId) {
    var leagues = self.Leagues.filter(function(league) {
      return league.lgCurrentSurvID === surveyId;
    });

    if (leagues.length > 0) {
      return leagues;
    }

    return null;
  };

  this.getSurvey = function(surveyId) {
    var surveys = self.Surveys.filter(function(survey) {
      return survey.survID === surveyId;
    });

    if (surveys.length > 0) {
      return surveys[0];
    }

    return null;
  };

  /*this.getTeamsByLeague = function(leagueId) {
    var teams = self.Teams.filter(function(league) {
      return league.id == leagueId;
    });

    if (teams.length > 0) {
      return teams[0];
    }

    return null;
  };*/

  this.getUniqueValues = function(value, index, self) {
		return value !== '' && self.indexOf(value) === index;
  };
  
  // technically this takes a groupId and will return the competitive group if any descendants have the id passed in
  /*this.getCompetitiveGroupingByTeamId = function(teamId) {
    var group = self.CompetitiveGroupings.filter(function(group) {
      return (self.filterGroups(group, 'id', teamId).length > 0);
    });

    if (group.length > 0) {
      return group[0];
    }

    return null;
  };*/

  this.getGroupAndSiblings = function(groupId) {
    var parentGroup = getParentGroup(groupId, LeagueHierarchy);

    if (parentGroup.length > 0) {
      // remove the group with the id we are looking for so we only return siblings
      return parentGroup[0].groups;
    }

    return parentGroup;
  }

  this.getGroupById = function(groupId) {
    var group = self.filterGroups(LeagueHierarchy, 'id', groupId);

    if (group.length > 0) {
      return group[0];
    }

    return null;
  };

  this.getTeamsByGroup = function(groupId, sort) {
    var groups = getLowestLevelGroups(self.getGroupById(groupId).groups);

    if (groups === null || groups.length <= 0) {
      return null;
    }

    if (typeof sort !== 'undefined' && sort !== '') {
      if (sort === 'name') {
        groups.sort(sortName);
      }
    }

    return groups;
  };

  this.getGroupTerms = function(groupId) {
    var groups = getTypeTerms(self.getGroupById(groupId).groups);

    return groups.filter(self.getUniqueValues);
  }

  // recursive function to filter League Hierarchy
  this.filterGroups = function(groups, key, value, results) {
    // initialize results if needed
    results = typeof results !== 'undefined' ? results : [];

    if (Array.isArray(groups)) {
      // groups is an array, iterate and filter
      groups.forEach(function(childGroup) {
        results = self.filterGroups(childGroup, key, value, results);
      });
    } else {
      // groups is an object, see if it's what we're looking for
      if (groups[key] == value) {
        results.push(groups); // found a match
      }

      // filter child groups if there are any
      if (groups.groups) {
        results = self.filterGroups(groups.groups, key, value, results);
      }
    }

    return results;
  };

  function sortName(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  function getLowestLevelGroups(groups, acc) {
    // initialize acc if needed
    acc = typeof acc !== 'undefined' ? acc : [];

    return groups.reduce(function(acc, group) {
      return group.groups ? getLowestLevelGroups(group.groups, acc) : acc.concat(group);
    }, acc);
  };

  function getTypeTerms(groups, acc) {
    // initialize acc if needed
    acc = typeof acc !== 'undefined' ? acc : [];

    return groups.reduce(function(acc, group) {
      if (group.grpTypeTerm) { 
        acc = acc.concat(group.grpTypeTerm); 
      }
      return group.groups ? getTypeTerms(group.groups, acc) : acc;
    }, acc);
  };


  function getParentGroup(groupId, groups, acc) {
    // initialize acc if needed
    acc = typeof acc !== 'undefined' ? acc : [];

    return groups.reduce(function(acc, group) {
      var match = group.groups && group.groups.some(function(g) {
        return g.id === groupId && g.groups;
      });

      return match ? acc.concat(group) : (group.groups? getParentGroup(groupId, group.groups, acc) : acc);
    }, acc);
  }


  /*this.tbljsLeagueGroups = { 
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
    lgID_012: {lgID:12, grpParentID:1, lgSport:"Soccer", lgName:"England men", lgCurrentSurvID:24, lgSlug:"s_m_soc_eng", lgFullName:"English men's football", lgTheFullName:"English men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1,
      teams: [
        { id: 1, name: 'test 1' }, { id: 2, name: 'test 2' }
      ]
    }, 
    lgID_013: {lgID:13, grpParentID:1, lgSport:"Soccer", lgName:"Spain men", lgCurrentSurvID:25, lgSlug:"s_m_soc_esp", lgFullName:"Spanish men's football", lgTheFullName:"Spanish men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1,
      teams: [
        { id: 3, name: 'test 3' }, { id: 4, name: 'test 4' }
      ]
    }, 
		lgID_014: {lgID:14, leagueGroupId:1, lgSport:"Soccer", lgName:"Germany men", lgCurrentSurvID:26, lgSlug:"s_m_soc_deu", lgFullName:"German men's football", lgTheFullName:"German men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_015: {lgID:15, leagueGroupId:null, lgSport:"Soccer", lgName:"International men", lgCurrentSurvID:27, lgSlug:"s_m_soc_intl", lgFullName:"International men's football", lgTheFullName:"International men's football", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
    lgID_016: {lgID:16, leagueGroupId:null, lgSport:"Soccer", lgName:"International women", lgCurrentSurvID:28, lgSlug:"s_w_soc_intl", lgFullName:"International women's football", lgTheFullName:"International women's football", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
  };*/

  this.testChoices = {
		1: {RecodeValue: "5", VariableName: "s_m_bas_mlb", Text: "MLB (Major League Baseball)", Exclusive: false},
		2: {RecodeValue: "4", VariableName: "s_m_soc_mls", Text: "MLS (Major League Soccer)", Exclusive: false},
		3: {RecodeValue: "10", VariableName: "s_m_bkb_nba", Text: "NBA (National Basketball Association)", Exclusive: false},
		4: {RecodeValue: "3", VariableName: "s_m_afb_nfl", Text: "NFL (National Football League)", Exclusive: false},
		5: {RecodeValue: "2", VariableName: "s_m_hok_nhl", Text: "NHL (National Hockey League)", Exclusive: false},
		6: {RecodeValue: "8", VariableName: "s_m_t20_ipl", Text: "IPL (Indian Premier League cricket, men)", Exclusive: false},
		7: {RecodeValue: "4", VariableName: "s_m_soc_mls", Text: "Canada/USA (MLS)", Exclusive: false},
		8: {RecodeValue: "1", VariableName: "s_m_afb_ncaad1a", Text: "FBS football (DI-A)", Exclusive: false},
		9: {RecodeValue: "11", VariableName: "s_m_afb_ncaad1aa", Text: "FCS football (DI-AA)", Exclusive: false},
		10: {RecodeValue: "9", VariableName: "s_m_bkb_ncaad1", Text: "Men's basketball (DI)", Exclusive: false},
		//11: {RecodeValue: "10", VariableName: "s_w_bkb_ncaad1", Text: "Women's basketball (DI)", Exclusive: false},
		12: {RecodeValue: "12", VariableName: "s_m_soc_eng", Text: "English (and UK teams in Football League & EPL), men", Exclusive: false},
		13: {RecodeValue: "14", VariableName: "s_m_soc_deu", Text: "Germany, men", Exclusive: false},
		14: {RecodeValue: "13", VariableName: "s_m_soc_esp", Text: "Spain, men", Exclusive: false},
		15: {RecodeValue: "15", VariableName: "s_m_soc_intl", Text: "National teams, men", Exclusive: false},
		16: {RecodeValue: "16", VariableName: "s_w_soc_intl", Text: "National teams, women", Exclusive: false}
  };

  
	/*var tbljsFavTeams = {
		lgID_001: { lgID:1, leagueLevelTerms: ['Conferences', 'Divisions'], teamName:["Air Force", "Akron", "Alabama", "Appalachian St", "Arizona", "Arizona St", "Arkansas", "Arkansas St", "Army", "Auburn", "Ball St", "Baylor", "Boise St", "Boston College", "Bowling Green", "Buffalo", "BYU", "Cal", "Central Michigan", "Cincinnati", "Clemson", "Colorado", "Colorado St", "Duke", "East Carolina", "Eastern Michigan", "FIU", "Florida", "Florida Atlantic", "Florida St", "Fresno St", "Georgia", "Georgia Southern", "Georgia St", "Georgia Tech", "Hawai'i", "Houston", "Idaho", "Illinois", "Indiana", "Iowa", "Iowa St", "Kansas", "Kansas St", "Kent St", "Kentucky", "Louisiana Tech", "Louisiana-Lafayette", "Louisiana-Monroe", "Louisville", "LSU", "Marshall", "Maryland", "Memphis", "Miami-FL", "Miami-OH", "Michigan", "Michigan St", "Middle Tennessee", "Minnesota", "Mississippi St", "Missouri", "Navy", "NC State", "Nebraska", "Nevada", "New Mexico", "New Mexico St", "NIU", "North Texas", "Northwestern", "Notre Dame", "ODU", "Ohio", "Ohio St", "Oklahoma", "Oklahoma St", "Ole Miss", "Oregon", "Oregon St", "Penn St", "Pitt", "Purdue", "Rice", "Rutgers", "San Diego St", "San Jose St", "SMU", "South Alabama", "South Carolina", "Southern Miss", "Stanford", "Syracuse", "TCU", "Temple", "Tennessee", "Texas", "Texas A&M", "Texas St", "Texas Tech", "Toledo", "Troy", "Tulane", "Tulsa", "UAB", "UCF", "UCLA", "UConn", "UMass", "UNC", "UNC-Charlotte", "UNLV", "USC", "USF", "Utah", "Utah St", "UTEP", "UTSA", "UVA", "Vanderbilt", "Virginia Tech", "Wake Forest", "Washington", "Washington St", "West Virginia", "Western Kentucky", "Western Michigan", "Wisconsin", "Wyoming"], dvcfLevel1:["Mountain West", "MAC", "SEC", "Sun Belt", "Pac-12", "Pac-12", "SEC", "Sun Belt", "Independent", "SEC", "MAC", "Big 12", "Mountain West", "ACC", "MAC", "MAC", "Independent", "Pac-12", "MAC", "American", "ACC", "Pac-12", "Mountain West", "ACC", "C-USA", "MAC", "C-USA", "SEC", "C-USA", "ACC", "Mountain West", "SEC", "Sun Belt", "Sun Belt", "ACC", "Mountain West", "American", "Independent", "Big Ten", "Big Ten", "Big Ten", "Big 12", "Big 12", "Big 12", "MAC", "SEC", "C-USA", "Sun Belt", "Sun Belt", "American", "SEC", "C-USA", "ACC", "American", "ACC", "MAC", "Big Ten", "Big Ten", "C-USA", "Big Ten", "SEC", "SEC", "Independent", "ACC", "Big Ten", "Mountain West", "Mountain West", "Independent", "MAC", "C-USA", "Big Ten", "Independent", "C-USA", "MAC", "Big Ten", "Big 12", "Big 12", "SEC", "Pac-12", "Pac-12", "Big Ten", "ACC", "Big Ten", "C-USA", "American", "Mountain West", "Mountain West", "American", "Sun Belt", "SEC", "C-USA", "Pac-12", "ACC", "Big 12", "American", "SEC", "Big 12", "SEC", "Sun Belt", "Big 12", "MAC", "Sun Belt", "C-USA", "C-USA", "C-USA", "American", "Pac-12", "American", "MAC", "ACC", "C-USA", "Mountain West", "Pac-12", "American", "Pac-12", "Mountain West", "C-USA", "C-USA", "ACC", "SEC", "ACC", "ACC", "Pac-12", "Pac-12", "Big 12", "Sun Belt", "MAC", "Big Ten", "Mountain West"], dvcfLevel2:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["air_force", "akron", "alabama", "appalachian_st", "arizona", "arizona_st", "arkansas", "arkansas_st", "army", "auburn", "ball_st", "baylor", "boise_st", "boston_college", "bowling_green", "buffalo", "byu", "cal", "central_michigan", "cincinnati", "clemson", "colorado", "colorado_st", "duke", "east_carolina", "eastern_michigan", "fiu", "florida", "florida_atlantic", "florida_st", "fresno_st", "georgia", "georgia_southern", "georgia_st", "georgia_tech", "hawaii", "houston", "idaho", "illinois", "indiana", "iowa", "iowa_st", "kansas", "kansas_st", "kent_st", "kentucky", "louisiana_tech", "louisiana-lafayette", "louisiana-monroe", "louisville", "lsu", "marshall", "maryland", "memphis", "miami-fl", "miami-oh", "michigan", "michigan_st", "middle_tennessee", "minnesota", "mississippi_st", "missouri", "navy", "nc_state", "nebraska", "nevada", "new_mexico", "new_mexico_st", "niu", "north_texas", "northwestern", "notre_dame", "odu", "ohio", "ohio_st", "oklahoma", "oklahoma_st", "ole_miss", "oregon", "oregon_st", "penn_st", "pitt", "purdue", "rice", "rutgers", "san_diego_st", "san_jose_st", "smu", "south_alabama", "south_carolina", "southern_miss", "stanford", "syracuse", "tcu", "temple", "tennessee", "texas", "texas_am", "texas_st", "texas_tech", "toledo", "troy", "tulane", "tulsa", "uab", "ucf", "ucla", "uconn", "umass", "unc", "unc-charlotte", "unlv", "usc", "usf", "utah", "utah_st", "utep", "utsa", "uva", "vanderbilt", "virginia_tech", "wake_forest", "washington", "washington_st", "west_virginia", "western_kentucky", "western_michigan", "wisconsin", "wyoming"], teamID:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129]}, 
		lgID_002: { lgID:2, leagueLevelTerms: ['Conferences'], teamName:["Anaheim Ducks", "Arizona Coyotes", "Boston Bruins", "Buffalo Sabres", "Calgary Flames", "Carolina Hurricanes", "Chicago Blackhawks", "Colorado Avalanche", "Columbus Blue Jackets", "Dallas Stars", "Detroit Red Wings", "Edmonton Oilers", "Florida Panthers", "Los Angeles Kings", "Minnesota Wild", "Montreal Canadiens", "Nashville Predators", "New Jersey Devils", "New York Islanders", "New York Rangers", "Ottawa Senators", "Philadelphia Flyers", "Pittsburgh Penguins", "San Jose Sharks", "St Louis Blues", "Tampa Bay Lightning", "Toronto Maple Leafs", "Vancouver Canucks", "Washington Capitals", "Winnipeg Jets"], dvcfLevel1:["Western", "Western", "Eastern", "Eastern", "Western", "Eastern", "Western", "Western", "Eastern", "Western", "Eastern", "Western", "Eastern", "Western", "Western", "Eastern", "Western", "Eastern", "Eastern", "Eastern", "Eastern", "Eastern", "Eastern", "Western", "Western", "Eastern", "Eastern", "Western", "Eastern", "Western"], dvcfLevel2:["Pacific", "Pacific", "Atlantic", "Atlantic", "Pacific", "Metropolitan", "Central", "Central", "Metropolitan", "Central", "Atlantic", "Pacific", "Atlantic", "Pacific", "Central", "Atlantic", "Central", "Metropolitan", "Metropolitan", "Metropolitan", "Atlantic", "Metropolitan", "Metropolitan", "Pacific", "Central", "Atlantic", "Atlantic", "Pacific", "Metropolitan", "Central"], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["anaheim_ducks", "arizona_coyotes", "boston_bruins", "buffalo_sabres", "calgary_flames", "carolina_hurricanes", "chicago_blackhawks", "colorado_avalanche", "columbus_blue_jackets", "dallas_stars", "detroit_red_wings", "edmonton_oilers", "florida_panthers", "los_angeles_kings", "minnesota_wild", "montreal_canadiens", "nashville_predators", "new_jersey_devils", "new_york_islanders", "new_york_rangers", "ottawa_senators", "philadelphia_flyers", "pittsburgh_penguins", "san_jose_sharks", "st_louis_blues", "tampa_bay_lightning", "toronto_maple_leafs", "vancouver_canucks", "washington_capitals", "winnipeg_jets"], teamID:[130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159]}, 
		lgID_003: { lgID:3, leagueLevelTerms: ['Conferences', 'Divisions'],  teamName:["Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs", "Los Angeles Rams", "Miami Dolphins", "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants", "New York Jets", "Oakland Raiders", "Philadelphia Eagles", "Pittsburgh Steelers", "San Diego Chargers", "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Redskins"], dvcfLevel1:["NFC", "NFC", "AFC", "AFC", "NFC", "NFC", "AFC", "AFC", "NFC", "AFC", "NFC", "NFC", "AFC", "AFC", "AFC", "AFC", "NFC", "AFC", "NFC", "AFC", "NFC", "NFC", "AFC", "AFC", "NFC", "AFC", "AFC", "NFC", "NFC", "NFC", "AFC", "NFC"], dvcfLevel2:["West", "South", "North", "East", "South", "North", "North", "North", "East", "West", "North", "North", "South", "South", "South", "West", "West", "East", "North", "East", "South", "East", "East", "West", "East", "North", "West", "West", "West", "South", "South", "East"], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["arizona_cardinals", "atlanta_falcons", "baltimore_ravens", "buffalo_bills", "carolina_panthers", "chicago_bears", "cincinnati_bengals", "cleveland_browns", "dallas_cowboys", "denver_broncos", "detroit_lions", "green_bay_packers", "houston_texans", "indianapolis_colts", "jacksonville_jaguars", "kansas_city_chiefs", "los_angeles_rams", "miami_dolphins", "minnesota_vikings", "new_england_patriots", "new_orleans_saints", "new_york_giants", "new_york_jets", "oakland_raiders", "philadelphia_eagles", "pittsburgh_steelers", "san_diego_chargers", "san_francisco_49ers", "seattle_seahawks", "tampa_bay_buccaneers", "tennessee_titans", "washington_redskins"], teamID:[160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 188, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 189, 190, 191]}, 
		lgID_004: { lgID:4, teamName:["Chicago Fire", "Chivas USA", "Colorado Rapids", "Columbus Crew", "DC United", "FC Dallas", "Houston Dynamo", "LA Galaxy", "Montreal Impact", "New England Revolution", "New York City FC", "New York Red Bulls", "Orlando City FC", "Philadelphia Union", "Portland Timbers", "Real Salt Lake", "San Jose Earthquakes", "Seattle Sounders FC", "Sporting Kansas City", "Toronto FC", "Vancouver Whitecaps FC"], dvcfLevel1:["Eastern", "Western", "Western", "Eastern", "Eastern", "Western", "Western", "Western", "Eastern", "Eastern", "Eastern", "Eastern", "Eastern", "Eastern", "Western", "Western", "Western", "Western", "Western", "Eastern", "Western"], dvcfLevel2:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["chicago_fire", "chivas_usa", "colorado_rapids", "columbus_crew", "dc_united", "fc_dallas", "houston_dynamo", "la_galaxy", "montreal_impact", "new_england_revolution", "new_york_city_fc", "new_york_red_bulls", "orlando_city_fc", "philadelphia_union", "portland_timbers", "real_salt_lake", "san_jose_earthquakes", "seattle_sounders_fc", "sporting_kansas_city", "toronto_fc", "vancouver_whitecaps_fc"], teamID:[192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212]}, 
		lgID_005: { lgID:5, teamName:["Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox", "Chicago Cubs", "Chicago White Sox", "Cincinnati Reds", "Cleveland Indians", "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals", "Los Angeles Angels", "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers", "Minnesota Twins", "New York Mets", "New York Yankees", "Oakland Athletics", "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants", "Seattle Mariners", "St Louis Cardinals", "Tampa Bay Rays", "Texas Rangers", "Toronto Blue Jays", "Washington Nationals"], dvcfLevel1:["NL", "NL", "AL", "AL", "NL", "AL", "NL", "AL", "NL", "AL", "AL", "AL", "AL", "NL", "NL", "NL", "AL", "NL", "AL", "AL", "NL", "NL", "NL", "NL", "AL", "NL", "AL", "AL", "AL", "NL"], dvcfLevel2:["West", "East", "East", "East", "Central", "Central", "Central", "Central", "West", "Central", "West", "Central", "West", "West", "East", "Central", "Central", "East", "East", "West", "East", "Central", "West", "West", "West", "Central", "East", "West", "East", "East"], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["arizona_diamondbacks", "atlanta_braves", "baltimore_orioles", "boston_red_sox", "chicago_cubs", "chicago_white_sox", "cincinnati_reds", "cleveland_indians", "colorado_rockies", "detroit_tigers", "houston_astros", "kansas_city_royals", "los_angeles_angels", "los_angeles_dodgers", "miami_marlins", "milwaukee_brewers", "minnesota_twins", "new_york_mets", "new_york_yankees", "oakland_athletics", "philadelphia_phillies", "pittsburgh_pirates", "san_diego_padres", "san_francisco_giants", "seattle_mariners", "st_louis_cardinals", "tampa_bay_rays", "texas_rangers", "toronto_blue_jays", "washington_nationals"], teamID:[213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242]}, 
		lgID_006: { lgID:10, teamName:["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers", "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks", "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards"], dvcfLevel1:["NBA Eastern", "NBA Eastern", "NBA Eastern", "NBA Eastern", "NBA Eastern", "NBA Eastern", "NBA Western", "NBA Western", "NBA Eastern", "NBA Western", "NBA Western", "NBA Eastern", "NBA Western", "NBA Western", "NBA Western", "NBA Eastern", "NBA Eastern", "NBA Western", "NBA Western", "NBA Eastern", "NBA Western", "NBA Eastern", "NBA Eastern", "NBA Western", "NBA Western", "NBA Western", "NBA Western", "NBA Eastern", "NBA Western", "NBA Eastern"], dvcfLevel2:["Southeast", "Atlantic", "Atlantic", "Southeast", "Central", "Central", "Southwest", "Northwest", "Central", "Pacific", "Southwest", "Central", "Pacific", "Pacific", "Southwest", "Southeast", "Central", "Northwest", "Southwest", "Atlantic", "Northwest", "Southeast", "Atlantic", "Pacific", "Northwest", "Pacific", "Southwest", "Atlantic", "Northwest", "Southeast"], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["atlanta_hawks", "boston_celtics", "brooklyn_nets", "charlotte_hornets", "chicago_bulls", "cleveland_cavaliers", "dallas_mavericks", "denver_nuggets", "detroit_pistons", "golden_state_warriors", "houston_rockets", "indiana_pacers", "los_angeles_clippers", "los_angeles_lakers", "memphis_grizzlies", "miami_heat", "milwaukee_bucks", "minnesota_timberwolves", "new_orleans_pelicans", "new_york_knicks", "oklahoma_city_thunder", "orlando_magic", "philadelphia_76ers", "phoenix_suns", "portland_trail_blazers", "sacramento_kings", "san_antonio_spurs", "toronto_raptors", "utah_jazz", "washington_wizards"], teamID:[243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272]}, 
		lgID_007: { lgID:7, teamName:["Adelaide Strikers", "Brisbane Heat", "Hobart Hurricanes", "Melbourne Renegades", "Melbourne Stars", "Perth Scorchers", "Sydney Sixers", "Sydney Thunder"], dvcfLevel1:["BBL", "BBL", "BBL", "BBL", "BBL", "BBL", "BBL", "BBL"], dvcfLevel2:["", "", "", "", "", "", "", ""], dvcfLevel3:["", "", "", "", "", "", "", ""], teamNameSlug:["adelaide_strikers", "brisbane_heat", "hobart_hurricanes", "melbourne_renegades", "melbourne_stars", "perth_scorchers", "sydney_sixers", "sydney_thunder"], teamID:[273, 274, 275, 276, 277, 278, 279, 280]}, 
	};*/

	/*function mapTeams() {
		var leagueData = Object.keys(tbljsFavTeams).map(function(key) {
			return [key, tbljsFavTeams[key]];
		}).map(function(leagueData) {
			var league = leagueData[1];
			return {
				id: league.lgID,
				teams: league.teamID.map(function(id, index) {
					return {
						id: id,
						name: league.teamName[index],
						slug: league.teamNameSlug[index],
						divisionLevels: [
							league.dvcfLevel1[index],
							league.dvcfLevel2[index],
							league.dvcfLevel3[index],
						]
					};
				}),
				divisionLevels: [
					league.dvcfLevel1.filter(self.getUniqueValues),
					league.dvcfLevel2.filter(self.getUniqueValues),
					league.dvcfLevel3.filter(self.getUniqueValues)
				]
			};
		});

		leagueData.forEach(function(league) {
			league.divisionLevels = league.divisionLevels.filter(function(level) {
				return level != null && level.length > 0;
			});
		});

		return leagueData;
  };*/
  
  function mapSurveys() {
    return Object.keys(tbljsSurveys).map(function(key) {
			return tbljsSurveys[key];
		});
  }

  function mapLeagues() {
    return Object.keys(tbljsLeagues).map(function(key) {
			return tbljsLeagues[key];
		});
  }

  // recursive filter
  /*function filterGroup(group, key, value) {
    var result,
        results = [];

    if (group[key] == value) {
      results.push(group);
    } else {
      if (group.groups) {
        result = self.filterGroups(group.groups, key, value);
        if (result.length > 0) {
          [].push.apply(results, result);
        }
      }
    }

    return results;
  }*/

  function init() {
    var dataLoaded = true;
    var loadedEvent = document.createEvent('Event');

    loadedEvent.initEvent('OmnisurveyReady', true, true);

    $.when(
      $.getJSON( 'https://auxiliarydev.github.io/know-rivalry-omnisurvey/data/leagueHierarchy.json')
        .done(function( data ) {
          //console.log(data);
          LeagueHierarchy = data;
        }).fail(function(jqXHR, textStatus, errorThrown) {
          dataLoaded = false;
          console.log( "error loading league data: " + textStatus );
        }),
      $.getJSON( 'https://auxiliarydev.github.io/know-rivalry-omnisurvey/data/leagues.json')
        .done(function( data ) {
          //console.log(data);
          tbljsLeagues = data;
        }).fail(function(jqXHR, textStatus, errorThrown) {
          dataLoaded = false;
          console.log( "error loading league data: " + textStatus );
        }),
      $.getJSON( 'https://auxiliarydev.github.io/know-rivalry-omnisurvey/data/leagues.json')
        .done(function( data ) {
          //console.log(data);
          tbljsLeagues = data;
        }).fail(function(jqXHR, textStatus, errorThrown) {
          dataLoaded = false;
          console.log( "error loading league data: " + textStatus );
        })
    )
    .then(function() {
      if (dataLoaded) {
        document.dispatchEvent(loadedEvent);
      } else {
        console.log('error loading data');
      }
    });

    self.Surveys = mapSurveys();
    self.Leagues = mapLeagues();
    //self.Teams = mapTeams();
  }

  init();
};