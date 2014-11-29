var https = require('https');
var prompt = require('prompt');
var github = require('octonode');
var colors = require('colors');
var args = require('optimist').argv;

var client, organization, token, repositoriesFlag;

var buildClient = function(attrs) {
  if (attrs['token']) {
    return github.client(attrs['token']);
  } else if (attrs.username) {
    return github.client({ username: attrs['username'], password: attrs['password'] });
  }
}

var getRepositories = function() {
  console.log(colors.cyan('\n\n\n\n\nGetting opened Pull Requests from ' + organization + ' repositories...\n'));
  client.get('/orgs/' + organization + '/repos', {}, function(err, status, body, headers) {
    body.forEach(function(repository) {
      if (repository.private) {
        getPullRequests(repository.name);
      } else if (repositoriesFlag) {
        getPullRequests(repository.name);
      }
    });
  });
};

var getPullRequests = function(repository) {
  client.get('/repos/' + organization + '/' + repository + '/pulls', {}, function(err, status, body, headers) {
    var size = Object.keys(body).length;

    body.forEach(function(pull, index) {
      printPullRequests(pull, index, repository, size);
    });
  });
};

var printPullRequests = function(pull, index, repository, size) {
  if (pull.state === 'open') {
    if (index === 0) {
      console.log(colors.green('\n' + repository + ': (' + size + ')'));
    }
    console.log(colors.blue('➜ '), pull.html_url);
  }
};

if (args.token) {
  client = buildClient({token: args.token});
} else if (args.username) {
  client = buildClient({username: args.username, password: args.password});
} else {
  console.log("You should pass either a token or a username/password");
  process.exit(0);
}

organization = args.organization;
repositoriesFlag = args.public;

getRepositories();
