<template>
    <div>
        <div class="fullPage">
            <div v-if="authToken">
                <b-row>
                    <b-col v-if="!showSpinner">
                        <h1>My Profile</h1>
                        <h5>Full Name: {{profile.givenName}} {{profile.familyName}}</h5>
                        <h5>Username: {{profile.username}}</h5>
                        <h5>Email: {{profile.email}}</h5>

                        <b-button variant="primary" @click="populateEditModal">Edit my profile</b-button>
                        <b-alert style="margin-top: 10px" v-model="showSuccessEdit" variant="success" dismissible>
                            {{alertMessage}}
                        </b-alert>
                    </b-col>
                    <b-col v-else>
                        <b-spinner v-if="showSpinner" class="align-middle"></b-spinner>
                    </b-col>


                    <b-col>
                        <!-- Displays the profile's image -->
                        <b-img
                            ref="profile-photo"
                            :src= "'http://localhost:4941/api/v1/users/' + profileIDNumber + '/photo'"
                            onerror="this.src='../../../src/assets/placeholder-venue-image.png';"
                            fluid
                            alt="Profile Image"
                            thumbnail
                            @click="openImageModal"
                            style="cursor: pointer">
                        </b-img>
                        <br/>
                        <br/>
                        <b-button v-b-toggle.collapsePhoto block>
                            <span class="when-opened">Close</span> <span class="when-closed">Open</span>
                            Profile Picture Settings
                        </b-button>
                        <b-collapse id="collapsePhoto" class="mt-2">
                            <b-alert v-model="showSuccess" variant="success" dismissible>{{alertMessage}}</b-alert>
                            <b-alert v-model="showError" variant="danger" dismissible>{{alertMessage}}</b-alert>
                            <b-form-group
                                id="uploadPhoto"
                                label="Add/Replace your Profile Photo"
                                label-for="uploadPhotoForm">
                                <b-form-file
                                    id = "uploadPhotoForm"
                                    v-model="profilePhoto"
                                    placeholder="Choose a file..."
                                    drop-placeholder="Drop file here..."
                                    accept=".jpg, .png"
                                    :state="fileValidation"
                                ></b-form-file>
                                <b-form-invalid-feedback :state="fileValidation">
                                    {{profileInvalidMessage}}
                                </b-form-invalid-feedback>
                                <div class="mt-3">Selected file:
                                    <i>{{ profilePhoto ? profilePhoto.name : '' }}</i>
                                </div>
                                <div class="mt-3">File Size:
                                    <i>{{ profilePhoto ? (profilePhoto.size / (1024 * 1024)).toFixed(2) : '' }} MB</i>
                                </div>
                                <b-button @click="uploadProfilePhoto" block variant="success">
                                    Upload Profile Photo</b-button>
                                <b-button @click="openDeleteConfimModal" block variant="danger">
                                    Delete Profile Photo</b-button>
                            </b-form-group>
                        </b-collapse>
                    </b-col>
                </b-row>
                <b-modal ref="my-modal" hide-footer size="xl" title="Your profile picture">
                    <div class="d-block text-center" @click="openImageModal">
                        <b-img
                            :src= "'http://localhost:4941/api/v1/users/' + profileIDNumber + '/photo'"
                            fluid
                            alt="Profile Image"
                            thumbnail>
                        </b-img>
                    </div>
                </b-modal>
                <b-modal ref="image-full-modal" hide-footer size="xl" title="Your profile picture">
                    <div class="d-block text-center">
                        <b-img
                            :src= "'http://localhost:4941/api/v1/users/' + profileIDNumber + '/photo'"
                            fluid
                            alt="Profile Image"
                            thumbnail>
                        </b-img>
                    </div>
                </b-modal>
                <b-modal ref="delete-image-modal" hide-footer title="Confirm Delete">
                    <div class="d-block text-center">
                        <b-img
                            :src= "'http://localhost:4941/api/v1/users/' + profileIDNumber + '/photo'"
                            fluid
                            alt="Profile Image"
                            thumbnail>
                        </b-img>
                        <h5>Are you sure you want to delete profile photo?</h5>
                        <b-row>
                            <b-col>
                                <b-button variant="success" @click="hideDeleteModal" block>No</b-button>
                            </b-col>
                            <b-col>
                                <b-button variant="danger" @click="deleteProfilePhoto" block>Yes</b-button>
                            </b-col>
                        </b-row>
                    </div>
                </b-modal>
                <b-modal ref="edit-profile-modal" hide-footer title="Edit Your Profile">
                    <div class="d-block">
                        <!-- Alert when profile successfully saved -->
                        <b-alert v-model="showErrorEdit" variant="danger" dismissible>{{alertMessage}}</b-alert>
                        <b-form-group
                            id="givenNameField"
                            label="Given Name"
                            label-for="givenNameInput">
                            <b-input id="givenNameInput" :state="givenNameValidation" v-model="editGivenName"></b-input>
                        </b-form-group>
                        <b-form-group
                            id="familyNameField"
                            label="Family Name"
                            label-for="familyNameInput">
                            <b-input id="familyNameInput" :state="familyNameValidation" v-model="editFamilyName"></b-input>
                        </b-form-group>
                        <b-form-group
                            id="checkPasswordField"
                            label="Current Password"
                            label-for="checkPasswordInput">
                            <b-input id="checkPasswordInput" type="password" v-model="currentPassword"></b-input>
                        </b-form-group>
                        <b-form-group
                            id="newPasswordField"
                            label="New Password"
                            label-for="passwordInput">
                            <b-input id="passwordInput" type="password" v-model="editPassword"></b-input>
                        </b-form-group>
                    </div>
                    <b-button variant="success" @click="saveProfile" block>Save Profile</b-button>
                </b-modal>

            </div>
            <div v-else>
                You are not logged in!
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "UserProfile",
        props: ['authToken', 'profileID'],
        data() {
            return {
                profilePhoto: null,
                showSuccess: false,
                showSuccessEdit: false,
                showError: false,
                showErrorEdit: false,
                alertMessage: "",
                mainProfilePhoto: null,
                editGivenName: "",
                editFamilyName: "",
                currentPassword: "",
                editPassword: "",
                passwordValid: false,
                profileInvalidMessage: "",
                profile: "",
                venues: [],
                detailedVenues: [],
                adminVenues: [],
                showSpinner: false

            }
        },
        computed: {
            fileValidation() {
                if (this.profilePhoto === null) {
                    return null
                }
                if (this.profilePhoto.size > 1024 * 1024 * 20) {
                    this.profileInvalidMessage = "The file is too large (max is 20MB)!"
                }
                else if (this.profilePhoto.type !== 'image/jpeg' && this.profilePhoto.type !== 'image/png') {
                    this.profileInvalidMessage = "The file must be a png or a jpeg/jpg"
                }
                return this.profilePhoto.size <= 1024 * 1024 * 20 && (this.profilePhoto.type === 'image/jpeg'
                    || this.profilePhoto.type === 'image/png');
            },
            profileIDNumber() {
                return sessionStorage.getItem('profileID');
            },
            authTokenNumber() {
                return sessionStorage.getItem('accessToken');
            },
            givenNameValidation() {
                return this.editGivenName.trim().length > 0;
            },
            familyNameValidation() {
                return this.editFamilyName.trim().length > 0;
            },
        },
        mounted() {
            this.getUserInfo();
        },
        methods: {
            getUserInfo() {
                this.$http.get('http://localhost:4941/api/v1/users/'+this.profileIDNumber, {
                    headers: {
                        'X-Authorization': this.authTokenNumber
                    }
                })
                    .then(function(response) {
                        this.profile = response.data;
                    }, function(error) {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            uploadProfilePhoto() {
                if (this.fileValidation) {
                    let imageType = this.profilePhoto.type;
                    this.showError = false;
                    this.$http.put('http://localhost:4941/api/v1/users/'+this.profileID+"/photo", this.profilePhoto, {
                        headers: {
                            'X-Authorization': this.authToken,
                            'Content-Type': imageType,
                        },

                    }).then(function(response) {
                        if (response.ok) {
                            this.showSuccess = true;
                            this.alertMessage = "Profile Photo Added";
                            this.$router.go();
                        } else if (response.status === 400) {
                            this.showError = true;
                            this.alertMessage = "File is not an png or jpeg, or is too big"
                        }
                    }, function(error) {
                        this.error = error;
                        this.errorFlag = true;
                    });
                } else {
                    this.showError = true;
                    this.alertMessage = "File is too big, or no file selected."
                }
            },
            deleteProfilePhoto() {
                this.$http.delete('http://localhost:4941/api/v1/users/'+this.profileID+"/photo", {
                    headers: {
                        'X-Authorization': this.authToken,
                    },
                })
                    .then(function(response) {
                        if (response.ok) {
                            this.showSuccess = true;
                            this.alertMessage = "Profile Photo Deleted";
                            this.$router.go();
                        }
                    }, function(error) {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            checkUserPassword() {
                let self = this;
                let login = {
                    "username": this.profile.username,
                    "password": this.currentPassword
                };
                fetch('http://localhost:4941/api/v1/users/login', {
                    method: 'POST',
                    headers: {'content-type': 'application/json'},
                    body: JSON.stringify(login)
                }).then(res => res.json()
                    .then((response) => {
                        if (res.ok) {
                            sessionStorage.accessToken = JSON.parse(JSON.stringify(response)).token;
                            sessionStorage.profileID = JSON.parse(JSON.stringify(response)).userId;
                            self.passwordValid = true;
                            this.saveProfilePassword();
                        }

                    })
                ).catch(() => {
                    self.showError = true;
                    self.errorMessage = "Invalid User Credentials";
                });
            },
            saveProfilePassword() {
                if(this.passwordValid) {
                    let saveProfile = {
                        "givenName": this.editGivenName,
                        "familyName": this.editFamilyName,
                        "password": this.editPassword
                    };
                    this.saveProfileRequest(saveProfile, true);
                }

            },
            saveProfile() {
                if (this.givenNameValidation && this.familyNameValidation) {
                    if (this.editPassword.length > 0 && this.currentPassword.length > 0) {
                        this.checkUserPassword();
                    } else if (this.editPassword.length > 0 && this.currentPassword.length === 0) {
                        this.showErrorEdit = true;
                        this.alertMessage = "Please give current and past password";
                    } else {
                        let saveProfile = {
                            "givenName": this.editGivenName,
                            "familyName": this.editFamilyName
                        };
                        this.saveProfileRequest(saveProfile, false);
                    }
                } else {
                    this.showErrorEdit = true;
                    this.alertMessage = "Given and Family Names cannot be empty"
                }
            },
            saveProfileRequest(saveProfile, editPassword) {
                let self = this;
                fetch('http://localhost:4941/api/v1/users/'+this.profileID, {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json',
                        'X-Authorization': sessionStorage.getItem('accessToken')
                    },
                    body: JSON.stringify(saveProfile)
                }).then(function(response) {
                        if (response.ok) {
                            self.showSuccessEdit = true;
                            self.alertMessage = "Profile Saved";
                            if(editPassword) {
                                self.showSpinner = true;
                                setTimeout(function() {
                                    self.$router.go();
                                    self.showSpinner = false;
                                }, 1000)

                            }
                            self.getUserInfo();
                            self.hideEditModal()
                        }
                    }, function(error) {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            populateEditModal() {
                this.editGivenName = this.profile.givenName;
                this.editFamilyName = this.profile.familyName;
                this.openEditModal();
            },
            openEditModal() {
                this.$refs['edit-profile-modal'].show()
            },
            openImageModal() {
                this.$refs['image-full-modal'].show()
            },
            openDeleteConfimModal() {
                this.$refs['delete-image-modal'].show()
            },
            hideDeleteModal() {
                this.$refs['delete-image-modal'].hide()
            },
            hideEditModal() {
                this.$refs['edit-profile-modal'].hide()
            },
        }
    }
</script>

<style scoped>
    .collapsed > .when-opened,
    :not(.collapsed) > .when-closed {
        display: none;
    }
</style>
