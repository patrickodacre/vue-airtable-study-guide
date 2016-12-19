new Vue({
    name: 'MainApp',
    el: "#app",
    data: {
        name: '',
        note: '',
        studyCards: []
    },
    computed: {
        memorizedCards() {
            return this.studyCards.filter((card) => {
                return card.fields.Memorized
            })
        },
        unMemorizedCards() {
            return this.studyCards.filter((card) => {
                return !card.fields.Memorized
            })
        }
    },
    created,
    methods: {
        saveStudyCard,
        updateCardStatus,
        deleteCard

    }
})

/**
 * Step 1: Created Life Cycle Hook
 * 
 * Grab our current studyCards on startup and save them to the 'studyCards' array on our 'data' property.
 */
function created() {
    axios.get(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards?maxRecords=20&view=Main%20View&api_key=${airtableKey}`)
        .then((resp) => {
            console.log('response', resp)

            // 1-1 If we retrieve records successfully, add the to our studyCards list.
            if (resp.status === 200 && resp.data.records.length > 0) {
                this.studyCards = resp.data.records
            } else {
                console.error('Unable to retrieve study cards. Please refresh the page and try again.')
            }
        })
}

/**
 * Step 2: Save a New Card to Airtable
 */
function saveStudyCard() {

    // 2-1 return early if either of the required fields are empty
    if (!this.name || !this.note) {
        return
    }

    // 2-2 Create the payload object as stated in Airtable's api documentation
    const payload = {
        fields: {
            Name: this.name,
            Notes: this.note,
            // Memorized: false,
            Attachments: []
        }
    }

    // 2-3 Send the data
    axios.post(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards?api_key=${airtableKey}`, payload)
        .then((resp) => {

            if (resp.status === 200 && resp.data.id) {

                // 2-4 If we're successful, update the studyCards array
                this.studyCards.push(resp.data)

                // 2-5 clear the inputs.
                this.name = ''
                this.note = ''

                // 2-6 Material Lite isn't reactive, so we're going to manually remove the css class so our label re-appear YUCK
                document.getElementById('studyCardNameInput').classList.remove('is-dirty')
                document.getElementById('studyCardNoteInput').classList.remove('is-dirty')
            } else {
                // handle the error - not something we're doing now.
                console.error('Unable to save card.', payload)
            }
        })
}

/**
 * Step 3: Update Card Status - Memorized is TRUE or FALSE
 * 
 * @param (object) studyCard According to the API documentation, the entire studyCard object is required for a put.
 */
function updateCardStatus(studyCard) {

    // 3-1 Create the payload object.
    const payload = {
        fields: studyCard.fields
    }

    // 3-2 PUT request to the db to update the studyCard found at studyCard.id
    axios.put(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards/${studyCard.id}?api_key=${airtableKey}`, payload)
        .then((resp) => {

            if (resp.status === 200 && resp.data.id) {

                // 3-3 Find the updated card in our array and replace it.
                this.studyCards = this.studyCards.map((card) => {
                    if (resp.data.id === card.id) {
                        card = resp.data
                    }

                    return card
                })
            } else {
                // handle the error - not something we're doing now.
                console.error('Unable to update card.', payload)
            }

        })
}

/**
 * Step 4: Delete a Card
 * 
 * @param {number} studyCardID The .id for the card.
 */
function deleteCard(studyCardID) {

    // 4-1 Send the DELETE request for studyCardID
    axios.delete(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards/${studyCardID}?api_key=${airtableKey}`)
        .then((resp) => {

            // 4-2 If the delete is successful we'll filter the delete card from our studyCards array.
            if (resp.status === 200 && resp.data.deleted === true) {
                this.studyCards = this.studyCards.filter((card) => {
                    return card.id !== studyCardID
                })
            } else {
                // handle the error - not something we're doing now.
                console.error('Unable to delete card.')
            }
        })
}