<template>
    <div>
        <div class="fullPage" v-if="authToken">
            <h1 class="pageTitle">{{pageHeading}}</h1>
            <b-alert v-model="showError" variant="danger" dismissible>{{alertMessage}}</b-alert>
            <b-alert v-model="showSuccess" variant="success" dismissible>{{alertMessage}}</b-alert>
            <b-form-group
                id="venueNameField"
                label="Venue Name:"
                label-for="venueNameInput">
                <b-input
                    id="venueNameInput"
                    v-model="venue.venueName"
                    :state="venueNameValidation">
                </b-input>
            </b-form-group>

            <b-form-group
                v-if="pageHeading === 'Edit a Venue'"
                id="venueCategoryField"
                label="Category:"
                label-for="venueCategoryInput">
                <b-select
                    id="venueCategoryInput"
                    v-model="venue.category.categoryName"
                    :state="venueCategoryValidationEdit">
                    <option
                    v-for="category in categories" :value="category.categoryName">
                        {{category.categoryName}}</option>
                </b-select>
            </b-form-group>

            <b-form-group
                v-if="pageHeading === 'Add a Venue'"
                id="venueCategoryCreateField"
                label="Category:"
                label-for="venueCategoryInput">
                <b-select
                    id="venueCategoryCreateInput"
                    v-model="categoryId"
                    :state="venueCategoryValidationCreate">
                    <option v-for="category in categories"
                            :value="category.categoryId">
                        {{category.categoryName}}</option>
                </b-select>
            </b-form-group>

            <b-form-group
                id="venueShortDescriptionField"
                label="Short Description:"
                label-for="venueShortDescriptionInput">
                <b-input
                    id="venueShortDescriptionInput"
                    v-model="venue.shortDescription">
                </b-input>
            </b-form-group>

            <b-form-group
                id="venueLongDescriptionField"
                label="Long Description:"
                label-for="venueLongDescriptionInput">

                <b-textarea
                    id="venueLongDescriptionInput"
                    v-model="venue.longDescription"
                    rows="3"
                    max-rows="6">
                </b-textarea>
            </b-form-group>

            <b-form-group
                id="venueCityField"
                label="City:"
                label-for="venueCityInput">
                <b-input
                    id="venueCityInput"
                    v-model="venue.city"
                    :state="venueCityValidation">
                </b-input>
            </b-form-group>

            <b-form-group
                id="venueAddressField"
                label="Address:"
                label-for="venueAddressInput">
                <b-input
                    id="venueAddressInput"
                    v-model="venue.address"
                    :state="venueAddressValidation">
                </b-input>
            </b-form-group>

            <b-form-group
                id="venueLatitudeField"
                label="Latitude:"
                label-for="venueLatitudeInput">
                <b-input
                    id="venueLatitudeInput"
                    v-model="venue.latitude"
                    type="number"
                    :state="venueLatitudeValidation">
                </b-input>
                <b-form-invalid-feedback :state="venueLatitudeValidation">
                    Latitude must be between -90 and 90
                </b-form-invalid-feedback>
            </b-form-group>

            <b-form-group
                id="venueLongitudeField"
                label="Longitude:"
                label-for="venueLongitudeInput">
                <b-input
                    id="venueLongitudeInput"
                    v-model="venue.longitude"
                    :state="venueLongitudeValidation"
                    type="number">
                </b-input>
                <b-form-invalid-feedback :state="venueLongitudeValidation">
                    Longitude must be between -180 and 180
                </b-form-invalid-feedback>
            </b-form-group>
            <b-button variant="success" block @click="validateVenue">Save Venue</b-button>
        </div>
        <div class="fullPage" v-else>
            You are not logged in!
        </div>

    </div>
</template>

<script>
    export default {
        name: "AddVenue",
        props: {
            'categories': Array,
            'profile': Number,
            'authToken': String,
            venue: {
                default: function() {
                    return {
                        venueName: "",
                        category: {
                            categoryId: "",
                        },
                        city: "",
                        shortDescription: "",
                        longDescription: "",
                        address: "",
                        latitude: "",
                        longitude: ""
                    }
                },
            },
            'pageHeading': {
                default: function() {
                    return 'Add a Venue';
                }
            },
            'venueID': Number
        },
        data() {
            return {
                showError: false,
                showSuccess: false,
                alertMessage: "",
                categoryId: ""
            }
        },
        computed: {
            venueNameValidation() {
                if (this.venue.venueName.length === 0) {
                    return null;
                }
                return this.venue.venueName.trim().length > 0;
            },
            venueCategoryValidationEdit() {
                if (this.venue.category.categoryName.length === 0) {
                    return null;
                }
                return this.venue.category.categoryName.length > 0;
            },
            venueCategoryValidationCreate() {
                if (this.categoryId.length === 0) {
                    return null;
                }
                return this.categoryId > 0;
            },
            venueCityValidation() {
                if (this.venue.city.length === 0) {
                    return null;
                }
                return this.venue.city.trim().length > 0;
            },
            venueAddressValidation() {
                if (this.venue.address.length === 0) {
                    return null;
                }
                return this.venue.address.trim().length > 0;
            },
            venueLatitudeValidation() {
                if (this.venue.latitude.length === 0) {
                    return null;
                }
                if (this.venue.latitude > 90 || this.venue.latitude < -90) {
                    return false;
                }
                return this.venue.latitude.length === undefined || this.venue.latitude.length > 0;
            },
            venueLongitudeValidation() {
                if (this.venue.longitude.length === 0) {
                    return null;
                }
                if (this.venue.longitude > 180 || this.venue.longitude < -180) {
                    return false;
                }
                return this.venue.longitude.length === undefined ||this.venue.longitude.length > 0;
            },
        },
        methods: {
            validateVenue() {
                if(this.venueNameValidation && this.venueCategoryValidationCreate && this.venueCityValidation
                    && this.venueAddressValidation && this.venueLatitudeValidation && this.venueLongitudeValidation) {
                    this.showError = false;
                    this.venue.latitude = parseInt(this.venue.latitude);
                    this.venue.longitude = parseInt(this.venue.longitude);
                    this.saveVenue();
                } else if (this.venueNameValidation && this.venueCategoryValidationEdit && this.venueCityValidation
                    && this.venueAddressValidation && this.venueLatitudeValidation && this.venueLongitudeValidation) {
                    this.showError = false;
                    this.venue.latitude = parseInt(this.venue.latitude);
                    this.venue.longitude = parseInt(this.venue.longitude);
                    this.categoryId = this.findCategory(this.venue.category.categoryName);
                    this.saveEditVenue();
                } else {
                    this.showError = true;
                    this.alertMessage = "Something is wrong in the form!"
                }

            },
            findCategory(categoryName) {
                for (let i=0; i < this.categories.length; i++) {
                    if(this.categories[i].categoryName === categoryName) {
                        return this.categories[i].categoryId
                    }
                }
            },
            saveEditVenue() {
                let saveVenue = {
                    'venueName': this.venue.venueName,
                    'categoryId': this.categoryId,
                    'city': this.venue.city,
                    'shortDescription': this.venue.shortDescription,
                    'longDescription': this.venue.longDescription,
                    'address': this.venue.address,
                    'latitude': this.venue.latitude,
                    'longitude': this.venue.longitude
                };
                let self = this;
                fetch('http://localhost:4941/api/v1/venues/' + this.venueID, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Authorization': this.authToken
                    },
                    body: JSON.stringify(saveVenue)
                }).then(function(response) {
                    if (response.ok) {
                        self.$emit('venue-saved', true);
                    }

                }).catch(() => {
                    self.showError = true;
                    self.alertMessage = "Something went wrong!";
                });
            },
            saveVenue() {
                let saveVenue = {
                    'venueName': this.venue.venueName,
                    'categoryId': this.categoryId,
                    'city': this.venue.city,
                    'shortDescription': this.venue.shortDescription,
                    'longDescription': this.venue.longDescription,
                    'address': this.venue.address,
                    'latitude': this.venue.latitude,
                    'longitude': this.venue.longitude
                };
                let self = this;
                fetch('http://localhost:4941/api/v1/venues', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Authorization': sessionStorage.getItem('accessToken')
                    },
                    body: JSON.stringify(saveVenue)
                }).then(function(response) {
                        if (response.status === 201) {
                            self.resetForm();
                            self.showSuccess = true;
                            self.alertMessage = "Venue Successfully Saved"
                        }
                    }
                ).catch(() => {
                    self.showError = true;
                    self.alertMessage = "Something went wrong!";
                });
            },
            resetForm() {
                for (let key in this.venue) {
                    if (this.venue.hasOwnProperty(key)) {
                        this.venue[key] = "";
                    }
                }
            }
        }
    }
</script>

<style scoped>

</style>
