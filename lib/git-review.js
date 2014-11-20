var https = require('https');
var prompt = require('prompt');
var github = require('octonode');
var colors = require('colors');
var client, organization, repositoriesFlag;

var properties = [{
  name: 'username',
  validator: /^[a-zA-Z\s\-]+$/,
  warning: 'Username must be only letters, spaces, or dashes',
}, {
  name: 'password',
  hidden: true
}, {
  name: 'organization',
  default: 'Codeminer42'
}, {
  name: 'repositories',
  description: 'Show public repositories?',
  default: 'N'
}];

prompt.get(properties, function(err, result) {
  if (err) {
    return onErr(err);
  }

  client = github.client({
    username: result.username,
    password: result.password
  });

  organization = result.organization;
  repositoriesFlag = result.repositories.toUpperCase() !== 'N';
  getRepositories();
});

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
