'use strict';

var testSuiteNum = '1.';
var testSuiteDesc = 'Sync Account for organization owner';
var adapter = require('../../../../_common/shippable/github/Adapter.js');
var Shippable = require('../../../../_common/shippable/Adapter.js');

var testSuite = util.format('%s2_sync_accountByid - %s',
                  testSuiteNum, testSuiteDesc);

describe(testSuite,
  function () {

    it('Sync Account for organization owner',
      function (done) {
        this.timeout(0);
        var shippable = new Shippable(config.apiToken);
        shippable.forceSyncAccountById(nconf.get("shiptest-github-owner:accountId"),
          function(err, res) {
            if (err) {
              var bag = {
                testSuite: testSuite,
                error: err
              }
              async.series([
                  _createIssue.bind(null, bag)
                ],
                function (err) {
                  if (err) {
                    logger.warn('Failed');
                    return done(err);
                  }
                  else {
                    logger.debug('Issue Created');
                    return done();
                  }
                }
              );
            } else {
              if (res.status<200 || res.status>=299)
                logger.warn("status is::",res.status);
              return done();
            }
          }
        );
      }
    );
  }
);

function _createIssue(bag,next) {
  var githubAdapter = new adapter(config.githubToken, config.githubUrl);
  var title = util.format('Failed test case %s', bag.testSuite);
  var body = util.format('Failed with error: %s', bag.error);
  var data = {
    title: title,
    body: body
  }
  githubAdapter.pushRespositoryIssue('deepikasl', 'VT1', data,
    function(err, res) {
      logger.debug("response is::",res.status);
      if (err)
        logger.warn("Creating Issue failed with error: ", err);
      return next();
    }
  );
}
