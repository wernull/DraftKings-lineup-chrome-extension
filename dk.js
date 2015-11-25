var headerElem = document.getElementById('daily_tool');
if(headerElem == null) {
  var link = document.createElement("link");
  link.href = chrome.extension.getURL("daily.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
  
  var insertHTML = '<div id="daily_tool">'+
    '<span id="error"></span>' +
    '<h6><span id="id_title"></span> ID: <span id="item_id"></span></h6>' +
    '<input id="playerList" value="">' +
    '<button id="refresh">Refresh</button>' +
    '<button id="setlineup">Set Lineup</button>' +
    '</div>';
  document.body.insertAdjacentHTML( 'afterbegin', insertHTML);

  headerElem = document.getElementById('daily_tool');
  var itemId = document.getElementById('item_id');
  var idTitle = document.getElementById('id_title');
  var idElem,  groupId, lineupId, playerData;

  var setLineupCta = document.getElementById('setlineup');
  var refreshCta = document.getElementById('refresh');
  var errorElm = document.getElementById('error');

  function setContestId() {
    idElem = document.querySelector('.export-to-csv');
    if(idElem) groupId = idElem.href.split('draftGroupId=')[1];
    lineupId = idElem.href.split('lineupId=')[1];

    errorElm.innerText = '';

    var url, argHash;
    if (lineupId !== undefined) {
      url = '/lineup/getavailableplayersbylineupid';
      argHash = { lineupId: lineupId };
    } else {
      url = '/lineup/getavailableplayers';
      argHash = {
          draftGroupId: groupId
      };
    }
    $.get(url, argHash, function(data) {
      if (groupId) {
        idTitle.innerText = 'Group';
        itemId.innerText = groupId;
      } else if (lineupId) {
        idTitle.innerText = 'Lineup';
        itemId.innerText = lineupId;
      }
      setLineupCta.className = '';
      setLineupCta.onclick = setPlayerLineup;
      refreshCta.onclick = setContestId;

      if(data.playerList){
        playerData = data;
      } else {
        console.log('player list not found', data);
        errorElm.innerText = 'player list not found';
      }
      
    });
  }

  setContestId();

  function setPlayerLineup() {
    if (groupId || lineupId) {
      var playerList = document.getElementById('playerList').value.split(',');

      var exeJs = '';
      var errorList = '';
      var PlayersToSet = [];

      console.log(playerData);
      playerList.forEach(function(plyr){
        var plyrObj = playerData.playerList.filter(function( obj ) {
          return plyr.trim() === obj.fn + ' ' + obj.ln;
        })[0];
        if (plyrObj && plyrObj.pid && plyrObj.s) {
          PlayersToSet.push(plyrObj);
          exeJs += 'lineupModManager.getInstance().draftPlayer(' + plyrObj.pid + ', ' + plyrObj.s + ');'
        } else {
          errorList += plyr + ' not found. '
        }
      });
      errorElm.innerText = errorList;
        
      var script = document.createElement('script');
      script.id = 'tmpScript';
      script.appendChild(document.createTextNode(exeJs));
      headerElem.appendChild(script);
      headerElem.removeAttribute('players');
      headerElem.removeChild(script);
    } else {
      errorElm.innerText = 'Missing Group/Linup ID';
    }
  }

}
