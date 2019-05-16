<template>
    <div id="app">
        <nav-main :authToken="authToken"></nav-main>
        <router-view :key="refreshPageKey" @refresh-page="refreshPage" :authToken="authToken" :categories="categories" :profileID="loggedInUser"></router-view>
    </div>
</template>

<script>
    import NavMain from './components/mainComponents/NavbarMain';
    import Login from './components/authentication/Login.vue'
    export default {
        name: 'app',
        data() {
            return {
                categories: [],
                loggedInUser: "",
                authToken: "",
                authFlag: "",
                refreshPageKey: 0
            }
        },
        mounted() {
            this.getAllCategories();
            this.getSessionAuthToken();
        },
        methods: {
            refreshPage() {
                this.refreshPageKey += 1;
            },
            getAllCategories() {
                console.log(sessionStorage.getItem('accessToken'));
                this.$http.get('http://localhost:4941/api/v1/categories')
                    .then(function(response) {
                        this.categories = response.data
                    }, function(error) {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            getSessionAuthToken() {
                this.authToken = sessionStorage.getItem('accessToken');
                this.loggedInUser = sessionStorage.getItem('profileID');
            }
        },
        components: {
            NavMain,
            Login
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
    }

    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
    .fullPage {
        margin: 3vh 10vw 10vw;
    }
    .pageTitle {
        text-align: center;
    }
</style>
