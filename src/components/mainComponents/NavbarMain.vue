<template>
    <div>
        <b-navbar toggleable="lg" type="dark" variant="success" ref="nav">
            <b-navbar-brand href="/">SENG365 - Assignment 2</b-navbar-brand>
            <!-- Allows for collapsible navbar for variable window size -->
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <!-- Left Aligned Navbar Items -->
                <b-navbar-nav>
                    <b-nav-item href="/venues">Find a Venue</b-nav-item>
                    <b-nav-item v-if="authenticationToken" href="/addVenue">Add a Venue</b-nav-item>
                    <b-nav-item href="/users">Users</b-nav-item>
                </b-navbar-nav>
                <!-- Right Aligned Navbar Items -->
                <b-navbar-nav class="ml-auto">
                    <b-nav-item v-if="!authToken" @click="showSignup">Sign Up</b-nav-item>
                    <b-nav-item v-if="authToken" href="/profile">My Profile</b-nav-item>
                    <b-nav-item v-if="!authToken" @click="showLogin">Login</b-nav-item>
                    <b-nav-item v-if="authToken" @click="logout">Logout</b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <b-modal ref="login-modal" title="Login" hide-footer>
            <login @logged-in="successLogin"></login>
        </b-modal>

        <b-modal ref="signup-modal" title="Sign Up" hide-footer>
            <signup @logged-in="successLogin"></signup>
        </b-modal>
    </div>
</template>

<script>
    import Login from '../authentication/Login.vue'
    import Signup from '../authentication/Signup.vue'
    export default {
        name: "navbarMain",
        props: ['profile', 'authToken'],
        components: {
            Login,
            Signup
        },
        data() {
            return {
            }
        },
        computed: {
            authenticationToken() {
                return sessionStorage.getItem('accessToken');
            }
        },
        methods: {
            /**
             * Logs the user out and returns to the home page.
             */
            logout() {
                let self = this;
                fetch('http://localhost:4941/api/v1/users/logout', {
                    method: "POST",
                    headers: {
                        'X-Authorization': sessionStorage.getItem('accessToken')
                    }
                })
                    .then(function (response) {
                        if (response.ok) {
                            sessionStorage.clear();
                            self.$router.replace("/");
                            self.$router.go();
                            return response;
                        } else {
                            self.$router.push("/venues");
                            return response;
                        }
                    });
            },
            showLogin() {
                this.$refs['login-modal'].show();
            },
            showSignup() {
                this.$refs['signup-modal'].show();
            },
            successLogin() {
                this.$refs['login-modal'].hide();
                this.$refs['signup-modal'].hide();
            }
        }
    }
</script>

<style scoped>

</style>
