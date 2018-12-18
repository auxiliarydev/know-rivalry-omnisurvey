'use strict';

var Omnisurvey = function($, leagueData, leagueLevelTerms) {

	// Eventually, these are what will be passed to the Qualtrics embedded data
	this.FavoriteTeamName = '';
	this.FavoriteTeamId = -1;
	this.SelectedLeague = null;
	
	var strTeamLogoRootDir = 'https://knowrivalry.com/images/logos/', // This is the folder that holds the logos (PNG files) for each team
			aryTeamNames = leagueData['teamName'],
			aryTeamIDs = leagueData['teamID'],
			aryTeamNameSlugs = leagueData['teamNameSlug'],
			$filters = $('#filters'),
			$favTeamLogo = $('#DivFavTeamLogo'),
			$favTeamList = $('#DivFavTeamList'),
			$favTeamBtns = null;
	
	function createFilters() {
		for (var i=1; i<=leagueLevelTerms.length; i++) {
			// get unique values and strip empty values
			var filterLevelUnique = leagueData['dvcfLevel'+i].filter(function(value, index, self) {
				return value !== '' && self.indexOf(value) === index;
			});

			if (filterLevelUnique.length > 0) {
				// create container for league level filter
				$filters.append('<h3>'+leagueLevelTerms[i-1]+'</h3>');
				var $filterLevel = $('<div class="league-level-filter clearfix" id="DivFiltersLevel'+i+'" data-level="'+i+'"></div>').appendTo($filters);

				// create filters
				$.each(filterLevelUnique, function(index, value) {
					$filterLevel.append('<div class="ClassFilter ClassFilterLevel'+i+'">'+value+'</div>');
				});
			}
		}

		// add click handler for all filters
		$('.ClassFilter').on('click', filterClicked);
	}
	
	function createFavTeamButtons(){
		for (var i=0; i<=aryTeamNames.length-1; i++) {
			var strTeamImgFilename = strTeamLogoRootDir + aryTeamNameSlugs[i] + '-logo-sm.png';
			$favTeamList.append('<div style="background-image: url('+strTeamImgFilename+')" id="btnTeamID'+('0' + aryTeamIDs[i]).slice(-4)+'" class="ClassFavTeam" data-id="'+aryTeamIDs[i]+'">'+aryTeamNames[i]+'</div>');
		};

		$favTeamBtns = $('.ClassFavTeam');
		$favTeamBtns.on('click', favTeamClicked);
	}

	function filterClicked() {
		var filterValue = this.innerHTML;

		// get the level from the parent container
		var filterLevel = $(this).closest('.league-level-filter').data('level');

		if (filterLevel === undefined) {
			// show all
			showAllFavTeamButtons(true);
		} else {
			// hide all
			showAllFavTeamButtons(false);

			// show filtered teams
			$.each(leagueData['dvcfLevel'+filterLevel], function(index, value) {
				if (value === filterValue) {
					$favTeamBtns.filter('[data-id='+aryTeamIDs[index]+']').show();
				}
			});
		}
	}
	
	function favTeamClicked() {
		var $this = $(this);

		this.FavoriteTeamName = $this.html(); // This is the value that we'll eventually write to Qualtrics embedded data
		this.FavoriteTeamId = $this.data('id'); // This is the value that we'll eventually write to Qualtrics embedded data

		// Show the logo for the team
		changeTeamImage(this.FavoriteTeamId);
	};

	// Change the team image shown
	function changeTeamImage(teamId) {
		// This function will dynamically change the image to show the correct image for the Favorite Team.
		var teamNameSlug = aryTeamNameSlugs[aryTeamIDs.indexOf(teamId)],
				imgPath = strTeamLogoRootDir + teamNameSlug + '-logo.png';

		$favTeamLogo.css('background-image', 'url(' + imgPath + ')')
								.show();
		
		// Hide everything else except the Reset All Button
		showAllFilters(false);
		showAllFavTeamButtons(false);
	}
	
	function resetAll() {
		showAllFilters(true);
		showAllFavTeamButtons(true);
		$favTeamLogo.hide();
	}
	
	function showAllFilters(blnShowAll){
		if (blnShowAll) {
			$filters.show();
		} else {
			$filters.hide();
		}
	}
	
	function showAllFavTeamButtons(blnShowAll){
		if (blnShowAll==true) {
			$favTeamLogo.hide();
			$favTeamBtns.show();
		} else {
			$favTeamBtns.hide();
		}
	}
	
	function init() {
		// Create buttons with code (to be the filters)
		createFilters();
		// Create FavTeam buttons
		createFavTeamButtons();
		
		$('#DivFilterReset').on('click', resetAll);
	}

	init();
}



var Omnisurvey_Data = {
	tbljsFavTeams: {
		lgID_001: { lgID:1, teamName:["Air Force", "Akron", "Alabama", "Appalachian St", "Arizona", "Arizona St", "Arkansas", "Arkansas St", "Army", "Auburn", "Ball St", "Baylor", "Boise St", "Boston College", "Bowling Green", "Buffalo", "BYU", "Cal", "Central Michigan", "Cincinnati", "Clemson", "Colorado", "Colorado St", "Duke", "East Carolina", "Eastern Michigan", "FIU", "Florida", "Florida Atlantic", "Florida St", "Fresno St", "Georgia", "Georgia Southern", "Georgia St", "Georgia Tech", "Hawai'i", "Houston", "Idaho", "Illinois", "Indiana", "Iowa", "Iowa St", "Kansas", "Kansas St", "Kent St", "Kentucky", "Louisiana Tech", "Louisiana-Lafayette", "Louisiana-Monroe", "Louisville", "LSU", "Marshall", "Maryland", "Memphis", "Miami-FL", "Miami-OH", "Michigan", "Michigan St", "Middle Tennessee", "Minnesota", "Mississippi St", "Missouri", "Navy", "NC State", "Nebraska", "Nevada", "New Mexico", "New Mexico St", "NIU", "North Texas", "Northwestern", "Notre Dame", "ODU", "Ohio", "Ohio St", "Oklahoma", "Oklahoma St", "Ole Miss", "Oregon", "Oregon St", "Penn St", "Pitt", "Purdue", "Rice", "Rutgers", "San Diego St", "San Jose St", "SMU", "South Alabama", "South Carolina", "Southern Miss", "Stanford", "Syracuse", "TCU", "Temple", "Tennessee", "Texas", "Texas A&M", "Texas St", "Texas Tech", "Toledo", "Troy", "Tulane", "Tulsa", "UAB", "UCF", "UCLA", "UConn", "UMass", "UNC", "UNC-Charlotte", "UNLV", "USC", "USF", "Utah", "Utah St", "UTEP", "UTSA", "UVA", "Vanderbilt", "Virginia Tech", "Wake Forest", "Washington", "Washington St", "West Virginia", "Western Kentucky", "Western Michigan", "Wisconsin", "Wyoming"], dvcfLevel1:["Mountain West", "MAC", "SEC", "Sun Belt", "Pac-12", "Pac-12", "SEC", "Sun Belt", "Independent", "SEC", "MAC", "Big 12", "Mountain West", "ACC", "MAC", "MAC", "Independent", "Pac-12", "MAC", "American", "ACC", "Pac-12", "Mountain West", "ACC", "C-USA", "MAC", "C-USA", "SEC", "C-USA", "ACC", "Mountain West", "SEC", "Sun Belt", "Sun Belt", "ACC", "Mountain West", "American", "Independent", "Big Ten", "Big Ten", "Big Ten", "Big 12", "Big 12", "Big 12", "MAC", "SEC", "C-USA", "Sun Belt", "Sun Belt", "American", "SEC", "C-USA", "ACC", "American", "ACC", "MAC", "Big Ten", "Big Ten", "C-USA", "Big Ten", "SEC", "SEC", "Independent", "ACC", "Big Ten", "Mountain West", "Mountain West", "Independent", "MAC", "C-USA", "Big Ten", "Independent", "C-USA", "MAC", "Big Ten", "Big 12", "Big 12", "SEC", "Pac-12", "Pac-12", "Big Ten", "ACC", "Big Ten", "C-USA", "American", "Mountain West", "Mountain West", "American", "Sun Belt", "SEC", "C-USA", "Pac-12", "ACC", "Big 12", "American", "SEC", "Big 12", "SEC", "Sun Belt", "Big 12", "MAC", "Sun Belt", "C-USA", "C-USA", "C-USA", "American", "Pac-12", "American", "MAC", "ACC", "C-USA", "Mountain West", "Pac-12", "American", "Pac-12", "Mountain West", "C-USA", "C-USA", "ACC", "SEC", "ACC", "ACC", "Pac-12", "Pac-12", "Big 12", "Sun Belt", "MAC", "Big Ten", "Mountain West"], dvcfLevel2:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["air_force", "akron", "alabama", "appalachian_st", "arizona", "arizona_st", "arkansas", "arkansas_st", "army", "auburn", "ball_st", "baylor", "boise_st", "boston_college", "bowling_green", "buffalo", "byu", "cal", "central_michigan", "cincinnati", "clemson", "colorado", "colorado_st", "duke", "east_carolina", "eastern_michigan", "fiu", "florida", "florida_atlantic", "florida_st", "fresno_st", "georgia", "georgia_southern", "georgia_st", "georgia_tech", "hawaii", "houston", "idaho", "illinois", "indiana", "iowa", "iowa_st", "kansas", "kansas_st", "kent_st", "kentucky", "louisiana_tech", "louisiana-lafayette", "louisiana-monroe", "louisville", "lsu", "marshall", "maryland", "memphis", "miami-fl", "miami-oh", "michigan", "michigan_st", "middle_tennessee", "minnesota", "mississippi_st", "missouri", "navy", "nc_state", "nebraska", "nevada", "new_mexico", "new_mexico_st", "niu", "north_texas", "northwestern", "notre_dame", "odu", "ohio", "ohio_st", "oklahoma", "oklahoma_st", "ole_miss", "oregon", "oregon_st", "penn_st", "pitt", "purdue", "rice", "rutgers", "san_diego_st", "san_jose_st", "smu", "south_alabama", "south_carolina", "southern_miss", "stanford", "syracuse", "tcu", "temple", "tennessee", "texas", "texas_am", "texas_st", "texas_tech", "toledo", "troy", "tulane", "tulsa", "uab", "ucf", "ucla", "uconn", "umass", "unc", "unc-charlotte", "unlv", "usc", "usf", "utah", "utah_st", "utep", "utsa", "uva", "vanderbilt", "virginia_tech", "wake_forest", "washington", "washington_st", "west_virginia", "western_kentucky", "western_michigan", "wisconsin", "wyoming"], teamID:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129]}, 
		lgID_002: { lgID:2, teamName:["Anaheim Ducks", "Arizona Coyotes", "Boston Bruins", "Buffalo Sabres", "Calgary Flames", "Carolina Hurricanes", "Chicago Blackhawks", "Colorado Avalanche", "Columbus Blue Jackets", "Dallas Stars", "Detroit Red Wings", "Edmonton Oilers", "Florida Panthers", "Los Angeles Kings", "Minnesota Wild", "Montreal Canadiens", "Nashville Predators", "New Jersey Devils", "New York Islanders", "New York Rangers", "Ottawa Senators", "Philadelphia Flyers", "Pittsburgh Penguins", "San Jose Sharks", "St Louis Blues", "Tampa Bay Lightning", "Toronto Maple Leafs", "Vancouver Canucks", "Washington Capitals", "Winnipeg Jets"], dvcfLevel1:["Western", "Western", "Eastern", "Eastern", "Western", "Eastern", "Western", "Western", "Eastern", "Western", "Eastern", "Western", "Eastern", "Western", "Western", "Eastern", "Western", "Eastern", "Eastern", "Eastern", "Eastern", "Eastern", "Eastern", "Western", "Western", "Eastern", "Eastern", "Western", "Eastern", "Western"], dvcfLevel2:["Pacific", "Pacific", "Atlantic", "Atlantic", "Pacific", "Metropolitan", "Central", "Central", "Metropolitan", "Central", "Atlantic", "Pacific", "Atlantic", "Pacific", "Central", "Atlantic", "Central", "Metropolitan", "Metropolitan", "Metropolitan", "Atlantic", "Metropolitan", "Metropolitan", "Pacific", "Central", "Atlantic", "Atlantic", "Pacific", "Metropolitan", "Central"], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["anaheim_ducks", "arizona_coyotes", "boston_bruins", "buffalo_sabres", "calgary_flames", "carolina_hurricanes", "chicago_blackhawks", "colorado_avalanche", "columbus_blue_jackets", "dallas_stars", "detroit_red_wings", "edmonton_oilers", "florida_panthers", "los_angeles_kings", "minnesota_wild", "montreal_canadiens", "nashville_predators", "new_jersey_devils", "new_york_islanders", "new_york_rangers", "ottawa_senators", "philadelphia_flyers", "pittsburgh_penguins", "san_jose_sharks", "st_louis_blues", "tampa_bay_lightning", "toronto_maple_leafs", "vancouver_canucks", "washington_capitals", "winnipeg_jets"], teamID:[130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159]}, 
		lgID_003: { lgID:3, teamName:["Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs", "Los Angeles Rams", "Miami Dolphins", "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants", "New York Jets", "Oakland Raiders", "Philadelphia Eagles", "Pittsburgh Steelers", "San Diego Chargers", "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Redskins"], dvcfLevel1:["NFC", "NFC", "AFC", "AFC", "NFC", "NFC", "AFC", "AFC", "NFC", "AFC", "NFC", "NFC", "AFC", "AFC", "AFC", "AFC", "NFC", "AFC", "NFC", "AFC", "NFC", "NFC", "AFC", "AFC", "NFC", "AFC", "AFC", "NFC", "NFC", "NFC", "AFC", "NFC"], dvcfLevel2:["West", "South", "North", "East", "South", "North", "North", "North", "East", "West", "North", "North", "South", "South", "South", "West", "West", "East", "North", "East", "South", "East", "East", "West", "East", "North", "West", "West", "West", "South", "South", "East"], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["arizona_cardinals", "atlanta_falcons", "baltimore_ravens", "buffalo_bills", "carolina_panthers", "chicago_bears", "cincinnati_bengals", "cleveland_browns", "dallas_cowboys", "denver_broncos", "detroit_lions", "green_bay_packers", "houston_texans", "indianapolis_colts", "jacksonville_jaguars", "kansas_city_chiefs", "los_angeles_rams", "miami_dolphins", "minnesota_vikings", "new_england_patriots", "new_orleans_saints", "new_york_giants", "new_york_jets", "oakland_raiders", "philadelphia_eagles", "pittsburgh_steelers", "san_diego_chargers", "san_francisco_49ers", "seattle_seahawks", "tampa_bay_buccaneers", "tennessee_titans", "washington_redskins"], teamID:[160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 188, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 189, 190, 191]}, 
		lgID_004: { lgID:4, teamName:["Chicago Fire", "Chivas USA", "Colorado Rapids", "Columbus Crew", "DC United", "FC Dallas", "Houston Dynamo", "LA Galaxy", "Montreal Impact", "New England Revolution", "New York City FC", "New York Red Bulls", "Orlando City FC", "Philadelphia Union", "Portland Timbers", "Real Salt Lake", "San Jose Earthquakes", "Seattle Sounders FC", "Sporting Kansas City", "Toronto FC", "Vancouver Whitecaps FC"], dvcfLevel1:["Eastern", "Western", "Western", "Eastern", "Eastern", "Western", "Western", "Western", "Eastern", "Eastern", "Eastern", "Eastern", "Eastern", "Eastern", "Western", "Western", "Western", "Western", "Western", "Eastern", "Western"], dvcfLevel2:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["chicago_fire", "chivas_usa", "colorado_rapids", "columbus_crew", "dc_united", "fc_dallas", "houston_dynamo", "la_galaxy", "montreal_impact", "new_england_revolution", "new_york_city_fc", "new_york_red_bulls", "orlando_city_fc", "philadelphia_union", "portland_timbers", "real_salt_lake", "san_jose_earthquakes", "seattle_sounders_fc", "sporting_kansas_city", "toronto_fc", "vancouver_whitecaps_fc"], teamID:[192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212]}, 
		lgID_005: { lgID:5, teamName:["Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox", "Chicago Cubs", "Chicago White Sox", "Cincinnati Reds", "Cleveland Indians", "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals", "Los Angeles Angels", "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers", "Minnesota Twins", "New York Mets", "New York Yankees", "Oakland Athletics", "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants", "Seattle Mariners", "St Louis Cardinals", "Tampa Bay Rays", "Texas Rangers", "Toronto Blue Jays", "Washington Nationals"], dvcfLevel1:["NL", "NL", "AL", "AL", "NL", "AL", "NL", "AL", "NL", "AL", "AL", "AL", "AL", "NL", "NL", "NL", "AL", "NL", "AL", "AL", "NL", "NL", "NL", "NL", "AL", "NL", "AL", "AL", "AL", "NL"], dvcfLevel2:["West", "East", "East", "East", "Central", "Central", "Central", "Central", "West", "Central", "West", "Central", "West", "West", "East", "Central", "Central", "East", "East", "West", "East", "Central", "West", "West", "West", "Central", "East", "West", "East", "East"], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["arizona_diamondbacks", "atlanta_braves", "baltimore_orioles", "boston_red_sox", "chicago_cubs", "chicago_white_sox", "cincinnati_reds", "cleveland_indians", "colorado_rockies", "detroit_tigers", "houston_astros", "kansas_city_royals", "los_angeles_angels", "los_angeles_dodgers", "miami_marlins", "milwaukee_brewers", "minnesota_twins", "new_york_mets", "new_york_yankees", "oakland_athletics", "philadelphia_phillies", "pittsburgh_pirates", "san_diego_padres", "san_francisco_giants", "seattle_mariners", "st_louis_cardinals", "tampa_bay_rays", "texas_rangers", "toronto_blue_jays", "washington_nationals"], teamID:[213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242]}, 
		lgID_006: { lgID:6, teamName:["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers", "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks", "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards"], dvcfLevel1:["NBA Eastern", "NBA Eastern", "NBA Eastern", "NBA Eastern", "NBA Eastern", "NBA Eastern", "NBA Western", "NBA Western", "NBA Eastern", "NBA Western", "NBA Western", "NBA Eastern", "NBA Western", "NBA Western", "NBA Western", "NBA Eastern", "NBA Eastern", "NBA Western", "NBA Western", "NBA Eastern", "NBA Western", "NBA Eastern", "NBA Eastern", "NBA Western", "NBA Western", "NBA Western", "NBA Western", "NBA Eastern", "NBA Western", "NBA Eastern"], dvcfLevel2:["Southeast", "Atlantic", "Atlantic", "Southeast", "Central", "Central", "Southwest", "Northwest", "Central", "Pacific", "Southwest", "Central", "Pacific", "Pacific", "Southwest", "Southeast", "Central", "Northwest", "Southwest", "Atlantic", "Northwest", "Southeast", "Atlantic", "Pacific", "Northwest", "Pacific", "Southwest", "Atlantic", "Northwest", "Southeast"], dvcfLevel3:["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""], teamNameSlug:["atlanta_hawks", "boston_celtics", "brooklyn_nets", "charlotte_hornets", "chicago_bulls", "cleveland_cavaliers", "dallas_mavericks", "denver_nuggets", "detroit_pistons", "golden_state_warriors", "houston_rockets", "indiana_pacers", "los_angeles_clippers", "los_angeles_lakers", "memphis_grizzlies", "miami_heat", "milwaukee_bucks", "minnesota_timberwolves", "new_orleans_pelicans", "new_york_knicks", "oklahoma_city_thunder", "orlando_magic", "philadelphia_76ers", "phoenix_suns", "portland_trail_blazers", "sacramento_kings", "san_antonio_spurs", "toronto_raptors", "utah_jazz", "washington_wizards"], teamID:[243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272]}, 
		lgID_007: { lgID:7, teamName:["Adelaide Strikers", "Brisbane Heat", "Hobart Hurricanes", "Melbourne Renegades", "Melbourne Stars", "Perth Scorchers", "Sydney Sixers", "Sydney Thunder"], dvcfLevel1:["BBL", "BBL", "BBL", "BBL", "BBL", "BBL", "BBL", "BBL"], dvcfLevel2:["", "", "", "", "", "", "", ""], dvcfLevel3:["", "", "", "", "", "", "", ""], teamNameSlug:["adelaide_strikers", "brisbane_heat", "hobart_hurricanes", "melbourne_renegades", "melbourne_stars", "perth_scorchers", "sydney_sixers", "sydney_thunder"], teamID:[273, 274, 275, 276, 277, 278, 279, 280]}, 
	},

	favoriteTeams: function() {
		var self = this;
		return Object.keys(self.tbljsFavTeams).map(function(key) {
			return [key, self.tbljsFavTeams[key]];
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
				})
			};
		});
	}
};


(function () {
	var OMNISURVEY_TEST = true,
			leagueID = -1,
			leagueLevelTerms = [];

	if (OMNISURVEY_TEST) {

		/*****************************************************
			TESTING
		*****************************************************/
		leagueID = 2;
		leagueLevelTerms = ['Conferences', 'Divisions'];

	} else {
		
		Qualtrics.SurveyEngine.addOnload(function() {
			leagueID = parseInt(Qualtrics.SurveyEngine.getEmbeddedData('lgID'));
			
			// If any more levels are added just modify the for length here
			for (var i=1; i<=3; i++) {
				var leagueLevelTerm = Qualtrics.SurveyEngine.getEmbeddedData('lgLevel'+i+'Term');
				if (leagueLevelTerm != null && leagueLevelTerm.trim() !== '') {
					leagueLevelTerms.push(leagueLevelTerm);
				}
			}
		});

		Qualtrics.SurveyEngine.addOnReady(function() {
			//Place your JavaScript here to run when the page is fully displayed
		});

		Qualtrics.SurveyEngine.addOnUnload(function() {
			//Place your JavaScript here to run when the page is unloaded
		});

	}

	var leagueJSName = 'lgID_'+('00' + leagueID).slice(-3),
			leagueData = Omnisurvey_Data.tbljsFavTeams[leagueJSName],
			omnisurvey = new Omnisurvey(jQuery, leagueData, leagueLevelTerms); // this is what loads the Omnisurvey
})();



/*
	Summary of what I did:
		- Put Omnisurvey code in a class to encapsulate/separate from Qualtrics code
		- Some simple cleanup/refactoring
		- Simplified/streamlined logic creating filters

	Notes:
		- *This data can be transformed to something easier to read like:
		leagues: [
			{
				id:2 {
					teams: [
						{
							id: 130,
							name: 'Anaheim Ducks',
							slug: 'anaheim_ducks',
							dvcfLevel1: 'Western',
							dvcfLevel2: 'Pacific',
							dvcfLevel3: ''
						}
					]
				}
			},
		]
*/




/********************************************************************************
 * OLD CODE
 ********************************************************************************/
/*
// This is used to help with testing. Set to FALSE to avoid pulling from Qualtrics
// **DB: don't need this anymore because we now pass the data in
fImportEmbeddedData(true);
function fImportEmbeddedData(blnUseReal){
	if (blnUseReal === true) {
		intLgID = parseInt(lgID); //Qualtrics.SurveyEngine.getEmbeddedData('lgID');
		strLgLevel1Term = lgLevel1Term; //Qualtrics.SurveyEngine.getEmbeddedData('lgLevel1Term');
		strLgLevel2Term = lgLevel2Term; //Qualtrics.SurveyEngine.getEmbeddedData('lgLevel2Term');
		strLgLevel3Term = lgLevel3Term; //Qualtrics.SurveyEngine.getEmbeddedData('lgLevel3Term');
	} else {
		intLgID = 2;
		strLgLevel1Term = 'Conferences';
		strLgLevel2Term = 'Divisions';
		strLgLevel3Term = '';
	};
};

// **DB: refactored code where this would only be called once, so no need for it be a function
function fLeagueJSName(paramLgID){
	// This converts a lgID into the JavaScript object name within tbljsLeagues (e.g,. 14 --> 'lgID_014')
	return 'lgID_'+('00' + paramLgID).slice(-3);
};


// **DB: Replaced this with much simpler CreateFilters() function
//fCreateFilterButtons(1, aryUniqueLevel1, 'DivFiltersLevel1');
//fCreateFilterButtons(2, aryUniqueLevel2, 'DivFiltersLevel2');
//fCreateFilterButtons(3, aryUniqueLevel3, 'DivFiltersLevel3');
// Get unique list of categories within this level. Use this to build the HTML.
//var aryUniqueLevel1 = fGetUniqueFromArray(aryLevel1),
//		aryUniqueLevel2 = fGetUniqueFromArray(aryLevel2),
//		aryUniqueLevel3 = fGetUniqueFromArray(aryLevel3);
// The function converts an array of unique values to individual buttons
// It takes two inputs: an array of unique values ; the ID for the DIV under which the buttons will appear
function fCreateFilterButtons(paramLevel, paramArray, paramDivID) {
	var objFilterDivHeader = document.getElementById(paramDivID + 'Header');
	if (paramArray.length === 0) {
		objFilterDivHeader.innerHTML = ''; // Set the header div text to nothing
		return false;
	};
	
	var intCountFilter = 0;
	jQuery.each(paramArray, function(propKey, propValue){
		// Create a header for the filter section
		objFilterDivHeader.innerHTML = aryLevelTerms[paramLevel-1];
		
		// Create filter button 
		var btnLevelFilter = document.createElement('div'); // This argument used to be 'button', but I changed to 'div' to avoid conflicting with Qualtrics styles
		var objFilterDiv = document.getElementById(paramDivID);

		//set the button text
		btnLevelFilter.innerHTML = propValue;
		
		// set the id for the button.
		btnLevelFilter.id = 'IDFilterLevel' + paramLevel + '~' + ('0' + intCountFilter).slice(-2);
		intCountFilter++;
		
		// This will allow us to easily style these buttons, listen for them being clicked, and add all the filters with this class to an array
		btnLevelFilter.classList.add('ClassFilter', 'ClassFilterLevel' + paramLevel);

		//append it to objFilterDiv
		objFilterDiv.appendChild(btnLevelFilter);
		
	});
	return true;
};
// Create a unique list of possible choices within the set
// To test is this returns null, use the following format IN THIS ORDER: console.log( (typeof varInputArray !== 'undefined' && varInputArray !== null) );
function fGetUniqueFromArray(varInputArray) {
	var varUniqueValues = [];
	jQuery.each(varInputArray, function(propKey, propValue){
		if(jQuery.inArray(propValue, varUniqueValues) === -1) {
			varUniqueValues.push(propValue);
		};
	});
	
	// If the whole array is empty (i.e., full of ', '), return a null array
	if ((varUniqueValues.length === 1) && (varUniqueValues[0] === '')) {
				varUniqueValues = [];
	} else {
		// Sort the array
		varUniqueValues.sort();
	};
	return varUniqueValues;
};

// SHOW or HIDE ELEMENTS
// DB: Don't need this. Easily done with jQuery
function showElement(strElementID, blnShow){
	// First parameter is the name of the element; second parameter is boolean for whether the element should show.
	// E.g., if you want to show your HTML element that's <div id='foo'>, you'd invoke this as showElement('foo',true)
	var el = $('#'+strElementID);
	if (blnShow) {
		el.show();
	} else {
		el.hide();
	}
}
*/







/********************************************************************************
 * UNUSED CODE
 ********************************************************************************
	
	// Originally I'd planned on doing dropdown combo boxes, but the buttons seemed a much easier approach, especially for mobile.
	// I might bring dropdowns back for desktop users... we'll see.

	(function() {

	  //setup an object fully of arrays
	  //alternativly it could be something like
	  //{'cboLevel1':[{value:sweet, text:Sweet}.....]}
	  //so you could set the label of the option tag something different than the name
	  var aryLevelTest = {
		'NBA Eastern': ['sweet', 'wohoo', 'yay'],
		'NBA Western': ['you suck!', 'common son']
	  };

	  var cboLevel1 = document.getElementById('cboLevel1');
	  var cboFavTeam = document.getElementById('cboFavTeam');


	  //on change is a good event for this because you are guarenteed the value is different
		cboLevel1.onchange = function() {
			var aryShowTeamNames=[];
			var aryShowTeamIDs=[];
			var intCountLevel1 = 0
			//clear out cboFavTeam
			cboFavTeam.length = 0;
			//get the selected value from cboLevel1
			var SelectionLevel1 = this.options[this.selectedIndex].value;

			for (var intCountLevel = 0; intCountLevel <= intTotalNumOfOptions-1; intCountLevel++) {
			  if (aryLevel1[intCountLevel]===SelectionLevel1){
				  aryShowTeamNames.push(aryTeamNames[intCountLevel]);
				  aryShowTeamIDs.push(aryTeamNames[intCountLevel]);
				  intCountLevel1++;
				};
			};
			
			//loop through aryLevelTest at the selected value	
			for (var intOptLevel1 in aryLevelTest[SelectionLevel1]) {
				//create option tag
				var optFavTeam = document.createElement('option');
				//set its value
				optFavTeam.value = aryShowTeamIDs[intOptLevel1];
				//set the display label
				optFavTeam.text = aryShowTeamNames[intOptLevel1];;
				//append it to cboFavTeam
				cboFavTeam.appendChild(optFavTeam);
			};
		};
		//fire this to update cboFavTeam on load

		cboLevel1.onchange();

	})();

	//HTML
    <select id='cboLevel1'>
      <option value='NBA Eastern'>NBA Eastern</option>
      <option value='NBA Western'>NBA Western</option>
    </select>
    <select id='cboFavTeam'>
      <option>you suck!</option>
      <option>common son</option>
    </select>

	
	/* HIGHLIGHT FILTERS
	I'd tried to get the filters to highlight when clicked. After spending too long on this, I gave up.

	function fHighlightActiveFilter(paramFilterLevel) {
		// Add active class to the current control button (highlight it)
		var btnContainer = document.getElementById('DivFiltersLevel' + paramFilterLevel);
		var objFilterButtonIDs = btnContainer.getElementsByClassName('ClassFilterLevel' + paramFilterLevel);
		for (var intCountButtons = 0; intCountButtons < objFilterButtonIDs.length; intCountButtons++) {
			objFilterButtonIDs[intCountButtons].addEventListener('click', function() {
				var objCurrentButton = document.getElementsByClassName('FilterLevel1Active');
			  if (objCurrentButton.length === 0) {
					console.log('it's undefined, you see');
				  this.className += ' FilterLevel1Active';
				} else {
					console.log(objCurrentButton[0].className);
					console.log('objCurrentButton[0]: ' + objCurrentButton[0]);
					objCurrentButton[0].className = objCurrentButton[0].className.replace(' FilterLevel1Active', '');
					// console.log(objCurrentButton[0].className);
					this.className += ' FilterLevel1Active';
				};
			});
		};
	};
	
	
	*/
