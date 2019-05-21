<template>
    <div v-if="detailedVenue">
        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Name:</b></b-col>
            <b-col>{{ detailedVenue.venueName }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Category:</b></b-col>
            <b-col>{{ detailedVenue.category.categoryName }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Admin Username:</b></b-col>
            <b-col>{{ detailedVenue.admin.username }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>City:</b></b-col>
            <b-col>{{ detailedVenue.city }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Address:</b></b-col>
            <b-col>{{ detailedVenue.address }}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Date of Addition:</b></b-col>
            <b-col>{{ new Date(detailedVenue.dateAdded).toLocaleDateString() }}</b-col>
        </b-row>
        <b-row class="mb-2" >
            <b-col sm="3" class="text-sm-right"></b-col>
            <b-col>
                <b-link @click="showFullDescription = !showFullDescription">
                    {{showFullDescription ? 'Hide' : 'Show'}} Full Description</b-link>
            </b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Description:</b></b-col>
            <b-col>{{ detailedVenue.shortDescription }} <p v-if="showFullDescription">{{ detailedVenue.longDescription }}</p></b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Mean Star Rating:</b></b-col>
            <b-col>{{ '&starf;'.repeat(parseInt(singleVenue.meanStarRating)) }} {{singleVenue.meanStarRating}}</b-col>
        </b-row>

        <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Mode Cost Rating:</b></b-col>
            <b-col>{{ '$'.repeat(parseInt(singleVenue.modeCostRating))}} {{ singleVenue.modeCostRating }}</b-col>
        </b-row>
        <b-container class="p-3 m-2 rounded bg-dark">
            <b-alert v-model="showSuccessPhoto" variant="success" dismissible>{{alertMessage}}</b-alert>
            <b-alert v-model="showErrorPhoto" variant="danger" dismissible>{{alertMessage}}</b-alert>
            <b-row v-if="detailedVenue.photos.length > 0" v-for="photo in detailedVenue.photos">
                <b-col>
                    <b-img rounded
                           thumbnail
                           :src= "'http://localhost:4941/api/v1/venues/' + singleVenue.venueId + '/photos/' + photo.photoFilename"
                           onerror="this.src='../../../src/assets/placeholder-venue-image.png';"
                           alt="Venue Image"
                           width="300px">
                    </b-img>
                    <div v-if="detailedVenue.admin.userId === parseInt(profileID)">
                        <b-button :disabled="photo.isPrimary" variant="primary" @click="makePhotoPrimary(photo)">Make Primary</b-button>
                        <b-button variant="danger" @click="deletePhoto(photo)">Delete Photo</b-button>
                    </div>

                </b-col>
            </b-row>
            <b-row v-if="detailedVenue.photos.length === 0">
                <h5 class="m-2" style="color: white">There are no photos!</h5>
            </b-row>
        </b-container>
        <b-container v-if="detailedVenue.admin.userId === parseInt(this.profileID)">
            <b-button class="m-1" v-b-toggle.collapseAddPhoto block variant="primary">Add a Photo</b-button>
            <b-collapse id="collapseAddPhoto" class="mt-2">
                <b-container class="p-3 rounded">
                    <b-form-group
                        id="uploadPhoto"
                        label="Add a Venue Photo"
                        label-for="uploadPhotoForm">
                        <b-form-file
                            id="uploadPhotoForm"
                            v-model="venuePhoto"
                            placeholder="Choose a file..."
                            drop-placeholder="Drop file here..."
                            accept=".jpg, .png"
                            :state="fileValidation"
                        ></b-form-file>
                        <b-form-invalid-feedback :state="fileValidation">
                            {{venuePhotoInvalidMessage}}
                        </b-form-invalid-feedback>
                        <div class="mt-3">Selected file:
                            <i>{{ venuePhoto ? venuePhoto.name : '' }}</i>
                        </div>
                        <div class="mt-3">File Size:
                            <i>{{ venuePhoto ? (venuePhoto.size / (1024 * 1024)).toFixed(2) : '' }} MB</i>
                        </div>
                        <b-button @click="uploadVenuePhoto" block variant="success">
                            Upload Venue Photo</b-button>
                    </b-form-group>

                </b-container>
            </b-collapse>
        </b-container>
        <b-container>
            <h4>Reviews</h4>
            <b-container v-if="reviews.length > 0" v-for="review in reviews" class="p-1 m-2 rounded bg-info" style="color: white">
                <b-row class="mb-2">
                    <b-col sm="2" class="text-sm-right"><b>Reviewer:</b></b-col>
                    <b-col>{{review.reviewAuthor.username}}</b-col>
                </b-row>
                <b-row class="mb-2">
                    <b-col sm="2" class="text-sm-right"><b>Review:</b></b-col>
                    <b-col>{{review.reviewBody}}</b-col>
                </b-row>
                <b-row class="mb-2">
                    <b-col sm="2" class="text-sm-right"><b>Star Rating:</b></b-col>
                    <b-col>{{'&starf;'.repeat(parseInt(review.starRating))}}</b-col>
                </b-row>
                <b-row class="mb-2">
                    <b-col sm="2" class="text-sm-right"><b>Cost Rating:</b></b-col>
                    <b-col>{{calculateCostRating(review)}}</b-col>
                </b-row>
                <b-row class="mb-2">
                    <b-col sm="2" class="text-sm-right"><b>Time Posted:</b></b-col>
                    <b-col>{{new Date(review.timePosted).toISOString().substr(0, 10)}}
                        {{new Date(review.timePosted).toLocaleTimeString()}}</b-col>
                </b-row>
            </b-container>
            <b-container v-if="reviews.length === 0" class="p-1 m-2 rounded bg-info">
                <h5 class="m-2" style="color: white">There are no reviews yet</h5>
            </b-container>
        </b-container>

        <b-container v-if="detailedVenue.admin.userId === parseInt(profileID)">
            <b-alert v-model="showSuccess" variant="success" dismissible>{{alertMessage}}</b-alert>
            <b-button class="m-1" v-b-toggle.collapseEditVenue block variant="primary">Edit Venue</b-button>
            <b-collapse id="collapseEditVenue" class="mt-2">
                <add-venue @venue-saved="savedSuccess" :venueID="singleVenue.venueId" :categories="categories"
                           :pageHeading="'Edit a Venue'" :venue="detailedVenue" :profileID="profileID"
                           :authToken="authToken">
                </add-venue>
            </b-collapse>
        </b-container>
    </div>
</template>

<script>
    import AddVenue from './AddVenue.vue'
    export default {
        name: "SingleVenue",
        props: ['authToken', 'profileID', 'venuesReviews','singleVenue', 'detailedVenue', 'categories'],
        data() {
            return {
                showFullDescription: false,
                showSuccess: false,
                showSuccessPhoto: false,
                showError: false,
                showErrorPhoto: false,
                alertMessage: "",
                venuePhoto: null,
                venuePhotoInvalidMessage: "",
                venuePhotos: []

            }
        },
        computed: {
            reviews() {
                return this.reverseSort();
            },
            fileValidation() {
                if (this.venuePhoto === null) {
                    return null
                }
                if (this.venuePhoto.size > 1024 * 1024 * 20) {
                    this.venuePhotoInvalidMessage = "The file is too large (max is 20MB)!"
                }
                else if (this.venuePhoto.type !== 'image/jpeg' && this.venuePhoto.type !== 'image/png') {
                    this.venuePhotoInvalidMessage = "The file must be a png or a jpeg/jpg"
                }
                return this.venuePhoto.size <= 1024 * 1024 * 20 && (this.venuePhoto.type === 'image/jpeg'
                    || this.venuePhoto.type === 'image/png');
            }
        },
        methods: {
            calculateCostRating(review) {
                if (review.costRating === 0) {
                    return "Free!";
                }
                return '$'.repeat(parseInt(review.costRating));
            },
            reverseSort() {
                function compare(a,b) {
                    const dateA = new Date(a.timePosted);
                    const dateB = new Date(b.timePosted);

                    let comparison = 0;
                    if (dateA < dateB) {
                        comparison = 1;
                    } else if (dateA > dateB) {
                        comparison = -1;
                    }
                    return comparison;
                }
                return this.venuesReviews.sort(compare);
            },
            savedSuccess() {
                this.showSuccess = true;
                this.alertMessage = "Venue Successfully Saved";
                this.$emit('venue-saved', true);
            },
            uploadVenuePhoto() {
                let self = this;
                if (this.fileValidation) {
                    let formData = new FormData();
                    formData.append('photo', this.venuePhoto);
                    formData.append('type', "file");
                    formData.append('description', "New Photo");
                    formData.append('makePrimary', 'false');
                    this.showError = false;
                    fetch('http://localhost:4941/api/v1/venues/'+this.singleVenue.venueId+"/photos", {
                        method: "POST",
                        headers: {
                            'X-Authorization': this.authToken
                        },
                        body: formData

                    }).then(function(response) {
                        if (response.ok) {
                            self.showSuccessPhoto = true;
                            self.alertMessage = "Venue Photo Added ... refreshing page ...";
                            setTimeout(function() {
                                self.$emit('refresh-page', true);
                            }, 2000);

                        } else if (response.status === 400) {
                            self.showErrorPhoto = true;
                            self.alertMessage = "File is not an png or jpeg, or is too big"
                        }
                    }, function(error) {
                        self.error = error;
                        self.errorFlag = true;
                    });
                } else {
                    self.showError = true;
                    self.alertMessage = "File is too big, or no file selected."
                }
            },
            makePhotoPrimary(photo) {
                let self = this;
                console.log(photo);
                fetch('http://localhost:4941/api/v1/venues/'+this.singleVenue.venueId+"/photos/" + photo.photoFilename +
                    "/setPrimary", {
                    method: "POST",
                    headers: {
                        'X-Authorization': this.authToken
                    },
                }).then(function(response) {
                    if (response.ok) {
                        self.showSuccessPhoto = true;
                        self.alertMessage = "Primary Photo Changed ... refreshing page ...";
                        setTimeout(function() {
                            self.$emit('refresh-page', true);
                        }, 2000);
                    }
                }, function(error) {
                    self.error = error;
                    self.errorFlag = true;
                });
            },
            deletePhoto(photo) {
                let self = this;
                fetch('http://localhost:4941/api/v1/venues/'+this.singleVenue.venueId+"/photos/" + photo.photoFilename, {
                    method: "DELETE",
                    headers: {
                        'X-Authorization': this.authToken
                    },
                }).then(function(response) {
                    if (response.ok) {
                        self.showSuccessPhoto = true;
                        self.alertMessage = "Venue Photo Deleted ... refreshing page ...";
                        setTimeout(function() {
                            self.$emit('refresh-page', true);
                        }, 2000);
                    }
                }, function(error) {
                    self.error = error;
                    self.errorFlag = true;
                });
            }
        },
        components: {
            AddVenue
        }
    }
</script>

<style scoped>
</style>
