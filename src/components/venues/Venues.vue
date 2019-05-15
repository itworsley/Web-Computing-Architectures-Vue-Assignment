<template>
    <div>
        <div class="fullPage">
            <h1 class="pageTitle">Search for a Venue</h1>
            <b-form-group
                id="queryCityField"
                label="City:"
                label-for="queryCity">
                <b-select id="queryCity" @mouseleave="disableSwitch = true" v-model="queryValues.city" :options="cities">
                </b-select>
            </b-form-group>
            <b-form-group
                id="queryNameField"
                label="Name:"
                label-for="queryName">
                <b-input id="queryName" v-model="queryValues.q"></b-input>
            </b-form-group>
            <b-form-group
                id="queryCategoryField"
                label="Category"
                label-for="queryCategory">
                <b-select id="queryCategory" v-model="queryValues.categoryId">
                    <option v-for="category in categories" :value="category.categoryId">{{category.categoryName}}</option>
                </b-select>
            </b-form-group>
            <b-form-group
                id="sortByField"
                label="Sort By"
                label-for="querySortBy"
                description="Note: You must allow the browser access to your location to sort by Distance">
                <b-radio-group id="querySortBy" v-model="queryValues.sortBy">
                    <b-radio value="STAR_RATING"  @change="showLocationError = false">
                        Star Rating {{starRatingDescription}}
                    </b-radio>

                    <b-radio value="COST_RATING" @change="showLocationError = false">
                        Cost Rating {{costRatingDescription}}
                    </b-radio>
                    <b-radio value="DISTANCE" @change="getUserLocation">
                        Distance {{distanceDescription}}
                    </b-radio>
                </b-radio-group>

                <b-form-checkbox id="reverseSort" @change="reverseValues" v-model="queryValues.reverseSort">
                    Reverse Sort
                </b-form-checkbox>
                <p v-if="queryValues.myLatitude && queryValues.myLongitude" style="font-size: 12px">
                    Your Location: {{queryValues.myLatitude}} {{queryValues.myLongitude}}
                </p>
            </b-form-group>
            <p v-if="showLocationError" style="color: red">{{showLocationErrorMessage}}</p>
            <b-form-group
                id="minStarRatingField"
                label="Minimum Star Rating"
                label-for="queryMinStarRating">
                <b-select
                    id="queryMinStarRating"
                    v-model="queryValues.minStarRating">
                    <option :value="1">
                        {{'&starf;'}} - 1 star
                    </option>
                    <option v-for="option in starRatingOptions" :value="option.value">
                        {{'&starf;'.repeat(parseInt(option.value))}} - {{option.value}} stars
                    </option>
                </b-select>
            </b-form-group>

            <b-form-group
                id="maxCostRatingField"
                label="Maximum Cost Rating"
                label-for="queryMaxCostRating">
                <b-select
                    id="queryMaxCostRating"
                    v-model="queryValues.maxCostRating">
                    <option :value="0">
                        Free!
                    </option>
                    <option v-for="option in costRatingOptions" :value="option.value">
                        {{'$'.repeat(parseInt(option.value))}}
                    </option>
                </b-select>
            </b-form-group>


            <b-button @click="populateQuery" variant="success">Search</b-button>
            <b-button @click="resetSearch" variant="warning">Clear Filter</b-button>
            <b-form-checkbox style="margin-top: 15px;" :disabled="disableSwitch || !authToken" @change="getAllVenuesAdmin" switch>Get all my administered venues</b-form-checkbox>
            <div style="margin-top: 50px;">
                <b-alert v-model="showSuccess" variant="success" dismissible>{{alertMessage}}</b-alert>
                <label>Per Page</label>
                <div v-if="!retrievingVenues">
                    <b-pagination
                        v-model="currentPage"
                        :total-rows="rows"
                        :per-page="perPage"
                        aria-controls="venues-table"
                        first-text="First"
                        prev-text="Prev"
                        next-text="Next"
                        last-text="Last"
                    ></b-pagination>
                    <p class="mt-3">Showing Venues: {{ calculateViews }}</p>
                </div>
                <div>
                    <b-spinner v-if="retrievingVenues" class="align-middle"></b-spinner>
                </div>

                <b-table outlined striped caption-top
                         id="venues-table"
                         :items="venues"
                         :fields="fields"
                         :busy="venues.length === 0 || retrievingVenues"
                         v-if="venues.length > 0"
                         :per-page="perPage"
                         :current-page="currentPage">
                    <div slot="table-busy" class="text-center my-2">
                        <b-spinner v-if="retrievingVenues" class="align-middle"></b-spinner>
                        <strong v-if="!retrievingVenues && venues.length === 0">Can't find any venues!</strong>
                    </div>
                    <template slot="categoryName" slot-scope="row">
                        {{categories[row.item.categoryId-1].categoryName}}
                    </template>
                    <template slot="starRating" slot-scope="row">
                        {{'&starf;'.repeat(parseInt(row.item.meanStarRating))}}
                        {{calculateMeanStarRating(row.item.meanStarRating)}}
                    </template>
                    <template slot="costRating" slot-scope="row">
                        {{'$'.repeat(parseInt(row.item.modeCostRating))}}
                        {{calculateModeCostRating(row.item.modeCostRating)}}
                    </template>
                    <template slot="totalDist" slot-scope="row">
                        {{calculateDistance(row.item.distance)}}
                    </template>
                    <template slot="primary_photo" slot-scope="row">
                        <b-img
                               :src= "'http://localhost:4941/api/v1/venues/' + row.item.venueId + '/photos/' + row.item.primaryPhoto"
                               onerror="this.src='../../../src/assets/placeholder-venue-image.png';"
                               fluid
                               alt="Venue Image"
                               width="250px"></b-img>
                    </template>
                    <template slot="actions" slot-scope="row">
                        <b-row>
                            <b-button size="sm" block @click="populateSingleVenueModal(row.item)" variant="info" class="mr-2" style="margin-bottom: 5px">
                                Show Details
                            </b-button>
                        </b-row>
                        <b-row>
                            <b-button size="sm" v-if="authToken" block @click="populateModal(row.item)" variant="info" class="mr-2">
                                Post a Review
                            </b-button>
                        </b-row>

                    </template>
                    <template slot="table-caption"><p style="font-size: 12px">Note: Distance is only available if you allow access to your location</p></template>
                </b-table>
                <b-container v-if="showAdminVenues && venues.length === 0">
                    <h4>Can't find any venues!</h4>
                </b-container>
            </div>
            <div>

                <b-modal size="xl" ref="view-single-venue-modal" id="viewSingleVenueModal" hide-footer>
                    <div>
                        <single-venue :categories="categories" :authToken="authToken" :profileID="profileID" :venuesReviews="venuesReviews"
                                      :singleVenue="selectedVenue" :detailedVenue="detailedVenue">
                        </single-venue>
                    </div>
                    <div slot="modal-title">
                        {{selectedVenue.venueName}}
                    </div>
                </b-modal>
            </div>
            <div>
                <b-modal ref="reviewModal" id="reviewModal" title="Post a Review" hide-footer>
                    <div>
                        <review @review-saved="successSaved" :usersReviews="usersReviews" :profileID="profileID"
                                :authToken="authToken" :detailedVenue="detailedVenue" :selectedVenue="selectedVenue">
                        </review>
                    </div>
                </b-modal>
            </div>
        </div>
    </div>
</template>

<script>
    import SingleVenue from './SingleVenue.vue'
    import Review from '../reviews/NewReview.vue'
    export default {
        name: "Venues",
        props: ['categories', 'profileID', 'authToken'],
        data() {
            return {
                venues:[],
                detailedVenues:[],
                adminVenues:[],
                cities: [],
                sortByOptions: [
                    {value: "STAR_RATING", text: "Star Rating (Highest - Lowest)"},
                    {value: "COST_RATING", text: "Cost Rating (Lowest - Highest)"},
                ],
                queryValues: {
                    city: "",
                    q: "",
                    categoryId: "",
                    sortBy: "",
                    myLatitude: "",
                    myLongitude: "",
                    reverseSort: false,
                    minStarRating: "",
                    maxCostRating: "",
                    disableSwitch: false
                },
                selectedVenue: "",
                detailedVenue: "",
                fields: [
                    {key:'venueName', label: 'Name'},
                    {key:'categoryName', label: 'Category'},
                    {key:'meanStarRating', label: 'Star Rating', thClass: 'd-none', tdClass: 'd-none'},
                    {key: 'starRating', label: 'Star Rating'},
                    {key:'modeCostRating', label: 'Cost Rating', thClass: 'd-none', tdClass: 'd-none'},
                    {key: 'costRating', label: 'Cost Rating'},
                    {key:'totalDist', label: 'Distance'},
                    {key:'primary_photo', label: 'Primary Photo'},
                    'actions'
                ],
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
                usersReviews: [],
                showSuccess: false,
                alertMessage: "",
                venuesReviews: [],
                starRatingDescription: "(High-Low)",
                costRatingDescription: "(Low-High)",
                distanceDescription: "(Closest)",
                showLocationError: false,
                showLocationErrorMessage: "",
                perPage: 10,
                currentPage: 1,
                retrievingVenues: false,
                showAdminVenues: false,
                disableSwitch: false
            }
        },
        mounted() {
            this.getAllVenues();
            this.getAllCities();
        },
        computed: {
            rows() {
                return this.venues.length
            },
            calculateViews() {
                if (this.currentPage === 1) {
                    if (this.venues.length === 0) {
                        return "0-0"
                    }
                    if (this.venues.length < this.currentPage * 10) {
                        return ((this.currentPage-1) * 10)+1 + "-" + this.venues.length
                    }
                    return this.currentPage + "-" + this.currentPage * 10;
                } else {
                    if (this.venues.length < this.currentPage * 10) {
                        return ((this.currentPage-1) * 10)+1 + "-" + this.venues.length
                    }
                    return ((this.currentPage-1) * 10)+1 + "-" + (this.currentPage) * 10
                }
            }
        },
        methods: {
            getAllVenues() {
                this.$http.get('http://localhost:4941/api/v1/venues')
                    .then(function(response) {
                        this.venues = response.data;
                    }, function(error) {
                        this.error = error;
                        this.errorFlag = true;
                    })
            },
            getAllVenuesAdmin() {
                this.showAdminVenues = !this.showAdminVenues;

                if (!this.showAdminVenues) {
                    this.detailedVenues.length = 0;
                    this.getAllVenues();
                }
                else {
                    let self = this;
                    this.$http.get('http://localhost:4941/api/v1/venues')
                        .then(function(response) {
                            this.venues = response.data;
                            self.getDetailedVenues();
                        }, function(error) {
                            this.error = error;
                            this.errorFlag = true;
                        })
                }

            },
            getDetailedVenues() {
                let self = this;
                for (let i = 0; i < this.venues.length; i++ ) {
                    this.$http.get('http://localhost:4941/api/v1/venues/' + this.venues[i].venueId)
                        .then(function(response) {
                            //this.detailedVenues.push(response.data);
                            if (self.getAdminVenues(response.data)) {
                                self.detailedVenues.push(this.venues[i]);
                            }
                        }, function(error) {
                            this.error = error;
                            this.errorFlag = true;
                        });
                }
                this.retrievingVenues = true;
                //this.clearVenues();
                setTimeout(function() {
                    self.venues = self.detailedVenues;
                    self.retrievingVenues = false;
                }, 500);
            },
            getAdminVenues(venue) {
                if (venue.admin.userId === parseInt(this.profileID)) {
                    this.adminVenues.push(venue);
                    return true;
                }
            },
            getAllCities() {
                this.$http.get('http://localhost:4941/api/v1/venues')
                    .then(function(response) {
                        for (let key in response.data) {
                            let newItem = response.data[key].city;
                            if (this.cities.indexOf(newItem) === -1) {
                                this.cities.push(newItem);
                                this.cities.sort();
                            }
                        }
                    }, function(error) {
                        this.error = error;
                        this.errorFlag = true;
                    })
            },

            getAllVenuesQuery(query) {
                this.venues=[];
                let self = this;
                this.$http.get('http://localhost:4941/api/v1/venues' + query)
                    .then(function(response) {
                        this.venues = response.data;
                        if (self.showAdminVenues) {
                            self.detailedVenues();
                        }
                    }, function(error) {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            getAllUsersReviews() {
                let self = this;
                this.$http.get('http://localhost:4941/api/v1/users/' + this.profileID + '/reviews', {
                    headers: {
                        'X-Authorization': this.authToken
                    }
                }).then(function(response) {
                    if (response.ok) {
                        self.usersReviews = JSON.parse(JSON.stringify(response.body));
                    }

                })
            },
            populateModal(row) {
                this.getAllUsersReviews();
                this.selectedVenue = row;
                let self = this;
                this.$http.get('http://localhost:4941/api/v1/venues/'+this.selectedVenue.venueId)
                    .then(function (response) {
                        if (response.ok) {
                            self.detailedVenue = JSON.parse(JSON.stringify(response.body));
                            self.$refs['reviewModal'].show();
                        }
                    }, function (error) {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            populateSingleVenueModal(row) {
                this.selectedVenue = row;
                this.getVenueReviews();
                let self = this;
                this.$http.get('http://localhost:4941/api/v1/venues/'+this.selectedVenue.venueId)
                    .then(function (response) {
                        if (response.ok) {
                            self.detailedVenue = JSON.parse(JSON.stringify(response.body));
                            self.$refs['view-single-venue-modal'].show();
                        }
                    }, function (error) {
                        this.error = error;
                        this.errorFlag = true;
                    });

            },
            getVenueReviews() {
                this.$http.get('http://localhost:4941/api/v1/venues/'+this.selectedVenue.venueId + '/reviews', {
                    headers: {'X-Authorization': this.authToken}})
                    .then(response => {
                        if (response.ok) {
                            this.venuesReviews = response.data;
                        }
                    });
            },
            populateQuery() {
                let query = "?";
                let keys = Object.keys(this.queryValues);
                let values = Object.values(this.queryValues);
                for (let i=0; i<keys.length; i++) {
                    if (values[i].toString().length > 0) {
                        query += keys[i] + "=" + values[i] + "&";
                    }
                }
                if (query[query.length -1] === '&') {
                    query = query.substr(0, query.length -1);
                }
                this.getAllVenuesQuery(query);
            },

            calculateDistance(distance) {
                if (distance === undefined) {
                    return "N/A"
                }
                return distance.toFixed(2) + "km"
            },
            calculateModeCostRating(costRating) {
                if (costRating === null) {
                    return 'N/A';
                }
                else if (!costRating > 0) {
                    return 'Free';
                }
            },
            calculateMeanStarRating(starRating) {
                if (starRating === null) {
                    return 'N/A';
                } else {
                    return starRating;
                }
            },
            resetSearch() {
                for (let key in this.queryValues) {
                    if (this.queryValues.hasOwnProperty(key)) {
                        this.queryValues[key] = "";
                    }
                }
                this.detailedVenues = [];
                this.getAllVenues();
            },
            reverseValues() {
                if (!this.queryValues.reverseSort) {
                    this.starRatingDescription = "(Low-High)";
                    this.costRatingDescription = "(High-Low)";
                    this.distanceDescription = "(Furthest)"
                } else {
                    this.starRatingDescription = "(High-Low)";
                    this.costRatingDescription = "(Low-High)";
                    this.distanceDescription = "(Closest)"
                }

            },
            successSaved() {
                this.showSuccess = true;
                this.alertMessage = "Review Successfully Posted";
                this.getAllVenues();
                this.$refs['reviewModal'].hide();
            },
            getUserLocation() {
                let self = this;
                this.showLocationError = false;
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        function success(position) {
                            self.showLocationError = false;
                            self.queryValues.myLatitude = position.coords.latitude;
                            self.queryValues.myLongitude = position.coords.longitude;
                        },
                        function error() {
                            self.showLocationError = true;
                            self.showLocationErrorMessage = "You must allow access to location!";
                            self.queryValues.sortBy = "";
                        }
                    )
                } else {
                    self.showLocationError = true;
                    self.showLocationErrorMessage = "Geolocation is not available in this browser!";
                }
            }
        },
        components: {
            SingleVenue,
            Review
        }
    }
</script>

<style scoped>


</style>
