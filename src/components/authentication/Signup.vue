<template>
    <div>
        <b-alert v-model="showError" variant="danger" dismissible>{{alertMessage}}</b-alert>
        <b-alert v-model="showSuccess" variant="success" dismissible>{{alertMessage}}</b-alert>
        <b-form-group
            id="givenNameField"
            label="Given Name:"
            label-for="givenNameInput">
            <b-input
                id="givenNameInput"
                v-model="givenName"
                :state="givenNameValidation">
            </b-input>
        </b-form-group>

        <b-form-group
            id="familyNameField"
            label="Family Name:"
            label-for="familyNameInput">
            <b-input
                id="familyNameInput"
                v-model="familyName"
                :state="familyNameValidation">
            </b-input>
        </b-form-group>

        <b-form-group
            id="usernameField"
            label="Username:"
            label-for="usernameInput">
            <b-input
                id="usernameInput"
                v-model="username"
                :state="usernameValidation">
            </b-input>
        </b-form-group>

        <b-form-group
            id="emailField"
            label="Email Address:"
            label-for="emailInput">
            <b-input
                id="emailInput"
                v-model="email"
                :state="emailValidation">
            </b-input>
        </b-form-group>

        <b-form-group
            id="passwordField"
            label="Password:"
            label-for="passwordInput">
            <b-input
                id="passwordInput"
                v-model="password"
                type="password"
                :state="passwordValidation">
            </b-input>
        </b-form-group>

        <b-form-group
            id="rePasswordField"
            label="Retype Password:"
            label-for="rePasswordInput">
            <b-input
                id="rePasswordInput"
                v-model="rePassword"
                type="password"
                :state="rePasswordValidation">
            </b-input>
            <b-form-invalid-feedback :state="rePasswordValidation">
                This isn't the same as the password!
            </b-form-invalid-feedback>
        </b-form-group>
        <b-button variant="success" block @click="validateUserData">Sign Up</b-button>
    </div>

</template>

<script>
    export default {
        name: "Signup",
        data() {
            return {
                givenName: "",
                familyName: "",
                username: "",
                email: "",
                password:"",
                rePassword: "",
                showError: false,
                alertMessage: "",
                showSuccess: false
            }
        },
        computed: {
            givenNameValidation() {
                if (this.givenName.length === 0) {
                    return null;
                }
                return this.givenName.length > 0;
            },
            familyNameValidation() {
                if (this.familyName.length === 0) {
                    return null;
                }
                return this.familyName.length > 0;
            },
            usernameValidation() {
                if (this.username.length === 0) {
                    return null;
                }
                return this.username.trim().length > 0 && this.username.length < 64;
            },
            emailValidation() {
                if (this.email.length === 0) {
                    return null;
                }
                let emailRegex = new RegExp("^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}" +
                    "[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$");
                return emailRegex.test(this.email);
            },
            passwordValidation() {
                if (this.password.length === 0) {
                    return null;
                }
                return this.password.trim().length > 0;
            },
            rePasswordValidation() {
                if (this.rePassword.length === 0) {
                    return null;
                }
                return this.password.length > 0 && this.rePassword === this.password;
            },
        },
        methods: {
            validateUserData() {
                if (this.givenNameValidation && this.familyNameValidation && this.usernameValidation
                    && this.emailValidation && this.passwordValidation && this.rePasswordValidation) {
                    this.showError = false;
                    this.createNewUser();
                } else {
                    this.showSuccess = false;
                    this.showError = true;
                    this.alertMessage = "There is something wrong in the form!";
                }
            },
            createNewUser() {
                let self = this;
                let profile = {
                    "username": this.username,
                    "givenName": this.givenName,
                    "familyName": this.familyName,
                    "email": this.email,
                    "password": this.password
                };
                fetch('http://localhost:4941/api/v1/users', {
                    method: 'POST',
                    headers: {'content-type': 'application/json'},
                    body: JSON.stringify(profile)
                }).then(function (response) {
                    if(response.ok) {
                        self.showSuccess = true;
                        self.alertMessage = "Profile Successfully Created";
                        self.login();
                    } else {
                        self.showSuccess = false;
                        self.showError = true;
                        if (response.status === 400) {
                            self.alertMessage = "Username or Email already in use"
                        } else {
                            self.alertMessage = response.statusText;
                        }

                    }
                });
            },
            login() {
                let self = this;
                let login = {
                    "username": this.username,
                    "password": this.password
                };
                fetch('http://localhost:4941/api/v1/users/login', {
                    method: 'POST',
                    headers: {'content-type': 'application/json'},
                    body: JSON.stringify(login)
                }).then(res => res.json()
                    .then((response) => {
                        sessionStorage.accessToken = JSON.parse(JSON.stringify(response)).token;
                        sessionStorage.profileID = JSON.parse(JSON.stringify(response)).userId;
                        self.$emit('logged-in', true);
                        self.$router.replace("/profile");
                        self.$router.go();
                    })
                ).catch(() => {
                    self.showError = true;
                    self.alertMessage = "Invalid User Credentials";
                });
            }
        }
    }
</script>

<style scoped>

</style>
