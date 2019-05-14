<template>
    <div>
        <div >
            <b-row>
                <b-col>
                    <h1>User Profile</h1>
                    <h5>Full Name: {{user.givenName}} {{user.familyName}}</h5>
                    <h5>Username: {{user.username}}</h5>
                    <h5 v-if="profileID === sessionID">Email: {{user.email}}</h5>
                </b-col>
                <b-col>
                    <!-- Displays the profile's image -->
                    <b-img
                        ref="profile-photo"
                        :src= "'http://localhost:4941/api/v1/users/' + this.profileID + '/photo'"
                        onerror="this.src='../../../src/assets/placeholder-venue-image.png';"
                        fluid
                        alt="Profile Image"
                        thumbnail
                        @click="openImageModal"
                        style="cursor: pointer">
                    </b-img>
                </b-col>
            </b-row>
            <b-modal ref="image-full-modal" hide-footer size="xl" title="User's profile picture">
                <div class="d-block text-center">
                    <b-img
                        :src= "'http://localhost:4941/api/v1/users/' + this.profileID + '/photo'"
                        onerror="this.src='../../../src/assets/placeholder-venue-image.png';"
                        fluid
                        alt="Profile Image"
                        thumbnail>
                    </b-img>
                </div>
            </b-modal>
        </div>
    </div>
</template>

<script>
    export default {
        name: "UserProfile",
        props: ['user', 'authToken', 'profileID'],
        computed: {
            sessionID() {
                return sessionStorage.getItem('profileID');
            }
        },
        methods: {
            openImageModal() {
                this.$refs['image-full-modal'].show()
            },
        }
    }
</script>

<style scoped>

</style>
