new Vue({
    name: 'MainApp',
    el: "#app",
    data: {
        name: '',
        note: '',
        records: []
    },
    computed: {
        memorizedCards() {
            return this.records.filter((record) => {
                return record.fields.Memorized
            })
        },
        unMemorizedCards() {
            return this.records.filter((record) => {
                return !record.fields.Memorized
            })
        }
    },
    created,
    methods: {
        viewDetails,
        saveCard,
        updateCardStatus,
        deleteCard

    }
})

/**
 * Step 1: Created Life Cycle Hook
 * 
 * Grab our current records on startup and save them to the 'records' array on our 'data' property.
 */
function created() {
    axios.get(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards?maxRecords=20&view=Main%20View&api_key=${airtableKey}`)
        .then((resp) => {
            console.log('response', resp)
            this.records = resp.data.records
        })
}

/**
 * Step 2: Save a New Card to Airtable
 */
function saveCard() {

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

                // 2-4 If we're successful, update the records array
                this.records.push(resp.data)

                // 2-5 clear the inputs.
                this.name = ''
                this.note = ''

                // 2-6 Material Lite isn't reactive, so we're going to manually remove the css class so our label re-appear YUCK
                document.getElementById('recordNameInput').classList.remove('is-dirty')
                document.getElementById('recordNoteInput').classList.remove('is-dirty')
            } else {
                // handle the error - not something we're doing now.
                console.error('Unable to save card.', payload)
            }
        })
}

/**
 * Step 3: Update Card Status - Memorized is TRUE or FALSE
 * 
 * @param (object) record According to the API documentation, the entire record object is required for a put.
 */
function updateCardStatus(record) {

    // 3-1 Create the payload object.
    const payload = {
        fields: record.fields
    }

    // 3-2 PUT request to the db to update the record found at record.id
    axios.put(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards/${record.id}?api_key=${airtableKey}`, payload)
        .then((resp) => {

            console.log('updated the record', resp)

            if (resp.status === 200 && resp.data.id) {

                // 3-3 Find the updated card in our array and replace it.
                this.records = this.records.map((record) => {
                    if (resp.data.id === record.id) {
                        record = resp.data
                    }

                    return record
                })
            } else {
                // handle the error - not something we're doing now.
                console.error('Unable to update card.', payload)
            }

        })
}

/**
 * Step 4: Delete a Card
 */
function deleteCard(recordID) {

    // 4-1 Send the DELETE request for recordID
    axios.delete(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards/${recordID}?api_key=${airtableKey}`)
        .then((resp) => {

            // 4-2 If the delete is successful we'll filter the delete card from our records array.
            if (resp.status === 200 && resp.data.deleted === true) {
                this.records = this.records.filter((record) => {
                    return record.id !== recordID
                })
            }
        })
}



function viewDetails(recordID) {

    axios.get(`https://api.airtable.com/v0/appgyWdA8yP0KXZr4/My%20Study%20Cards/${recordID}?api_key=${airtableKey}`)
        .then((resp) => {
            console.log('resp', resp)
        })
}