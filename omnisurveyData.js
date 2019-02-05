var Omnisurvey_Data = new function() {
  var self = this;

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

  this.getTeamsByGroup = function(groupId) {
    var groups = getLowestLevelGroups(self.getGroupById(groupId).groups);

    return groups
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

  /* These groupings show how teams can compete across leagues */
  var LeagueHierarchy = [
    { id: 1, name: 'Sports', grpTypeTerm: 'Root', grpShowSurvSelRival: false, groups: [
      { id: 111, name: 'Basketball (5 on 5)', grpTypeTerm: 'Sport', grpShowSurvSelRival: false, groups: [
          { id: 2, name: 'Men\'s basketball (5 on 5)', grpTypeTerm: 'Sport', grpShowSurvSelRival: false, groups: [
              { id: 9, name: 'Men\'s pro basketball', grpTypeTerm: '-99', grpShowSurvSelRival: true, groups: [
                  { id: 10, name: 'NBA', grpTypeTerm: 'League', grpShowSurvSelRival: true, groups: [
                      { id: 12, name: 'Eastern', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          { id: 14, name: 'Atlantic', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                              { id: 244, name: 'Boston Celtics' },
                              { id: 245, name: 'Brooklyn Nets' },
                              { id: 262, name: 'New York Knicks' },
                              { id: 265, name: 'Philadelphia 76ers' },
                              { id: 270, name: 'Toronto Raptors' },
                          ]}, // closing grpID=14 (Atlantic)
                          { id: 15, name: 'Central', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                              { id: 247, name: 'Chicago Bulls' },
                              { id: 248, name: 'Cleveland Cavaliers' },
                              { id: 251, name: 'Detroit Pistons' },
                              { id: 254, name: 'Indiana Pacers' },
                              { id: 259, name: 'Milwaukee Bucks' },
                          ]}, // closing grpID=15 (Central)
                          { id: 16, name: 'Southeast', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                              { id: 243, name: 'Atlanta Hawks' },
                              { id: 246, name: 'Charlotte Hornets' },
                              { id: 258, name: 'Miami Heat' },
                              { id: 264, name: 'Orlando Magic' },
                              { id: 272, name: 'Washington Wizards' },
                          ]}, // closing grpID=16 (Southeast)
                      ]}, // closing grpID=12 (Eastern)
                      { id: 13, name: 'Western', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          { id: 17, name: 'Northwest', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                              { id: 250, name: 'Denver Nuggets' },
                              { id: 260, name: 'Minnesota Timberwolves' },
                              { id: 263, name: 'Oklahoma City Thunder' },
                              { id: 267, name: 'Portland Trail Blazers' },
                              { id: 271, name: 'Utah Jazz' },
                          ]}, // closing grpID=17 (Northwest)
                          { id: 18, name: 'Pacific', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                              { id: 252, name: 'Golden State Warriors' },
                              { id: 255, name: 'Los Angeles Clippers' },
                              { id: 256, name: 'Los Angeles Lakers' },
                              { id: 266, name: 'Phoenix Suns' },
                              { id: 268, name: 'Sacramento Kings' },
                          ]}, // closing grpID=18 (Pacific)
                          { id: 19, name: 'Southwest', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                              { id: 249, name: 'Dallas Mavericks' },
                              { id: 253, name: 'Houston Rockets' },
                              { id: 257, name: 'Memphis Grizzlies' },
                              { id: 261, name: 'New Orleans Pelicans' },
                              { id: 269, name: 'San Antonio Spurs' },
                          ]}, // closing grpID=19 (Southwest)
                      ]}, // closing grpID=13 (Western)
                  ]}, // closing grpID=10 (NBA)
                  { id: 11, name: 'Men\'s Spain club basketball', grpTypeTerm: '-99', grpShowSurvSelRival: true, groups: [
                      { id: 20, name: 'Liga ACB', grpTypeTerm: 'League', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=20 (Liga ACB)
                      { id: 21, name: 'LEB Oro', grpTypeTerm: 'League', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=21 (LEB Oro)
                      { id: 22, name: 'LEB Plata', grpTypeTerm: 'League', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=22 (LEB Plata)
                      { id: 23, name: 'Liga EBA', grpTypeTerm: 'League?', grpShowSurvSelRival: true, groups: [
                          { id: 24, name: 'Group A', grpTypeTerm: 'Group?', grpShowSurvSelRival: true, groups: [
                              { id: 25, name: 'Group A-A', grpTypeTerm: 'Sub-group?', grpShowSurvSelRival: true, groups: [
                              ]}, // closing grpID=25 (Group A-A)
                              { id: 26, name: 'Group A-B', grpTypeTerm: 'Sub-group?', grpShowSurvSelRival: true, groups: [
                              ]}, // closing grpID=26 (Group A-B)
                          ]}, // closing grpID=24 (Group A)
                          { id: 27, name: 'Group B', grpTypeTerm: 'Group?', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=27 (Group B)
                          { id: 28, name: 'Group C', grpTypeTerm: 'Group?', grpShowSurvSelRival: true, groups: [
                              { id: 29, name: 'Group C-A', grpTypeTerm: 'Sub-group?', grpShowSurvSelRival: true, groups: [
                              ]}, // closing grpID=29 (Group C-A)
                              { id: 30, name: 'Group C-B', grpTypeTerm: 'Sub-group?', grpShowSurvSelRival: true, groups: [
                              ]}, // closing grpID=30 (Group C-B)
                          ]}, // closing grpID=28 (Group C)
                          { id: 31, name: 'Group D', grpTypeTerm: 'Group?', grpShowSurvSelRival: true, groups: [
                              { id: 32, name: 'Group D-A', grpTypeTerm: 'Sub-group?', grpShowSurvSelRival: true, groups: [
                              ]}, // closing grpID=32 (Group D-A)
                              { id: 33, name: 'Group D-B', grpTypeTerm: 'Sub-group?', grpShowSurvSelRival: true, groups: [
                              ]}, // closing grpID=33 (Group D-B)
                          ]}, // closing grpID=31 (Group D)
                          { id: 34, name: 'Group E', grpTypeTerm: 'Group?', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=34 (Group E)
                      ]}, // closing grpID=23 (Liga EBA)
                  ]}, // closing grpID=11 (Men\'s Spain club basketball)
              ]}, // closing grpID=9 (Men\'s pro basketball)
              { id: 35, name: 'Men\'s US College basketball', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
                  { id: 36, name: 'NCAA', grpTypeTerm: 'Governing body', grpShowSurvSelRival: true, groups: [
                      { id: 38, name: 'Division I', grpTypeTerm: 'League', grpShowSurvSelRival: true, groups: [
                          { id: 41, name: 'America East', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=41 (America East)
                          { id: 42, name: 'American Athletic Conference', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=42 (American Athletic Conference)
                          { id: 43, name: 'Atlantic 10', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=43 (Atlantic 10)
                          { id: 44, name: 'Atlantic Coast Conference', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=44 (Atlantic Coast Conference)
                          { id: 45, name: 'Atlantic Sun', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=45 (Atlantic Sun)
                          { id: 46, name: 'Big 12', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=46 (Big 12)
                          { id: 47, name: 'Big East', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=47 (Big East)
                          { id: 48, name: 'Big Sky', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=48 (Big Sky)
                          { id: 49, name: 'Big South', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=49 (Big South)
                          { id: 50, name: 'Big Ten', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=50 (Big Ten)
                          { id: 51, name: 'Big West', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=51 (Big West)
                          { id: 52, name: 'Colonial Athletic', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=52 (Colonial Athletic)
                          { id: 53, name: 'Conference USA', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=53 (Conference USA)
                          { id: 54, name: 'Horizon', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=54 (Horizon)
                          { id: 55, name: 'Ivy League', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=55 (Ivy League)
                          { id: 56, name: 'Metro Atlantic Athletic', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=56 (Metro Atlantic Athletic)
                          { id: 57, name: 'Mid-Eastern', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=57 (Mid-Eastern)
                          { id: 58, name: 'Missouri Valley', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=58 (Missouri Valley)
                          { id: 59, name: 'Mountain West', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=59 (Mountain West)
                          { id: 60, name: 'Northeast', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=60 (Northeast)
                          { id: 61, name: 'Ohio Valley', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=61 (Ohio Valley)
                          { id: 62, name: 'Pac-12', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=62 (Pac-12)
                          { id: 63, name: 'Patriot League', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=63 (Patriot League)
                          { id: 64, name: 'Southeastern', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=64 (Southeastern)
                          { id: 65, name: 'Southern', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=65 (Southern)
                          { id: 66, name: 'Southland', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=66 (Southland)
                          { id: 67, name: 'Southwestern Athletic', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=67 (Southwestern Athletic)
                          { id: 68, name: 'Summit League', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=68 (Summit League)
                          { id: 69, name: 'Sun Belt', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=69 (Sun Belt)
                          { id: 70, name: 'West Coast', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=70 (West Coast)
                          { id: 71, name: 'Western Athletic', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=71 (Western Athletic)
                      ]}, // closing grpID=38 (Division I)
                      { id: 39, name: 'Division II', grpTypeTerm: 'League', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=39 (Division II)
                      { id: 40, name: 'Division III', grpTypeTerm: 'League', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=40 (Division III)
                  ]}, // closing grpID=36 (NCAA)
                  { id: 37, name: 'NAIA', grpTypeTerm: 'Governing body', grpShowSurvSelRival: true, groups: [
                  ]}, // closing grpID=37 (NAIA)
              ]}, // closing grpID=35 (Men\'s US College basketball)
              { id: 72, name: 'Men\'s national teams', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
                  { id: 73, name: 'Americas', grpTypeTerm: 'Region', grpShowSurvSelRival: true, groups: [
                      { id: 74, name: 'North American', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=74 (North American)
                      { id: 75, name: 'CONCENCABA', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                          { id: 76, name: 'CBC', grpTypeTerm: 'Sub sub-zone', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=76 (CBC)
                          { id: 77, name: 'COCABA', grpTypeTerm: 'Sub sub-zone', grpShowSurvSelRival: true, groups: [
                          ]}, // closing grpID=77 (COCABA)
                      ]}, // closing grpID=75 (CONCENCABA)
                      { id: 78, name: 'CONSUBASQUET', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=78 (CONSUBASQUET)
                  ]}, // closing grpID=73 (Americas)
                  { id: 79, name: 'Africa', grpTypeTerm: 'Region', grpShowSurvSelRival: true, groups: [
                      { id: 80, name: 'Zone 1', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=80 (Zone 1)
                      { id: 81, name: 'Zone 2', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=81 (Zone 2)
                      { id: 82, name: 'Zone 3', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=82 (Zone 3)
                      { id: 83, name: 'Zone 4', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=83 (Zone 4)
                      { id: 84, name: 'Zone 5', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=84 (Zone 5)
                      { id: 85, name: 'Zone 6', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=85 (Zone 6)
                      { id: 86, name: 'Zone 7', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=86 (Zone 7)
                  ]}, // closing grpID=79 (Africa)
                  { id: 87, name: 'Asia', grpTypeTerm: 'Region', grpShowSurvSelRival: true, groups: [
                      { id: 88, name: 'CABA', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=88 (CABA)
                      { id: 89, name: 'EABA', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=89 (EABA)
                      { id: 90, name: 'WABA', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=90 (WABA)
                      { id: 91, name: 'GBA', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=91 (GBA)
                      { id: 92, name: 'SABA', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=92 (SABA)
                      { id: 93, name: 'SEABA', grpTypeTerm: 'Sub-zone', grpShowSurvSelRival: true, groups: [
                      ]}, // closing grpID=93 (SEABA)
                  ]}, // closing grpID=87 (Asia)
                  { id: 94, name: 'Europe', grpTypeTerm: 'Region', grpShowSurvSelRival: true, groups: [
                  ]}, // closing grpID=94 (Europe)
                  { id: 95, name: 'Oceania', grpTypeTerm: 'Region', grpShowSurvSelRival: true, groups: [
                  ]}, // closing grpID=95 (Oceania)
              ]}, // closing grpID=72 (Men\'s national teams)
          ]}, // closing grpID=2 (Men\'s basketball (5 on 5))
      ]}, // closing grpID=111 (Basketball (5 on 5))
      { id: 112, name: 'Soccer', grpTypeTerm: 'Sport', grpShowSurvSelRival: false, groups: [
          { id: 3, name: 'Men\'s soccer', grpTypeTerm: 'Sport', grpShowSurvSelRival: false, groups: [
          ]}, // closing grpID=3 (Men\'s soccer)
      ]}, // closing grpID=112 (Soccer)
      { id: 113, name: 'Gridiron football', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
          { id: 4, name: 'Men\'s gridiron football', grpTypeTerm: 'Sport', grpShowSurvSelRival: false, groups: [
              { id: 118, name: 'Men\'s Amer football', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
                  { id: 119, name: 'Men\'s pro Amer football', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
                      { id: 120, name: 'North America', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
                          { id: 121, name: 'NFL', grpTypeTerm: 'League', grpShowSurvSelRival: false, groups: [
                              { id: 122, name: 'NFC', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                  { id: 124, name: 'North', grpTypeTerm: 'Division', grpShowSurvSelRival: true, groups: [
                                      { id: 165, name: 'Chicago Bears' },
                                      { id: 170, name: 'Detroit Lions' },
                                      { id: 171, name: 'Green Bay Packers' },
                                      { id: 177, name: 'Minnesota Vikings' },
                                  ]}, // closing grpID=124 (North)
                                  { id: 125, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: true, groups: [
                                      { id: 168, name: 'Dallas Cowboys' },
                                      { id: 180, name: 'New York Giants' },
                                      { id: 183, name: 'Philadelphia Eagles' },
                                      { id: 191, name: 'Washington Redskins' },
                                  ]}, // closing grpID=125 (East)
                                  { id: 126, name: 'South', grpTypeTerm: 'Division', grpShowSurvSelRival: true, groups: [
                                      { id: 161, name: 'Atlanta Falcons' },
                                      { id: 164, name: 'Carolina Panthers' },
                                      { id: 179, name: 'New Orleans Saints' },
                                      { id: 189, name: 'Tampa Bay Buccaneers' },
                                  ]}, // closing grpID=126 (South)
                                  { id: 127, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: true, groups: [
                                      { id: 160, name: 'Arizona Cardinals' },
                                      { id: 186, name: 'San Francisco 49ers' },
                                      { id: 187, name: 'Seattle Seahawks' },
                                      { id: 188, name: 'Los Angeles Rams' },
                                  ]}, // closing grpID=127 (West)
                              ]}, // closing grpID=122 (NFC)
                              { id: 123, name: 'AFC', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                  { id: 128, name: 'North', grpTypeTerm: 'Division', grpShowSurvSelRival: true, groups: [
                                      { id: 162, name: 'Baltimore Ravens' },
                                      { id: 166, name: 'Cincinnati Bengals' },
                                      { id: 167, name: 'Cleveland Browns' },
                                      { id: 184, name: 'Pittsburgh Steelers' },
                                  ]}, // closing grpID=128 (North)
                                  { id: 129, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: true, groups: [
                                      { id: 163, name: 'Buffalo Bills' },
                                      { id: 176, name: 'Miami Dolphins' },
                                      { id: 178, name: 'New England Patriots' },
                                      { id: 181, name: 'New York Jets' },
                                  ]}, // closing grpID=129 (East)
                                  { id: 130, name: 'South', grpTypeTerm: 'Division', grpShowSurvSelRival: true, groups: [
                                      { id: 172, name: 'Houston Texans' },
                                      { id: 173, name: 'Indianapolis Colts' },
                                      { id: 174, name: 'Jacksonville Jaguars' },
                                      { id: 190, name: 'Tennessee Titans' },
                                  ]}, // closing grpID=130 (South)
                                  { id: 131, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: true, groups: [
                                      { id: 169, name: 'Denver Broncos' },
                                      { id: 175, name: 'Kansas City Chiefs' },
                                      { id: 182, name: 'Oakland Raiders' },
                                      { id: 185, name: 'Los Angeles Chargers' },
                                  ]}, // closing grpID=131 (West)
                              ]}, // closing grpID=123 (AFC)
                          ]}, // closing grpID=121 (NFL)
                      ]}, // closing grpID=120 (North America)
                  ]}, // closing grpID=119 (Men\'s pro Amer football)
                  { id: 132, name: 'Men\'s collegiate Amer football', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
                      { id: 133, name: 'NCAA', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
                          { id: 134, name: 'Division I', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                              { id: 135, name: 'FBS', grpTypeTerm: 'Subdivision', grpShowSurvSelRival: false, groups: [
                                  { id: 139, name: 'ACC', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 150, name: 'Atlantic', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 14, name: 'Boston College' },
                                          { id: 21, name: 'Clemson' },
                                          { id: 30, name: 'Florida St' },
                                          { id: 93, name: 'Syracuse' },
                                          { id: 53, name: 'Maryland' },
                                          { id: 122, name: 'Wake Forest' },
                                          { id: 64, name: 'NC State' },
                                          { id: 50, name: 'Louisville' },
                                      ]}, // closing grpID=150 (Atlantic)
                                      { id: 151, name: 'Coastal', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 24, name: 'Duke' },
                                          { id: 35, name: 'Georgia Tech' },
                                          { id: 55, name: 'Miami-FL' },
                                          { id: 121, name: 'Virginia Tech' },
                                          { id: 119, name: 'UVA' },
                                          { id: 82, name: 'Pitt' },
                                          { id: 110, name: 'UNC' },
                                      ]}, // closing grpID=151 (Coastal)
                                  ]}, // closing grpID=139 (ACC)
                                  { id: 140, name: 'American', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 152, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 25, name: 'East Carolina' },
                                      ]}, // closing grpID=152 (East)
                                      { id: 153, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                      ]}, // closing grpID=153 (West)
                                  ]}, // closing grpID=140 (American)
                                  { id: 141, name: 'Big 12', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 12, name: 'Baylor' },
                                      { id: 42, name: 'Iowa St' },
                                      { id: 43, name: 'Kansas' },
                                      { id: 44, name: 'Kansas St' },
                                      { id: 76, name: 'Oklahoma' },
                                      { id: 77, name: 'Oklahoma St' },
                                      { id: 94, name: 'TCU' },
                                      { id: 97, name: 'Texas' },
                                      { id: 125, name: 'West Virginia' },
                                      { id: 100, name: 'Texas Tech' },
                                  ]}, // closing grpID=141 (Big 12)
                                  { id: 142, name: 'Big Ten', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 154, name: 'Leaders', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 75, name: 'Ohio St' },
                                          { id: 128, name: 'Wisconsin' },
                                          { id: 83, name: 'Purdue' },
                                          { id: 81, name: 'Penn St' },
                                          { id: 40, name: 'Indiana' },
                                          { id: 39, name: 'Illinois' },
                                      ]}, // closing grpID=154 (Leaders)
                                      { id: 155, name: 'Legends', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 58, name: 'Michigan St' },
                                          { id: 41, name: 'Iowa' },
                                          { id: 57, name: 'Michigan' },
                                          { id: 65, name: 'Nebraska' },
                                          { id: 60, name: 'Minnesota' },
                                          { id: 71, name: 'Northwestern' },
                                      ]}, // closing grpID=155 (Legends)
                                      { id: 168, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 85, name: 'Rutgers' },
                                          { id: 53, name: 'Maryland' },
                                          { id: 75, name: 'Ohio St' },
                                          { id: 58, name: 'Michigan St' },
                                          { id: 57, name: 'Michigan' },
                                          { id: 81, name: 'Penn St' },
                                          { id: 40, name: 'Indiana' },
                                      ]}, // closing grpID=168 (East)
                                      { id: 169, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 128, name: 'Wisconsin' },
                                          { id: 60, name: 'Minnesota' },
                                          { id: 65, name: 'Nebraska' },
                                          { id: 41, name: 'Iowa' },
                                          { id: 39, name: 'Illinois' },
                                          { id: 71, name: 'Northwestern' },
                                          { id: 83, name: 'Purdue' },
                                      ]}, // closing grpID=169 (West)
                                  ]}, // closing grpID=142 (Big Ten)
                                  { id: 143, name: 'C-USA', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 156, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 52, name: 'Marshall' },
                                          { id: 25, name: 'East Carolina' },
                                          { id: 59, name: 'Middle Tennessee' },
                                          { id: 29, name: 'Florida Atlantic' },
                                          { id: 27, name: 'FIU' },
                                          { id: 105, name: 'UAB' },
                                          { id: 91, name: 'Southern Miss' },
                                          { id: 111, name: 'UNC-Charlotte' },
                                          { id: 126, name: 'Western Kentucky' },
                                          { id: 73, name: 'ODU' },
                                          { id: 105, name: 'UAB' },
                                      ]}, // closing grpID=156 (East)
                                      { id: 157, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 84, name: 'Rice' },
                                          { id: 118, name: 'UTSA' },
                                          { id: 70, name: 'North Texas' },
                                          { id: 103, name: 'Tulane' },
                                          { id: 47, name: 'Louisiana Tech' },
                                          { id: 104, name: 'Tulsa' },
                                          { id: 117, name: 'UTEP' },
                                          { id: 91, name: 'Southern Miss' },
                                      ]}, // closing grpID=157 (West)
                                  ]}, // closing grpID=143 (C-USA)
                                  { id: 144, name: 'Independent', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 63, name: 'Navy' },
                                      { id: 72, name: 'Notre Dame' },
                                      { id: 38, name: 'Idaho' },
                                      { id: 17, name: 'BYU' },
                                      { id: 9, name: 'Army' },
                                      { id: 68, name: 'New Mexico St' },
                                  ]}, // closing grpID=144 (Independent)
                                  { id: 145, name: 'MAC', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 158, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 15, name: 'Bowling Green' },
                                          { id: 16, name: 'Buffalo' },
                                          { id: 2, name: 'Akron' },
                                          { id: 45, name: 'Kent St' },
                                          { id: 56, name: 'Miami-OH' },
                                          { id: 109, name: 'UMass' },
                                          { id: 74, name: 'Ohio' },
                                      ]}, // closing grpID=158 (East)
                                      { id: 159, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 69, name: 'NIU' },
                                          { id: 11, name: 'Ball St' },
                                          { id: 101, name: 'Toledo' },
                                          { id: 26, name: 'Eastern Michigan' },
                                          { id: 19, name: 'Central Michigan' },
                                          { id: 127, name: 'Western Michigan' },
                                      ]}, // closing grpID=159 (West)
                                  ]}, // closing grpID=145 (MAC)
                                  { id: 146, name: 'Mountain West', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 160, name: 'Mountain', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 1, name: 'Air Force' },
                                          { id: 116, name: 'Utah St' },
                                          { id: 13, name: 'Boise St' },
                                          { id: 23, name: 'Colorado St' },
                                          { id: 129, name: 'Wyoming' },
                                          { id: 67, name: 'New Mexico' },
                                      ]}, // closing grpID=160 (Mountain)
                                      { id: 161, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 31, name: 'Fresno St' },
                                          { id: 86, name: 'San Diego St' },
                                          { id: 112, name: 'UNLV' },
                                          { id: 87, name: 'San Jose St' },
                                          { id: 66, name: 'Nevada' },
                                          { id: 36, name: 'Hawai\'i' },
                                      ]}, // closing grpID=161 (West)
                                  ]}, // closing grpID=146 (Mountain West)
                                  { id: 147, name: 'Pac-12', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 162, name: 'North', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 92, name: 'Stanford' },
                                          { id: 79, name: 'Oregon' },
                                          { id: 80, name: 'Oregon St' },
                                          { id: 123, name: 'Washington' },
                                          { id: 124, name: 'Washington St' },
                                          { id: 18, name: 'Cal' },
                                      ]}, // closing grpID=162 (North)
                                      { id: 163, name: 'South', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 6, name: 'Arizona St' },
                                          { id: 5, name: 'Arizona' },
                                          { id: 107, name: 'UCLA' },
                                          { id: 113, name: 'USC' },
                                          { id: 115, name: 'Utah' },
                                          { id: 22, name: 'Colorado' },
                                      ]}, // closing grpID=163 (South)
                                  ]}, // closing grpID=147 (Pac-12)
                                  { id: 148, name: 'SEC', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 164, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 28, name: 'Florida' },
                                          { id: 32, name: 'Georgia' },
                                          { id: 46, name: 'Kentucky' },
                                          { id: 62, name: 'Missouri' },
                                          { id: 96, name: 'Tennessee' },
                                          { id: 90, name: 'South Carolina' },
                                          { id: 120, name: 'Vanderbilt' },
                                      ]}, // closing grpID=164 (East)
                                      { id: 165, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 3, name: 'Alabama' },
                                          { id: 10, name: 'Auburn' },
                                          { id: 51, name: 'LSU' },
                                          { id: 61, name: 'Mississippi St' },
                                          { id: 78, name: 'Ole Miss' },
                                          { id: 98, name: 'Texas A&M' },
                                          { id: 7, name: 'Arkansas' },
                                      ]}, // closing grpID=165 (West)
                                  ]}, // closing grpID=148 (SEC)
                                  { id: 149, name: 'Sun Belt', grpTypeTerm: 'Conference', grpShowSurvSelRival: true, groups: [
                                      { id: 166, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 102, name: 'Troy' },
                                          { id: 34, name: 'Georgia St' },
                                          { id: 33, name: 'Georgia Southern' },
                                          { id: 4, name: 'Appalachian St' },
                                          { id: 285, name: 'Coastal Carolina' },
                                      ]}, // closing grpID=166 (East)
                                      { id: 167, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                          { id: 8, name: 'Arkansas St' },
                                          { id: 99, name: 'Texas St' },
                                          { id: 48, name: 'Louisiana-Lafayette' },
                                          { id: 49, name: 'Louisiana-Monroe' },
                                          { id: 89, name: 'South Alabama' },
                                      ]}, // closing grpID=167 (West)
                                  ]}, // closing grpID=149 (Sun Belt)
                                  { id: 170, name: 'Other', grpTypeTerm: 'Other', grpShowSurvSelRival: false, groups: [
                                      { id: 105, name: 'UAB' },
                                  ]}, // closing grpID=170 (Other)
                              ]}, // closing grpID=135 (FBS)
                              { id: 136, name: 'FCS', grpTypeTerm: 'Subdivision', grpShowSurvSelRival: false, groups: [
                                  { id: 38, name: 'Idaho' },
                              ]}, // closing grpID=136 (FCS)
                          ]}, // closing grpID=134 (Division I)
                          { id: 137, name: 'Division II', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                          ]}, // closing grpID=137 (Division II)
                          { id: 138, name: 'Division III', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                          ]}, // closing grpID=138 (Division III)
                      ]}, // closing grpID=133 (NCAA)
                  ]}, // closing grpID=132 (Men\'s collegiate Amer football)
              ]}, // closing grpID=118 (Men\'s Amer football)
          ]}, // closing grpID=4 (Men\'s gridiron football)
      ]}, // closing grpID=113 (Gridiron football)
      { id: 114, name: 'Baseball', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
          { id: 5, name: 'Men\'s baseball', grpTypeTerm: 'Sport', grpShowSurvSelRival: false, groups: [
              { id: 96, name: 'Men\'s pro baseball', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
                  { id: 97, name: 'Americas', grpTypeTerm: 'Region', grpShowSurvSelRival: false, groups: [
                      { id: 101, name: 'United States', grpTypeTerm: 'Region', grpShowSurvSelRival: false, groups: [
                          { id: 102, name: 'Major League Baseball', grpTypeTerm: 'League', grpShowSurvSelRival: false, groups: [
                              { id: 103, name: 'American League', grpTypeTerm: 'League', grpShowSurvSelRival: true, groups: [
                                  { id: 105, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                      { id: 216, name: 'Boston Red Sox' },
                                      { id: 231, name: 'New York Yankees' },
                                      { id: 215, name: 'Baltimore Orioles' },
                                      { id: 239, name: 'Tampa Bay Rays' },
                                      { id: 241, name: 'Toronto Blue Jays' },
                                  ]}, // closing grpID=105 (East)
                                  { id: 106, name: 'Central', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                      { id: 224, name: 'Kansas City Royals' },
                                      { id: 220, name: 'Cleveland Indians' },
                                      { id: 218, name: 'Chicago White Sox' },
                                      { id: 229, name: 'Minnesota Twins' },
                                      { id: 222, name: 'Detroit Tigers' },
                                  ]}, // closing grpID=106 (Central)
                                  { id: 107, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                      { id: 237, name: 'Seattle Mariners' },
                                      { id: 240, name: 'Texas Rangers' },
                                      { id: 225, name: 'Los Angeles Angels' },
                                      { id: 223, name: 'Houston Astros' },
                                      { id: 232, name: 'Oakland Athletics' },
                                  ]}, // closing grpID=107 (West)
                              ]}, // closing grpID=103 (American League)
                              { id: 104, name: 'National League', grpTypeTerm: 'League', grpShowSurvSelRival: true, groups: [
                                  { id: 108, name: 'East', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                      { id: 214, name: 'Atlanta Braves' },
                                      { id: 227, name: 'Miami Marlins' },
                                      { id: 242, name: 'Washington Nationals' },
                                      { id: 230, name: 'New York Mets' },
                                      { id: 233, name: 'Philadelphia Phillies' },
                                  ]}, // closing grpID=108 (East)
                                  { id: 109, name: 'Central', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                      { id: 234, name: 'Pittsburgh Pirates' },
                                      { id: 228, name: 'Milwaukee Brewers' },
                                      { id: 217, name: 'Chicago Cubs' },
                                      { id: 238, name: 'St Louis Cardinals' },
                                      { id: 219, name: 'Cincinnati Reds' },
                                  ]}, // closing grpID=109 (Central)
                                  { id: 110, name: 'West', grpTypeTerm: 'Division', grpShowSurvSelRival: false, groups: [
                                      { id: 221, name: 'Colorado Rockies' },
                                      { id: 213, name: 'Arizona Diamondbacks' },
                                      { id: 235, name: 'San Diego Padres' },
                                      { id: 236, name: 'San Francisco Giants' },
                                      { id: 226, name: 'Los Angeles Dodgers' },
                                  ]}, // closing grpID=110 (West)
                              ]}, // closing grpID=104 (National League)
                          ]}, // closing grpID=102 (Major League Baseball)
                      ]}, // closing grpID=101 (United States)
                  ]}, // closing grpID=97 (Americas)
                  { id: 98, name: 'Asia', grpTypeTerm: 'Region', grpShowSurvSelRival: false, groups: [
                  ]}, // closing grpID=98 (Asia)
                  { id: 99, name: 'Europe', grpTypeTerm: 'Region', grpShowSurvSelRival: false, groups: [
                  ]}, // closing grpID=99 (Europe)
                  { id: 100, name: 'Oceania', grpTypeTerm: 'Region', grpShowSurvSelRival: false, groups: [
                  ]}, // closing grpID=100 (Oceania)
              ]}, // closing grpID=96 (Men\'s pro baseball)
          ]}, // closing grpID=5 (Men\'s baseball)
      ]}, // closing grpID=114 (Baseball)
      { id: 115, name: 'Cricket', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
          { id: 6, name: 'Men\'s cricket', grpTypeTerm: 'Sport', grpShowSurvSelRival: false, groups: [
          ]}, // closing grpID=6 (Men\'s cricket)
      ]}, // closing grpID=115 (Cricket)
      { id: 116, name: 'Ice hockey', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
          { id: 7, name: 'Men\'s ice hockey', grpTypeTerm: 'Sport', grpShowSurvSelRival: false, groups: [
          ]}, // closing grpID=7 (Men\'s ice hockey)
      ]}, // closing grpID=116 (Ice hockey)
      { id: 117, name: 'Rugby', grpTypeTerm: '-99', grpShowSurvSelRival: false, groups: [
          { id: 8, name: 'Men\'s rugby', grpTypeTerm: 'Sport', grpShowSurvSelRival: false, groups: [
          ]}, // closing grpID=8 (Men\'s rugby)
      ]}, // closing grpID=117 (Rugby)
    ]}, // closing grpID=1 (Sports)
  ];

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

  // The data tables below are copy/pasted from data outputted by Access (RivDB_BuildSurvey)
	var tbljsLeagues = { 
		lgID_001: {lgID:1, lgSport:"American football", lgName:"NCAA DI-A", lgCurrentSurvID:13, lgSlug:"s_m_afb_ncaad1a", lgFullName:"NCAA Division I FBS football", lgTheFullName:"NCAA Division I FBS football", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_002: {lgID:2, lgSport:"Ice hockey", lgName:"NHL", lgCurrentSurvID:14, lgSlug:"s_m_hok_nhl", lgFullName:"National Hockey League", lgTheFullName:"the National Hockey League", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_003: {lgID:3, lgSport:"American football", lgName:"NFL", lgCurrentSurvID:15, lgSlug:"s_m_afb_nfl", lgFullName:"National Football League", lgTheFullName:"the National Football League", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_004: {lgID:4, lgSport:"Soccer", lgName:"MLS", lgCurrentSurvID:16, lgSlug:"s_m_soc_mls", lgFullName:"Major League Soccer", lgTheFullName:"Major League Soccer", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_005: {lgID:5, lgSport:"Baseball", lgName:"MLB", lgCurrentSurvID:17, lgSlug:"s_m_bas_mlb", lgFullName:"Major League Baseball", lgTheFullName:"Major League Baseball", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_010: {lgID:10, lgSport:"Basketball", lgName:"NBA", lgCurrentSurvID:18, lgSlug:"s_m_bkb_nba", lgFullName:"National Basketball Association", lgTheFullName:"the National Basketball Association", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:0}, 
		lgID_007: {lgID:7, lgSport:"Cricket", lgName:"BBL", lgCurrentSurvID:19, lgSlug:"s_m_t20_bbl", lgFullName:"Big Bash League", lgTheFullName:"the Big Bash League", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:0}, 
		lgID_008: {lgID:8, lgSport:"Cricket", lgName:"IPL", lgCurrentSurvID:20, lgSlug:"s_m_t20_ipl", lgFullName:"Indian Premier League", lgTheFullName:"the Indian Premier League", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:0}, 
		lgID_009: {lgID:9, lgSport:"Basketball", lgName:"NCAAM", lgCurrentSurvID:21, lgSlug:"s_m_bkb_ncaad1", lgFullName:"NCAA Division I men's basketball", lgTheFullName:"NCAA Division I men's basketball", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		//lgID_010: {lgID:10, lgSport:"Basketball", lgName:"NCAAW", lgCurrentSurvID:22, lgSlug:"s_w_bkb_ncaad1", lgFullName:"NCAA Division I women's basketball", lgTheFullName:"NCAA Division I women's basketball", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_011: {lgID:11, lgSport:"American football", lgName:"NCAA DI-AA", lgCurrentSurvID:23, lgSlug:"s_m_afb_ncaad1aa", lgFullName:"NCAA Division I FCS football", lgTheFullName:"NCAA Division I FCS football", lgHasProRel:false, lgBritishSpelling:false, lgNumOfFavteamSublevels:1}, 
		lgID_012: {lgID:12, lgSport:"Soccer", lgName:"England men", lgCurrentSurvID:24, lgSlug:"s_m_soc_eng", lgFullName:"English men's football", lgTheFullName:"English men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_013: {lgID:13, lgSport:"Soccer", lgName:"Spain men", lgCurrentSurvID:25, lgSlug:"s_m_soc_esp", lgFullName:"Spanish men's football", lgTheFullName:"Spanish men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_014: {lgID:14, lgSport:"Soccer", lgName:"Germany men", lgCurrentSurvID:26, lgSlug:"s_m_soc_deu", lgFullName:"German men's football", lgTheFullName:"German men's football", lgHasProRel:true, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_015: {lgID:15, lgSport:"Soccer", lgName:"International men", lgCurrentSurvID:27, lgSlug:"s_m_soc_intl", lgFullName:"International men's football", lgTheFullName:"International men's football", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
		lgID_016: {lgID:16, lgSport:"Soccer", lgName:"International women", lgCurrentSurvID:28, lgSlug:"s_w_soc_intl", lgFullName:"International women's football", lgTheFullName:"International women's football", lgHasProRel:false, lgBritishSpelling:true, lgNumOfFavteamSublevels:1}, 
	};

	var tbljsSurveys = {
		survID_001: { survID:1, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_002: { survID:2, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_003: { survID:3, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_004: { survID:4, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_005: { survID:5, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_006: { survID:6, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_007: { survID:7, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_008: { survID:8, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_009: { survID:9, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_010: { survID:10, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_011: { survID:11, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_012: { survID:12, survLaunchDate:0, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:false, BLOCKInformedConsent:false, BLOCKFavTeam:false, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_013: { survID:13, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_014: { survID:14, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_015: { survID:15, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_016: { survID:16, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_017: { survID:17, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_018: { survID:18, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_019: { survID:19, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_020: { survID:20, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:true},
		survID_021: { survID:21, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_022: { survID:22, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_023: { survID:23, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_024: { survID:24, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_025: { survID:25, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_026: { survID:26, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_027: { survID:27, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
		survID_028: { survID:28, survLaunchDate:43302.3388888889, survInfConsTLDR:"InformedConsent_Sport_TLDR", survInfConsFullText:"InformedConsent_Sport_FullText", BLOCKIntro:true, BLOCKInformedConsent:false, BLOCKFavTeam:true, BLOCKFavTeamIden:false, BLOCKRivalTeam:false},
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
    self.Surveys = mapSurveys();
    self.Leagues = mapLeagues();
    //self.Teams = mapTeams();
  }

  init();
};