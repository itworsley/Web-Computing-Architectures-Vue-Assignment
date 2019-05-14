import Vue from 'vue';
import App from './App.vue';
import Home from './components/mainComponents/Home.vue';
import Users from './components/users/Users.vue';
import Venues from './components/venues/Venues.vue';
import AddVenue from './components/venues/AddVenue.vue';
import Signup from './components/authentication/Signup.vue'
import Login from './components/authentication/Login.vue'
import Profile from './components/users/MyProfile.vue'

import VueResource from 'vue-resource';
Vue.use(VueResource);

import VueRouter from 'vue-router';
Vue.use(VueRouter);

import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

const routes = [
    {
        path: "/",
        component: Home
    },
    {
        path: "/users",
        name: "users",
        component: Users
    },
    {
        path: "/profile",
        name: "profile",
        component: Profile
    },
    {
        path: "/users/:userId",
        name: "user",
        component: Users
    },
    {
        path: "/venues",
        name: "venues",
        component: Venues
    },
    {
        path: "/addVenue",
        name: "addVenue",
        component: AddVenue
    },
];

const router = new VueRouter({
    routes: routes,
    mode: 'history'
});

new Vue({
    el: '#app',
    router: router,
    render: h => h(App)
});


