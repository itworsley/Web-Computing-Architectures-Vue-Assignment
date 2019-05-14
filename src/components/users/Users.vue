<template>
    <div>
        <div class="fullPage">
            <h1>Users</h1>
            <b-form-group
                id="userIDField"
                label="User ID Number:"
                label-for="userIDInput">
                <b-input
                    id="userIDInput"
                    v-model="searchID"
                    :state="userIDValidation">
                </b-input>
                <b-form-invalid-feedback :state="userIDValidation">
                    User ID must be a number
                </b-form-invalid-feedback>
            </b-form-group>
            <b-button @click="getUser()">Search for User</b-button>
            <div class="fullPage">
                <b-alert variant="danger" v-model="showError">No Profile Found</b-alert>
                <user-profile v-if="showProfile" :user="user" :authToken="authToken" :profileID="userID"></user-profile>
            </div>

        </div>
    </div>
</template>

<script>
    import UserProfile from './UserProfile.vue'
    export default {
        name: "Users",
        props: ['authToken'],
        data() {
            return {
                error: "",
                errorFlag: false,
                user: "",
                searchID: "",
                userID: "",
                showProfile: false,
                showError: false
            }
        },
        computed: {
            userIDValidation() {
                if (this.searchID.length === 0) {
                    return null
                }
                if (isNaN(this.searchID)) {
                    return false;
                }
                return this.searchID.length > 0
            }
        },
        methods: {
            getUser() {
                if (this.userIDValidation) {
                    this.showProfile = false;
                    this.$http.get('http://localhost:4941/api/v1/users/'+this.searchID, {
                        headers: {'X-Authorization': this.authToken}})
                        .then(response => {
                            if (response.ok) {
                                this.userID = this.searchID;
                                this.showError = false;
                                this.user = response.data;
                                this.showProfile = true;
                            }

                        }, response => {
                            if (response.status === 404) {
                                this.showProfile = false;
                                this.showError = true;
                            }
                        });
                }

            }
        },
        components: {
            UserProfile
        }
    }

</script>

<style scoped>

</style>
