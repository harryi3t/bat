'use strict';

var mocha = require('mocha');
var nconf = require('nconf');
var chai = require('chai');
var _ = require('underscore');
var assert = chai.assert;
var testSuiteNum = '1.';
var testSuiteDesc = 'Node Settings';
var adapter = require('../../../../_common/shippable/github/Adapter.js');
var Shippable = require('../../../../_common/shippable/Adapter.js');

var testSuite = util.format('%s2 - %s', testSuiteNum,
                  testSuiteDesc);

var isTestFailed = false;
var testCaseErrors = [];
var shippable = '';
var subscriptionId = '';
var clusterNodeId = '';
var clusterNode = {};

describe(testSuite,
  function () {

    describe('ClusterNode Settings Controller',
      function () {
        it('Organization-Owner-github-getSubscription',
          function (done) {
            this.timeout(0);
            shippable = new Shippable(config.apiToken);
            var query = util.format('subscriptionOrgNames=%s',nconf.get("GITHUB_ORG_1"));
            shippable.getSubscriptions(query,
              function(err, subscriptions) {
                if (err) {
                  isTestFailed = true;
                  var testCase =
                    util.format(
                      '\n- [ ] %s: Get subscriptions, failed with error: %s',
                      testSuiteDesc, err);
                  testCaseErrors.push(testCase);
                  assert.equal(err, null);
                  return done();
                } else {
                  if (subscriptions.status<200 || subscriptions.status>=299)
                    logger.warn("status is::",subscriptions.status);
                  subscriptionId = _.first(subscriptions).id;
                  return done();
                }
              }
            );
          }
        );

        it('get ClusterNodes',
          function (done) {
            this.timeout(0);

            var query = util.format('subscriptionIds=%s&nodeTypeCode=7000',
              subscriptionId);

            shippable.getClusterNodes(query,
              function(err, clusterNodes) {
                if (err) {
                  isTestFailed = true;
                  var testCase =
                    util.format(
                      '\n- [ ] %s: getClusterNodes failed with error: %s',
                      testSuiteDesc, err);
                  testCaseErrors.push(testCase);
                  assert.equal(err, null);
                  return done();
                } else {
                  if (!_.isEmpty(clusterNodes))
                    clusterNodeId = _.first(clusterNodes).id;
                  return done();
                }
              }
            );
          }
        );

        it('get ClusterNode ById',
          function (done) {
            this.timeout(0);

            if (!clusterNodeId) return done();

            shippable.getClusterNodeById(clusterNodeId,
              function(err, clusterNode) {
                if (err) {
                  isTestFailed = true;
                  var testCase =
                    util.format(
                      '\n- [ ] %s: getClusterNodeById failed with error: %s',
                      testSuiteDesc, err);
                  testCaseErrors.push(testCase);
                  assert.equal(err, null);
                  return done();
                }
                clusterNode = clusterNode;
                return done();
              }
            );
          }
        );

        it('Edit ClusterNode ById',
          function (done) {
            this.timeout(0);

            if (!clusterNodeId) return done();

            var editNode = {
              friendlyName: 'edit-test-owner-node',
            };
            shippable.putClusterNodeById(clusterNodeId, editNode,
              function(err) {
                if (err) {
                  isTestFailed = true;
                  var testCase =
                    util.format(
                      '\n- [ ] %s: putClusterNodeById failed with error: %s',
                      testSuiteDesc, err);
                  testCaseErrors.push(testCase);
                  assert.equal(err, null);
                }
                return done();
              }
            );
          }
        );

        it('Reset ClusterNode',
          function (done) {
            this.timeout(0);

            if (!clusterNodeId) return done();

            console.log("clusterNode status::",clusterNode.statusCode);

            if (clusterNode.statusCode < 30 || clusterNode.statusCode > 90)
              return done();

            console.log("clusterNode status::",clusterNode.statusCode);

            var editNode = {
              isReset: true
            };
            shippable.putClusterNodeById(clusterNodeId, editNode,
              function(err) {
                if (err) {
                  isTestFailed = true;
                  var testCase =
                    util.format(
                      '\n- [ ] %s: putClusterNodeById failed with error: %s',
                      testSuiteDesc, err);
                  testCaseErrors.push(testCase);
                  assert.equal(err, null);
                }
                return done();
              }
            );
          }
        );

        it('delete ClusterNodeById',
          function (done) {
            this.timeout(0);

            if (!clusterNodeId) return done();

            shippable.deleteClusterNodeById(clusterNodeId,
              function(err) {
                if (err) {
                  isTestFailed = true;
                  var testCase =
                    util.format(
                      '\n- [ ] %s: deleteClusterNodeById failed with error: %s',
                      testSuiteDesc, err);
                  testCaseErrors.push(testCase);
                  assert.equal(err, null);
                }
                return done();
              }
            );
          }
        );

        it('Change to Dynamic Node',
          function (done) {
            this.timeout(0);

            var update = {
              nodeTypeCode: 7001
            };

            shippable.putSubscriptionById(subscriptionId, update,
              function(err) {
                if (err) {
                  isTestFailed = true;
                  var testCase =
                    util.format(
                      '\n- [ ] %s: putSubscriptionById failed with error: %s',
                      testSuiteDesc, err);
                  testCaseErrors.push(testCase);
                  assert.equal(err, null);
                }
                return done();
              }
            );
          }
        );


      }
    );

    describe('Should run after above test suites',
      function () {

        it('Creating Github Issue if test cases failed',
          function (done) {
            this.timeout(0);
            if (isTestFailed) {
              var githubAdapter =
                new adapter(config.githubToken, config.githubUrl);
              var title = util.format('Failed test suite %s', testSuite);
              var body = util.format(
                'Failed test cases are:\n%s',testCaseErrors);
              var data = {
                title: title,
                body: body
              };
              githubAdapter.pushRespositoryIssue('deepikasl', 'VT1', data,
                function(err, res) {
                  if (err)
                    logger.warn("Creating Issue failed with error: ", err);
                  return done();
                }
              );
            } else {
              return done();
            }
          }
        );

      }
    );

  }
);
