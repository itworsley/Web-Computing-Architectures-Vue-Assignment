<template>
    <div>
        <b-alert v-model="showError" variant="danger" dismissible>{{errorMessage}}</b-alert>
        <b-form-group
            id="usernameEmailField"
            label="Username/Email:"
            label-for="usernameEmailInput">
            <b-input
                id="usernameEmailInput"
                v-model="usernameEmail">
            </b-input>
        </b-form-group>

        <b-form-group
            id="passwordField"
            label="Password:"
            label-for="passwordInput">
            <b-input
                id="passwordInput"
                v-model="password"
                type="password">
            </b-input>
        </b-form-group>

        <b-button variant="success" block @click="login">Login</b-button>
    </div>
</template>

<script>
    export default {
        name: "Login",
        props: ['profile'],
        data() {
            return {
                usernameEmail: "",
                email: "",
                password: "",
                showError: false,
                errorMessage: "",
                authToken: "",
                loggedInUser: ""
            }
        },
        methods: {
            login() {
                let self = this;
                let login = {
                    "username": this.usernameEmail,
                    "password": this.password
                };
                if (this.usernameEmail.includes("@")) {
                    login = {
                        "email": this.usernameEmail,
                        "password": this.password
                    }
                }
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
                    self.errorMessage = "Invalid User Credentials";
                });
            }
        }
    }
</script>

<style scoped>

</style>
