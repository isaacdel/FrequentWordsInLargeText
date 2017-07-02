var express = require('express');
var router = express.Router();
var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

/* GET home page. */
router.get('/', function(req, res, next) {


  var numOfWords = 0;
  var wordsFrequencyMap = {};
  var pairWordsFrequencyMap = {};
  var instream = fs.createReadStream('PATH_TO_TEXT_FILE');
  var outstream = new stream;
  var rl = readline.createInterface(instream, outstream);

  rl.on('line', function(line) {
    // process line here
    if(line !== ''){
      line = line.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      var wordsInLine = line.split(' ');
      var wordsInLinePairs = [];
      var j = 0;
      for (var i=0 ; i<wordsInLine.length ; i+=2) {
        if (wordsInLine[i+1] !== undefined) {
          wordsInLinePairs[j] =  wordsInLine[i] +' '+ wordsInLine[i+1];
        } else {
            wordsInLinePairs[j] =  wordsInLine[i];
        }
        j++;
      }
      numOfWords += wordsInLine.length;
      wordsFrequencyMap = getMap(wordsInLine, wordsFrequencyMap);
      pairWordsFrequencyMap = getMap(wordsInLinePairs, pairWordsFrequencyMap);

    }

  });

  rl.on('close', function() {
    var array = getTopResults(wordsFrequencyMap, false);
    var pairsArray = getTopResults(pairWordsFrequencyMap, true);

    res.render('index',
        { title: 'Text processor',
          NumberOfWords: numOfWords,
          NumberOfUniqueWords: wordsFrequencyMap.length,
          TopWords: JSON.stringify(array, null ,2),
          TopWordsPairs: JSON.stringify(pairsArray, null ,2)
        }
    );
  });

});
function getMap(wordsInLine, wordsFrequencyMap){
  for (var i = 0; i < wordsInLine.length; i++){
    var word = wordsInLine[i];
    if(word in wordsFrequencyMap){
      wordsFrequencyMap[word] = wordsFrequencyMap[word] + 1;
      continue;
    }
    wordsFrequencyMap[word] = 1;
  }
  return wordsFrequencyMap;
}
function getTopResults(wordsFrequencyMap, isPairs){
  var array = [];
  for (var key in wordsFrequencyMap) {
    array.push({
      word: key,
      frequency: wordsFrequencyMap[key]
    });
  }
  if(isPairs){
    array = array.filter(function(obj) {
      return obj.word.indexOf(' ') > 0;
    });
  }
  var sorted = array.sort(function(a, b) {
    return (a.frequency > b.frequency) ? -1 : ((b.frequency > a.frequency) ? 1 : 0)
  });
  sorted = sorted.slice(0,9);
  return sorted;
}
module.exports = router;
