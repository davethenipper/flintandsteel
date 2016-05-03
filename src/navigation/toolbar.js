/* global angular */

angular.module('flintAndSteel')
.controller('ToolbarCtrl',
    [
        '$scope', '$state', '$stateParams', '$mdSidenav', 'userSvc', '$mdDialog', 'toastSvc',
        function($scope, $state, $stateParams, $mdSidenav, userSvc, $mdDialog, toastSvc) {
            "use strict";

            $scope.displayOverflow = false;

            $scope.accountClick = function accountClick() {

                if (userSvc.isUserLoggedIn()) {
                    $state.go('account');
                }
                else {
                    $state.go('home');
                }
            };

            $scope.stateIsHome = function checkState() {
                return $state.is('home');
            };

            $scope.showNav = function showNav() {
                $mdSidenav('left').toggle();
            };

            $scope.isUserLoggedIn = userSvc.isUserLoggedIn;

            $scope.getUsername = function getUsername() {
                if ($scope.isUserLoggedIn()) {
                    return userSvc.getProperty('username');
                }
                return null;
            };

            //Login controller showing current login and logging in a new user
            $scope.showLogin = function(ev) {
                $mdDialog.show({
                    controller: 'LoginDialogCtrl',
                    templateUrl: 'users/loginView/loginView.tpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    $scope.loginUser(answer);
                }, function() {
                    $scope.status = 'You canceled the dialog.';
                });
            };

            // Function used to display feedback on login - OK, Error, or User Not Found
            $scope.loginUser = function(account) {
                userSvc.checkLogin(account).then(function LoginSuccess(response) {
                    var content;
                    if (response.data.status === 'AUTH_OK') {
                        $scope.currentUser = response.data.name;
                        content = response.data.name + ' has successfully signed in!';
                    }
                    else if (response.data.status === 'AUTH_ERROR') {
                        content = 'Invalid credentials :(';
                    }
                    else if (response.data.status === 'USER_NOT_FOUND') {
                        content = 'The user was not found in the server!';
                    }
                    toastSvc.show(content);
                },
                function loginError(data, status) {
                    console.log(status);
                });
            };

            // Logout from menu
            $scope.logout = function logout() {
                var accountName = userSvc.getProperty('name');
                userSvc.logout();
                toastSvc.show(accountName + ' has been logged out!');

                // Reload if editing data to clear partial content
                if ($state.includes('idea')) {
                    $state.reload('idea');
                }
                else if ($state.includes('addidea') || $state.includes('account')) {
                    $state.go('home');
                }
            };

            // Re-route to account page from menu
            $scope.settings = function settings() {
                $state.go('account');
            };
        }
    ]
);
