<template>
    <div>
        <div v-if="detailedVenue.admin.userId !== parseInt(profileID) && userCanReview === true">
            <h2>{{selectedVenue.venueName}}</h2>
            <b-alert v-model="showError" variant="danger" dismissible>{{alertMessage}}</b-alert>
            <b-form-group
                id="reviewContentField"
                label="Review:"
                label-for="reviewContentInput">
                <b-textarea
                    id="reviewContentInput"
                    v-model="review.reviewBody"
                    rows="3"
                    max-rows="6"
                    :state="reviewContentValidation">
                </b-textarea>
            </b-form-group>
            <b-form-group
                id="starRatingField"
                label="Star Rating:"
                label-for="starRatingInput">
                <b-select
                    id="starRatingInput"
                    v-model="review.starRating"
                    :state="reviewStarRatingValidation">
                    <option :value="1">
                        {{'&starf;'}} - 1 star
                    </option>
                    <option v-for="option in starRatingOptions" :value="option.value">
                        {{'&starf;'.repeat(parseInt(option.value))}} - {{option.value}} stars
                    </option>
                </b-select>
            </b-form-group>

            <b-form-group
                id="costRatingField"
                label="Cost Rating:"
                label-for="costRatingInput">
                <b-select
                    id="costRatingInput"
                    v-model="review.costRating"
                    :state="reviewCostRatingValidation">
                    <option :value="0">
                        Free!
                    </option>
                    <option v-for="option in costRatingOptions" :value="option.value">
                        {{'$'.repeat(parseInt(option.value))}}
                    </option>
                </b-select>
            </b-form-group>
            <b-button variant="success" @click="saveReview" block>Post Review</b-button>
        </div>
        <div v-else-if="!userCanReview">
            You have already reviewed this venue!
        </div>
        <div v-else>
            You cannot review your own review!
        </div>
    </div>
</template>

<script>
    export default {
        name: "NewReview",
        props: ['detailedVenue', 'selectedVenue', 'profileID', 'authToken', "usersReviews"],
        data() {
            return {
                review: {
                    reviewBody: "",
                    starRating: "",
                    costRating: ""
                },
                starRatingOptions: [
                    {value: "2", text: "2 Stars"},
                    {value: "3", text: "3 Stars"},
                    {value: "4", text: "4 Stars"},
                    {value: "5", text: "5 Stars"},
                ],
                costRatingOptions: [
                    {value: "1", text: "1"},
                    {value: "2", text: "2"},
                    {value: "3", text: "3"},
                    {value: "4", text: "4"},
                ],
                showError: false,
                alertMessage: "",
            }
        },
        computed: {
            userCanReview() {
                let ok = [];
                for (let i = 0; i < this.usersReviews.length; i++) {
                    if(parseInt(this.usersReviews[i].venue.venueId) === parseInt(this.selectedVenue.venueId)) {
                        ok.push(false);
                    } else {
                        ok.push(true);
                    }
                }
                return !ok.includes(false);
            },
            reviewContentValidation() {
                if (this.review.reviewBody.length === 0) {
                    return null;
                }
                return this.review.reviewBody.trim().length > 0;
            },
            reviewStarRatingValidation() {
                if (this.review.starRating.length === 0) {
                    return null;
                }
                return this.review.starRating > 0;
            },
            reviewCostRatingValidation() {
                if (this.review.costRating.length === 0) {
                    return null;
                }
                return this.review.costRating >= 0;
            },
        },
        methods: {
            saveReview() {
                if (this.reviewContentValidation && this.reviewStarRatingValidation
                    && this.reviewCostRatingValidation) {
                    let review = {
                        "reviewBody": this.review.reviewBody,
                        "starRating": parseInt(this.review.starRating),
                        "costRating": parseInt(this.review.costRating),
                    };
                    let self = this;
                    fetch('http://localhost:4941/api/v1/venues/' + this.selectedVenue.venueId + '/reviews', {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                            'X-Authorization': this.authToken
                        },
                        body: JSON.stringify(review)
                    }).then(function (response) {
                        if(response.status === 201) {
                            self.$emit('review-saved', true);
                        } else {
                            self.showError = true;
                            self.alertMessage = "You have already reviewed this place!"
                        }
                    });
                } else {
                    this.showError = true;
                    this.alertMessage = "Please enter in all fields!"
                }
            }
        }
    }
</script>

<style scoped>

</style>
